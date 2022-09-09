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
    const chat = await Chat.findOne({ chatId }).exec();
    if (!chat) {
      const newChat = await Chat.create({
        chatId,
        user1: userArr[0],
        user2: userArr[1],
        messages: [],
        isUser1Online: userArr[0] === from,
        isUser2Online: userArr[1] === from,
      });
      return { error: false, chatId: newChat.chatId };
    } else {
      const allChat = await Chat.findOne({ chatId }, { chatId: 1 });
      return { error: false, chatId: allChat.chatId };
    }
  } catch (er) {
    return { error: true, chat: null, text: "Interval Server Error" };
  }
};

const updateChatMessages = async (data) => {
  try {
    const { from, to, message } = data;
    const user1 = await User.findOne({ email: from });
    const user2 = await User.findOne({ email: to });
    if (!user1 || !user2) return { error: true, chatId: null, text: 'User not found' };

    const userArr = [user1.email, user2.email].sort();
    const chatId = `${userArr[0]}&${userArr[1]}`;

    const chat = await Chat.findOneAndUpdate(
      { chatId },
      { $push: { messages: { message, from } } },
      { returnOriginal: false }
    ).exec();
    return { error: false, chatId: chat.chatId };
  } catch (_) {
    return { error: true, chatId: null, text: 'Interval Server Error' };
  }
};

const findAllChatsOfUser = async (email) => {
  try {
    const chats = await Chat.find().or([{ user1: email }, { user2: email }]).select({chatId: 1});
    return { error: false, chats };
  } catch (_) {
    return { error: true, chats: [] };
  }
};

module.exports = { startChat, updateChatMessages, findAllChatsOfUser };
