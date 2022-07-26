const { Chat, Message } = require("../models");

// @des create message
// @route POST /api/message/create
const createMessage = async (req, res) => {
  try {
    let { chatId, msg, date, from, to } = req.body;
    let id;

    if (!msg || !date) {
      return res.status(400).send({ message: "Please fill all fields" });
    }

    if (!chatId) {
      let chat = await Chat.create({ users: [from, to] });
      id = chat._id;
    }

    let message = await Message.create({ msg, date });

    if (!chatId) {
      message.chatId = id;
    }

    return res.status(200).send({ message: "Success", data: message });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
};
