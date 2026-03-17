const db = require("../config/db");

const ModuleMonitoring = {
  getStudentMonitoring: async () => {
    const query = `
    SELECT 
      u.id AS user_id,
      u.name,
      m.title AS last_module,
      MAX(COALESCE(ssp.completed_at, ssp.started_at)) AS last_access,
      COUNT(DISTINCT CASE WHEN ssp.status = 'completed' THEN ssp.step_id END) AS steps_completed,
      COALESCE((
        SELECT COUNT(*)
        FROM module_steps ms
        WHERE ms.module_id = ssp.module_id
      ), 0) AS total_steps,
      COALESCE(ROUND(
        COUNT(DISTINCT CASE WHEN ssp.status = 'completed' THEN ssp.step_id END)
        / NULLIF((
          SELECT COUNT(*)
          FROM module_steps ms
          WHERE ms.module_id = ssp.module_id
        ), 0) * 100
      ), 0) AS progress_percent,
      COALESCE(SUM(
        TIMESTAMPDIFF(SECOND, ssp.started_at, ssp.completed_at)
      ), 0) AS total_duration_seconds
    FROM users u
    LEFT JOIN student_step_progress ssp ON u.id = ssp.user_id
    LEFT JOIN modules m ON m.id = ssp.module_id
    GROUP BY u.id, ssp.module_id
    `;

    return new Promise((resolve, reject) => {
      db.query(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getModuleDashboard: async () => {
    const query = `
      SELECT
      m.id AS module_id,
      m.title,
      m.is_active,

      COUNT(DISTINCT smp.user_id) AS total_students,

      SUM(
      CASE
      WHEN smp.completed_at IS NOT NULL
      THEN 1
      ELSE 0
      END
      ) AS students_completed,

      ROUND(
      SUM(
      CASE
      WHEN smp.completed_at IS NOT NULL
      THEN 1
      ELSE 0
      END
      ) / COUNT(DISTINCT smp.user_id) * 100
      ) AS completion_percent

      FROM modules m

      LEFT JOIN student_module_progress smp
      ON smp.module_id = m.id

      GROUP BY m.id
      ORDER BY m.created_at DESC
      `;

    return new Promise((resolve, reject) => {
      db.query(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
};

module.exports = ModuleMonitoring;