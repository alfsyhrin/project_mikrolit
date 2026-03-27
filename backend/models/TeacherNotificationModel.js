const db = require("../config/db");

const TeacherNotification = {
  create: async (data) => {
    try {
      const query = `
        INSERT INTO teacher_notifications 
        (student_id, title, message, type, reference_id, reference_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.promise().query(query, [
        data.student_id,
        data.title,
        data.message,
        data.type,
        data.reference_id,
        data.reference_type
      ]);
      return result;
    } catch (error) {
      console.error("Error creating teacher notification:", error);
      throw error;
    }
  },

  getAll: (callback) => {
    const sql = `
      SELECT 
        tn.id, tn.title, tn.message, tn.type, 
        tn.reference_id, tn.reference_type,
        u.name AS student_name,
        tn.created_at
      FROM teacher_notifications tn
      JOIN users u ON tn.student_id = u.id
      ORDER BY tn.created_at DESC
    `;
    db.query(sql, callback);
  }
};

module.exports = TeacherNotification;