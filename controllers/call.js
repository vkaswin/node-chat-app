const { Call, Chat } = require("../models");
const socket = require("../socket");

const initiateCall = async (req, res) => {
  try {
    const {
      user: { id },
      params: { chatId },
      body: { date, type, offer },
    } = req;

    if (!date || !type || !offer)
      return res.status(400).send({ message: "Please fill all fields" });

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Invalid Chat Id" });

    const data = await Call.create({
      users: chat.users,
      chatId,
      date,
      type,
      initiatedBy: id,
    });

    const userId = chat.users.find((user) => user !== id);
    console.log(userId);
    socket.io.to(userId).emit("offer", offer);
    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const callHistory = async (req, res) => {
  try {
    const {
      user: { id },
      params: { limit, page },
    } = req;

    const calls = await Call.find({ users: id })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        "users",
        { _id: 1, name: 1, email: 1, avatar: 1, status: 1 },
        { _id: { $ne: id } }
      );

    const data = calls.map(
      ({
        users: [user],
        chatId,
        initiatedBy,
        date,
        type,
        updatedAt,
        createdAt,
      }) => {
        return { user, chatId, initiatedBy, date, type, createdAt, updatedAt };
      }
    );

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  initiateCall,
  callHistory,
};
