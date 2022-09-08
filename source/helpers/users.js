const User = require("../models/user");
const Chat = require("../models/chat");

const startChat = async (data) => {
  try {
    const {chatSocketId, message, from, to, time } = data;
    const user1 = await User.findOne({ email: from });
    const user2 = await User.findOne({ email: to });

    if (!user1 || !user2) return { error: true, chat: null };
    
    const userArr = [user1.email, user2.email].sort();
    const chatId = `${userArr[0]}&${userArr[1]}`;
    const chat = await Chat.findOne({ chatId }).exec();
    if (!chat) {
      const newChat = await Chat.create({
        chatId,
        user1: userArr[0],
        user2: userArr[1],
        messages: [{ message, from, time }],
        isUser1Online: userArr[0] === from,
        isUser2Online: userArr[1] === from,
      });
      await User.findOneAndUpdate(
        { email: from },
        { $set: { chatSocketId } },
      );
      return { error: false, chat: newChat, };
    } else {
      const allChat = await Chat.findOneAndUpdate(
        { chatId },
        { $push: { messages: { message, from, time } } },
        { returnOriginal: false }
      );
      await User.findOneAndUpdate(
        { email: from },
        { $set: { chatSocketId } },
      );
      return { error: false, chat: allChat };
    }
  } catch (er) {
    return { error: true, chat: null };
  }
};

// const addUser = ({ id, name, room }) => {
//   name = name.trim().toLowerCase();
//   room = room.trim().toLowerCase();

//   const existingUser = users.find(
//     (user) => user.room === room && user.name === name
//   );

//   if (!name || !room) return { error: "Username and room are required." };
//   if (existingUser) return { error: "Username is taken." };

//   const user = { id, name, room };

//   users.push(user);

//   return { user };
// };

// const removeUser = (id) => {
//   const index = users.findIndex((user) => user.id === id);

//   if (index !== -1) return users.splice(index, 1)[0];
// };

// const getUser = (id) => users.find((user) => user.id === id);
const getChatUser = async (id) => await User.findOne({ chatSocketId: id })

// const getUsersInRoom = (room) => users.filter((user) => user.room === room);

// module.exports = { startChat, addUser, removeUser, getUser, getUsersInRoom };
module.exports = { startChat, getChatUser };
