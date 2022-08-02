const { Message } = require("../models");

// @des create message
// @route POST /api/message/create
const createMessage = async (req, res) => {
  try {
    const {
      params: { chatId },
      body,
    } = req;

    let message = await Message.create({ ...body, chatId });
    return res.status(200).send({ message: "Success", data: message });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
};
