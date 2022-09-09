const User = require("../models/user");
const Chat = require("../models/chat");

const startChat = async (data) => {
  try {
    const { from, to } = data;
    const user1 = await User.findOne({ email: from });
    const user2 = await User.findOne({ email: to });

    if (!user1 || !user2)
      return { error: true, chat: null, text: "User not found" };

    const userArr = [user1.email, user2.email].sort();
    const chatId = `${userArr[0]}&${userArr[1]}`;
    const chat = await Chat.findOne({ chatId })
    if (!chat) {
      await Chat.create({
        chatId,
        users: [userArr[0], userArr[1]],
        messages: [],
      });
    }
    return { error: false, chatId };
  } catch (er) {
    return { error: true, chat: null, text: "Interval Server Error" };
  }
};

const updateChatMessages = async (data) => {
  try {
    const { from, to, message } = data;
    const user1 = await User.findOne({ email: from });
    const user2 = await User.findOne({ email: to });
    if (!user1 || !user2)
      return { error: true, chatId: null, text: "User not found" };

    const userArr = [user1.email, user2.email].sort();
    const chatId = `${userArr[0]}&${userArr[1]}`;

    await Chat.findOneAndUpdate(
      { chatId },
      { $push: { messages: { message, from } } },
    )
    return { error: false, chatId };
  } catch (_) {
    return { error: true, chatId: null, text: "Interval Server Error" };
  }
};

const findAllChatsOfUser = async (email) => {
  try {
    const chats = await Chat.find({ users: { $in: [email] } }).select({
      chatId: 1,
    });
    return { error: false, chats };
  } catch (_) {
    return { error: true, chats: [] };
  }
};

const updateUserStatus = async (email, status) => {
  try {
    await User.findOneAndUpdate({ email }, {
      $set: {
        isOnline: status
      }
    })
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = { startChat, updateChatMessages, findAllChatsOfUser, updateUserStatus };
