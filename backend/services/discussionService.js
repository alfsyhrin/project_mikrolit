const DiscussionModel = require('../models/discussionModel');

async function getDiscussionRooms(userId) {
  if (userId) {
    const rooms = await DiscussionModel.getDiscussionRoomWithUnread(userId);
    return rooms;
  }
  const rooms = await DiscussionModel.getDiscussionRooms();
  return rooms;
}

async function getRoomMessages(roomId) {
  const messages = await DiscussionModel.getMessagesByRoom(roomId);
  return messages;
}

async function sendMessage(userId, roomId, message) {
  if (!message || message.trim() === "") {
    throw new Error("Message cannot be empty");
  }

  const room = await DiscussionModel.getRoom(roomId);

  if (!room) {
    throw new Error("Discussion disabled");
  }

  if (room.is_active === 0) {
    throw new Error("Discussion is disabled for this module");
  }

  const messageId = await DiscussionModel.createMessage(roomId, userId, message);
  return messageId;
}

async function markRoomAsRead(roomId, userId) {
  await DiscussionModel.markMessagesAsRead(userId, roomId);
  return true;
}

module.exports = {
  getDiscussionRooms,
  getRoomMessages,
  sendMessage,
  markRoomAsRead
};