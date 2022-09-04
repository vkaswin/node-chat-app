const { Message, Chat } = require("../models");
const { getPagination } = require("../utils");
const socket = require("../socket");

// @des create message
// @route POST /api/message/create/:chatId
const createMessage = async (req, res) => {
  let chat, data, id;

  try {
    const {
      params: { chatId },
      body,
      user,
    } = req;

    id = user.id;

    chat = await Chat.findById(chatId, {
      users: 1,
      group: 1,
      favourites: 1,
      unseen: 1,
    });

    if (!chat) {
      return res.status(400).send({ message: "Invalid Chat Id" });
    }

    data = await (
      await Message.create({ ...body, chatId, sender: id })
    ).populate("reply");

    await Chat.findByIdAndUpdate(chatId, {
      $push: { unseen: data._id },
      $set: { latest: data._id },
    });

    socket.io.to(chatId).emit("receive-message", data);

    res.status(200).send({ message: "Success", data });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  } finally {
    if (!chat || !id || !data) return;

    if (chat.group) {
      let {
        users,
        unseen,
        group: { name, avatar, description },
        _id,
      } = chat.toObject();

      users.forEach((userId) => {
        socket.io.to(userId.toString()).emit("new-message", {
          msg: data.msg,
          date: data.date,
          count: unseen.length + 1,
          name,
          description,
          avatar,
          _id,
          type: "group",
        });
      });

      return;
    }

    chat = await chat.populate("users", {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      status: 1,
    });

    let { users, favourites, unseen, _id } = chat.toObject();

    users.forEach(({ _id: userId, ...user }) => {
      let type = favourites.some((id) => {
        return id.toString() === userId.toString();
      })
        ? "favourite"
        : "recent";

      socket.io.to(userId.toString()).emit("new-message", {
        ...user,
        userId,
        msg: data.msg,
        date: data.date,
        count: unseen.length + 1,
        msg: data.msg,
        date: data.date,
        _id,
        type,
      });
    });
  }
};

// @des get messages by chatId
// @route POST /api/message/:chatId
const getMessagesByChatId = async (req, res) => {
  try {
    const {
      params: { chatId },
      query: { page = 1, limit = 30 } = {},
    } = req;
    const total = await Message.find({ chatId }).countDocuments();
    const data = await Message.find({ chatId })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reply")
      .sort({ date: -1 })
      .transform((docs) => {
        return getPagination({
          list: docs.reverse(),
          page: +page,
          limit: +limit,
          total,
        });
      });
    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
  getMessagesByChatId,
};
