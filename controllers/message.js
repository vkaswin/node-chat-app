const { Message, Chat } = require("../models");
const socket = require("../socket");

// @des create message
// @route POST /api/message/create/:chatId
const createMessage = async (req, res) => {
  try {
    const {
      params: { chatId },
      body,
      user: { id },
    } = req;

    let chat = await Chat.findById(chatId, { users: 1, group: 1 });

    if (!chat) {
      return res.status(400).send({ message: "Invalid Chat Id" });
    }

    let data = await (
      await Message.create({ ...body, chatId, sender: id })
    ).populate("reply");

    await Chat.findByIdAndUpdate(chatId, { $push: { messages: data._id } });

    if (chat.group) {
      chat.users.forEach((userId) => {
        socket.io?.to(userId.toString()).emit("new-message", {
          msg: data.msg,
          date: data.date,
          seen: data.seen,
          type: "group",
        });
      });
      return res.status(200).send({ message: "Success", data });
    }

    const { users } = chat;
    const userId = users.find((userId) => !userId.equals(id));
    socket.io?.to(userId.toString()).emit("new-message", {
      msg: data.msg,
      date: data.date,
      seen: data.seen,
      type: "recent",
    });
    res.status(200).send({ message: "Success", data });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  }
};

// @des get messages by chatId
// @route POST /api/message/:chatId
const getMessagesByChatId = async (req, res) => {
  try {
    const {
      params: { chatId },
      query: { page, limit },
    } = req;
    let data = await Message.find({ chatId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reply");
    res.status(200).send({ message: "Success", data: data.reverse() });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
  getMessagesByChatId,
};
