const { Message, Chat } = require("../models");
const socket = require("../socket");

// @des create message
// @route POST /api/message/create/:chatId
const createMessage = async (req, res) => {
  const {
    params: { chatId },
    user: { id },
    body,
  } = req;
  let chat, message, users;

  try {
    chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    users = [...chat.users];

    message = await Message.create({
      ...body,
      chatId,
      sender: id,
      seen: [id],
    });

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: message._id },
      $set: { latest: message._id },
    });

    message = await (
      await message.populate("reply")
    ).populate("sender", "avatar name status email");

    message = message.toObject();
    message.sender.id = message.sender._id;
    delete message.sender._id;

    res.status(200).send({ message: "Success", data: message });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  } finally {
    if (!chat || !message) return;

    if (!chat.group) {
      chat = await chat.populate({
        path: "users",
        select: "name avatar email status",
      });
    }

    let rooms = socket.getRooms();

    if (!rooms) return;

    users.forEach((userId) => {
      userId = userId.toString();
      if (!rooms.has(userId)) return;
      socket.io.to(userId).emit("message", { message, chat, userId });
    });
  }
};

module.exports = {
  createMessage,
};
