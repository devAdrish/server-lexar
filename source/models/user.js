const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  photo: { type: String, default: "" },
  contact: { type: String, default: ""},
  address: { type: String, default: ""},
  website: { type: String, default: ""},
  occupation: { type: String, default: ""},
  age: { type: String, default: ""},
  about: { type: String, default: ""},
  role: { type: String, default: 'user'},
  chatSocketId: {type: String | Number, default: ""},
});

module.exports = mongoose.model("user", userSchema);