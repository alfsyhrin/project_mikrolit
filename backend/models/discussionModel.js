const db = require("../config/db");

const Discussion = {
  getDiscussionRooms: async () => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT 
          dr.id AS room_id,
          m.title,
          COUNT(DISTINCT dm.id) AS message_count
        FROM discussion_rooms dr
        LEFT JOIN modules m ON dr.module_id = m.id
        LEFT JOIN discussion_messages dm
          ON dr.id = dm.room_id
        WHERE dr.is_active = 1
        GROUP BY dr.id
        ORDER BY dr.created_at DESC
        `,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  getMessagesByRoom: async (roomId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT
          dm.id,
          dm.message as message_text,
          dm.created_at,
          u.name as user_name,
          u.role
        FROM discussion_messages dm
        JOIN users u ON dm.user_id = u.id
        WHERE dm.room_id = ?
        ORDER BY dm.created_at ASC
        `,
        [roomId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  createMessage: async (roomId, userId, message) => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        INSERT INTO discussion_messages
          (room_id, user_id, message)
        VALUES (?, ?, ?)
        `,
        [roomId, userId, message],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  },

  getRoom: async (roomId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT id, module_id, title, is_active
        FROM discussion_rooms
        WHERE id = ?
        LIMIT 1
        `,
        [roomId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows && rows[0] ? rows[0] : null);
        }
      );
    });
  },

  getDiscussionRoomWithUnread: async (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT
          dr.id as room_id,
          m.title,
          COUNT(DISTINCT dm.id) as message_count,
          COUNT(DISTINCT dm.id) - COUNT(DISTINCT dmr.message_id) as unread_count
        FROM discussion_rooms dr
        LEFT JOIN modules m ON dr.module_id = m.id
        LEFT JOIN discussion_messages dm
          ON dr.id = dm.room_id
        LEFT JOIN discussion_message_reads dmr
          ON dm.id = dmr.message_id
          AND dmr.user_id = ?
        WHERE dr.is_active = 1
        GROUP BY dr.id
        ORDER BY dr.created_at DESC
        `,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  markMessagesAsRead(userId, roomId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id FROM discussion_messages WHERE room_id = ?`,
        [roomId],
        (err, rows) => {
          if (err) return reject(err);
          if (!rows || rows.length === 0) return resolve(true);
          let pending = rows.length;
          for (const msg of rows) {
            db.query(
              `INSERT IGNORE INTO discussion_message_reads (message_id, user_id) VALUES (?, ?)`,
              [msg.id, userId],
              (err2) => {
                if (err2) return reject(err2);
                pending--;
                if (pending === 0) resolve(true);
              }
            );
          }
        }
      );
    });
  }

};

module.exports = Discussion;