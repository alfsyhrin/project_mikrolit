const db = require("../config/db");

const StepResource = {
    // ✅ Ubah nama function
    createResource: (data, callback) => {
        const sql = `
            INSERT INTO module_step_resources
            (step_id, resource_type, resource_path)
            VALUES (?, ?, ?)
            `;
        // ✅ SQL yang benar
        db.query(sql, [data.step_id, data.resource_type, data.resource_path], callback);
    },

    // add to backend/models/StepResourceModel.js

getResourcesByStep: (stepId, callback) => {
    const sql = `
        SELECT
            resource_type,
            resource_path
        FROM module_step_resources
        WHERE step_id = ?
        ORDER BY id ASC
    `;
    db.query(sql, [stepId], callback);
},

getResourcesByModule: (moduleId, callback) => {
    const query = `
        SELECT r.*, s.step_number
        FROM module_step_resources r
        JOIN module_steps s
        ON r.step_id = s.id
        WHERE s.module_id = ?
        ORDER BY s.step_number
        `;
    db.query(query, [moduleId], callback);
}
};

module.exports = StepResource;