const TeacherNotification = require("../models/TeacherNotificationModel");
const { getIO } = require("../config/socket");

const createTeacherNotification = async (data) => {
  const result = await TeacherNotification.create(data);
  
  const notification = {
    id: result.insertId,
    ...data,
    created_at: new Date()
  };

  const io = getIO();
  
  // Kirim ke teacher tertentu via socket
  emit("TeacherNotification", notification);
};

module.exports = {
  createTeacherNotification
};