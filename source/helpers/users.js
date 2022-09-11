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
    const chat = await Chat.findOne({ chatId });
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
      { $push: { messages: { message, from, time: new Date() } } }
    );
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

const getFriendsSocketIds = async (email) => {
  try {
    const { friends } = await User.findOne({ email: email }).select({
      friends: 1,
    });

    if (friends.length > 0) {
      const promises = friends.map(async (e) => {
        const friend = await User.findOne({ email: e }).select({
          email: 1,
          socketId: 1,
          isOnline: 1,
          _id: 0,
        });
        return friend;
      });
      const list = await Promise.all(promises);
      return list;
    }
    return [];
  } catch (_) {
    return [];
  }
};

const updateUserStatus = async ({ email, status, socketId, io }) => {
  try {
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          isOnline: status,
          socketId,
        },
      }
    );
    const friends = await getFriendsSocketIds(email);
    if (friends.length > 0) {
      friends.forEach((f) => {
        io.to(f.socketId).emit("userOnlineStatusUpdate", {
          text: `${email} is ${status}!`,
          user: email,
          isOnline: status,
        });
      });
    }
    return true;
  } catch {}
};


module.exports = {
  startChat,
  updateChatMessages,
  findAllChatsOfUser,
  updateUserStatus,
  getFriendsSocketIds,
};
