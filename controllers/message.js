const { Message, Chat } = require("../models");

// @des create message
// @route POST /api/message/create/:chatId
const createMessage = async (req, res) => {
  try {
    const {
      params: { chatId },
      body,
    } = req;

    let data = await (
      await Message.create({ ...body, chatId })
    ).populate("reply");
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
    let data = await Message.find({ chatId: chatId })
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
