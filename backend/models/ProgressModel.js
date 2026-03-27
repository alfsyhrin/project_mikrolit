const db = require("../config/db");

const StudentProgressModel = {

    async findModuleProgress(userId, moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT *
                 FROM student_module_progress
                 WHERE user_id = ?
                 AND module_id = ?`,
                [userId, moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows[0] || null);
                }
            );
        });
    },

    async countModuleSteps(moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) as total
                 FROM module_steps
                 WHERE module_id = ?`,
                [moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0].total : 0);
                }
            );
        });
    },

    async createModuleProgress(userId, moduleId, totalSteps) {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO student_module_progress
                (user_id, module_id, total_steps, status, started_at)
                VALUES (?, ?, ?, 'in_progress', NOW())`,
                [userId, moduleId, totalSteps],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                }
            );
        });
    },

    async getStepInfo(stepId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT id,module_id,step_number
                FROM module_steps
                WHERE id=?`,
                [stepId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows[0] || null);
                }
            );
        });
    },

    async getModuleProgress(userId, moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT completed_steps, total_steps
                 FROM student_module_progress
                 WHERE user_id = ? AND module_id = ?`,
                [userId, moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            ); 
        });
    },

    async isStepCompleted(userId, stepId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT id
                FROM student_step_progress
                WHERE user_id = ? AND step_id = ? AND status = 'completed'
                LIMIT 1`,
                [userId, stepId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(!!(rows && rows.length));
                }
            );
        });
    },

    async startStep(userId, moduleId, stepId) {
        return new Promise((resolve, reject) => {
            const query = `
            INSERT INTO student_step_progress
            (user_id, module_id, step_id, status, started_at, created_at)
            VALUES (?, ?, ?, 'in_progress', NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            started_at = IF(started_at IS NULL, NOW(), started_at)
            `;
            db.query(query, [userId, moduleId, stepId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    async completeStep(userId, moduleId, stepId) {
        return new Promise((resolve, reject) => {
            const query = `
            UPDATE student_step_progress
            SET
                status = 'completed',
                completed_at = NOW()
            WHERE
                user_id = ?
                AND module_id = ?
                AND step_id = ?
            `;

            db.query(query, [userId, moduleId, stepId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    async updateModuleProgress(userId, moduleId, completedSteps, progressPercent, status) {
        return new Promise((resolve, reject) => {
            if (status === "completed") {
                db.query(
                    `UPDATE student_module_progress
                    SET
                    completed_steps = ?,
                    progress_percent = ?,
                    status = ?,
                    completed_at = NOW()
                    WHERE user_id = ? AND module_id = ?`,
                    [completedSteps, progressPercent, status, userId, moduleId],
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                );
            } else {
                db.query(
                    `UPDATE student_module_progress
                    SET
                    completed_steps = ?,
                    progress_percent = ?,
                    status = ?
                    WHERE user_id = ? AND module_id = ?`,
                    [completedSteps, progressPercent, status, userId, moduleId],
                    (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    }
                );
            }
        });
    },

    getModuleWithProgress(userId) {
        return new Promise((resolve, reject) => {
            db.query( `
                SELECT
                m.id as module_id,
                m.title,
                m.description,

                COUNT(ms.id) as total_steps,

                COALESCE(smp.completed_steps,0) as completed_steps,
                COALESCE(smp.progress_percent,0) as progress_percent,

                COALESCE(smp.status,'not_started') as status

                FROM modules m

                LEFT JOIN module_steps ms
                ON ms.module_id=m.id

                LEFT JOIN student_module_progress smp
                ON smp.module_id=m.id
                AND smp.user_id=?

                GROUP BY m.id
                ORDER BY m.created_at ASC
                `,
                [userId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                }
            );
        });
    },

    async getModulesWithProgress(userId) {
        return new Promise((resolve, reject) => {
            db.query(
            `SELECT m.*, IFNULL(p.completed_steps, 0) AS completed_steps, IFNULL(p.progress_percent, 0) AS progress_percent
            FROM modules m
            LEFT JOIN student_module_progress p ON m.id = p.module_id AND p.user_id = ?
            ORDER BY m.id`,
            [userId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            }
            );
        });
    },

    async getModuleSteps(moduleId){
        return new Promise((resolve, reject) => {
            db.query(
                `
                SELECT
                id,
                module_id,
                step_title,
                step_number
                FROM module_steps
                WHERE module_id=?
                ORDER BY step_number ASC
                `,
                [moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                    }
            );
        });
    },

    getCompletedSteps(userId, moduleId) {
        return new Promise((resolve, reject) => {
            db.query(`
                SELECT completed_steps
                FROM student_module_progress
                WHERE user_id=? AND module_id=?
                `,
                [userId,moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0].completed_steps : 0);
                }
            );
        });
    }
};

module.exports = StudentProgressModel;