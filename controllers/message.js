const { Message, Chat } = require("../models");
const socket = require("../sockets");

// @des create message
// @route POST /api/message/create/:chatId
const createMessage = async (req, res) => {
  try {
    const {
      params: { chatId },
      body,
      user: { id },
    } = req;

    let chat = await Chat.findById(chatId, { users: 1 }).populate(
      "users",
      { _id: 1, name: 1, email: 1 },
      { _id: { $ne: id } }
    );

    if (!chat) {
      return res.status(400).send({ message: "Invalid Chat Id" });
    }

    const {
      users: [user],
    } = chat;

    let data = await (
      await Message.create({ ...body, chatId, sender: id })
    ).populate("reply");
    const userId = user._id.toString();
    socket.io?.to(userId).emit("receive-message", data);
    socket.io?.to(userId).emit("new-message", data);
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: data._id } });
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
