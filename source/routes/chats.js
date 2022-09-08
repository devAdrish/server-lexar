const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Chat = require("../models/chat");

const Response = require("../response");
const preparedResponse = new Response();

router.post("/chatMessage/:to", async (req, res) => {
  try {
    const { message, from, time } = req.body;
    const user1 = await User.findOne({ email: from });
    const user2 = await User.findOne({ email: req.params.to });

    if (!user1 || !user2)
      return res.status(400).send(preparedResponse.error("User not found"));
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
      if(user2.chatSocketId){
        res.io.of("/chat").to(user2.chatSocketId).emit("message", { message, from, time });
      }
      return res.status(200).send(preparedResponse.success(newChat));
    } else {
      const allChat = await Chat.findOneAndUpdate(
        { chatId },
        { $push: { messages: { message, from, time } } },
        { returnOriginal: false }
      );
      console.log('====================================');
      console.log(user2.chatSocketId, res.io);
      console.log('====================================');
     
        res.io.of("/chat").to(user2.chatSocketId).emit("message", { message, from, time });
  
      return res.status(200).send(preparedResponse.success(allChat.messages));
    }
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

module.exports = router;
