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
  }
};

module.exports = ModuleMonitoring;