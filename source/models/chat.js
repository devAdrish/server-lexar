const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user1: String,
  user2: String,
  messages: [ { message: String, from: String  } ],
  lastMessageSeen:  Boolean,
  isUser1Online: Boolean,
  isUser2Online: Boolean,
  chatId : { type: String, unique: true }
});

module.exports = mongoose.model("chat", chatSchema);