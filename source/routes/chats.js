const express = require("express");
const router = express.Router();
const Chat = require("../models/chat");

const Response = require("../response");
const preparedResponse = new Response();

router.get("/chat/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    if (!user1 || !user2)
      return res.status(404).send(preparedResponse.error("Incomplete Data"));
    const userArr = [user1, user2].sort();
    const chatId = `${userArr[0]}&${userArr[1]}`;
    const chat = await Chat.findOne({ chatId }).exec();
    return res.status(200).send(preparedResponse.success(chat));
  } catch (err) {
    return res.status(500).send(preparedResponse.serverError(err.toString()));
  }
});

module.exports = router;
