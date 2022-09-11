const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [],
  messages: [ { message: String, from: String, time: Date  } ],
  lastMessageSeen:  Boolean,
  chatId : { type: String, unique: true }
});

module.exports = mongoose.model("chat", chatSchema);