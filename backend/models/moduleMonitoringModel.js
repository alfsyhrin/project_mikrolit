const db = require("../config/db");

const ModuleMonitoring = {
  getStudentMonitoring: async () => {
      const query = `
      SELECT 
        u.id AS user_id,
        u.name,
        m.id AS module_id,
        m.title AS last_module,
        MAX(COALESCE(ssp.completed_at, ssp.started_at)) AS last_access,
        COUNT(DISTINCT CASE WHEN ssp.status = 'completed' THEN ssp.step_id END) AS steps_completed,
        COALESCE(smp.total_steps, 0) AS total_steps,
        COALESCE(smp.progress_percent, 0) AS progress_percent,
        COALESCE(SUM(
          TIMESTAMPDIFF(SECOND, ssp.started_at, ssp.completed_at)
        ), 0) AS total_duration_seconds,
        COALESCE(COUNT(DISTINCT ssd.id), 0) AS discussion_count
      FROM users u
      LEFT JOIN student_module_progress smp ON u.id = smp.user_id
      LEFT JOIN student_step_progress ssp ON u.id = ssp.user_id 
          AND ssp.module_id = smp.module_id
      LEFT JOIN modules m ON m.id = smp.module_id
      LEFT JOIN student_step_discussions ssd ON ssd.user_id = u.id 
          AND ssd.module_id = smp.module_id
      WHERE u.role = 'mahasiswa'
      GROUP BY u.id, smp.module_id
      ORDER BY u.id
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
      LEFT JOIN student_module_progress smp ON smp.module_id = m.id
      LEFT JOIN users u ON u.id = smp.user_id
      WHERE u.role = 'mahasiswa' OR smp.user_id IS NULL
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.query(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getCompletedStudents: async (moduleId) => {
    const query = `
      SELECT
        u.id AS user_id,
        u.name,
        u.nidn,
        smp.completed_at,
        TIMESTAMPDIFF(SECOND, smp.started_at, smp.completed_at) AS duration_seconds
      FROM student_module_progress smp
      JOIN users u ON u.id = smp.user_id
      WHERE
        smp.module_id = ?
        AND smp.completed_at IS NOT NULL
        AND u.role = 'mahasiswa'
      ORDER BY smp.completed_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [moduleId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

module.exports = ModuleMonitoring;