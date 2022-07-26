const { Chat } = require("../models");

// @des Get all messages by chatId
// @route GET /api/chat
const getAllChat = async (req, res) => {
  try {
    const {
      user: { userId },
    } = req;

    let chat = await Chat.find({ users: { $in: userId } }).populate("users", {
      userName: 1,
      email: 1,
      _id: 1,
    });

    res.status(200).send({ data: chat, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getAllChat,
};
