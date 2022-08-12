const { Chat } = require("../models");

// @des Get all messages by chatId
// @route GET /api/chat
const getAllChat = async (req, res) => {
  try {
    const {
      user: { userId },
    } = req;

    const chats = await Chat.find({
      users: { $in: userId },
    }).populate("users", { _id: 1, name: 1, email: 1 });

    let data = chats.map(({ users, createdAt, updatedAt, __v, _id }) => {
      return {
        _id,
        user: users.find((user) => !user._id.equals(userId)),
        createdAt,
        updatedAt,
        __v,
      };
    });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getAllChat,
};
