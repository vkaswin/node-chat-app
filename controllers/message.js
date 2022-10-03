const { Message, Chat } = require("../models");
const { getPagination } = require("../utils");
const socket = require("../socket");
const mongoose = require("mongoose");

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
    });

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    data = await Message.create({ ...body, chatId, sender: id, seen: [id] });
    data = await data.populate("reply");

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: data._id },
      $set: { latest: data._id },
    });

    socket.io.to(chatId).emit("message", data);

    res.status(200).send({ message: "Success", data });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  } finally {
    if (!chat || !id || !data) return;

    if (chat.group) {
      let {
        users,
        group: { name, avatar },
        _id,
      } = chat.toObject();

      users.forEach((id) => {
        let userId = id.toString();
        socket.io.to(userId).emit(
          "new-message",
          {
            _id,
            msg: data.msg,
            date: data.date,
            type: "group",
            group: {
              name,
              avatar,
            },
          },
          data.sender,
          userId
        );
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

    let { users, favourites, _id } = chat.toObject();

    users.forEach(({ _id: id }) => {
      let userId = id.toString();
      let user = users.find(({ _id }) => {
        return _id.toString() !== userId;
      });

      let type = favourites.some((id) => {
        return id.toString() === userId;
      })
        ? "favourite"
        : "recent";

      socket.io.to(userId).emit(
        "new-message",
        {
          _id,
          user,
          msg: data.msg,
          date: data.date,
          type,
        },
        data.sender,
        userId
      );
    });
  }
};

// @des get messages by chatId
// @route POST /api/message/:chatId
const getMessagesByChatId = async (req, res) => {
  try {
    let {
      user: { id },
      params: { chatId },
      query: { page = 1, limit = 30, type = null } = {},
    } = req;

    id = mongoose.Types.ObjectId(id);
    chatId = mongoose.Types.ObjectId(chatId);

    limit = +limit;
    page = +page;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    let total;

    if (type === "new") {
      total = await Message.find({
        chatId,
        seen: { $ne: id },
      }).countDocuments();
    } else {
      total = await Message.find({
        chatId,
      }).countDocuments();
    }

    const list = await Message.aggregate([
      {
        $match: {
          chatId,
          seen: { [type === "new" ? "$ne" : "$eq"]: id },
        },
      },
      {
        $sort: {
          date: type === "new" ? 1 : -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit },
      {
        $lookup: {
          from: "messages",
          localField: "reply",
          foreignField: "_id",
          as: "reply",
        },
      },
      {
        $addFields: {
          day: {
            $dateToString: {
              date: "$date",
              format: "%Y-%m-%d",
            },
          },
        },
      },
      {
        $sort: {
          day: 1,
          date: 1,
        },
      },
      {
        $group: {
          _id: "$day",
          messages: {
            $push: {
              _id: "$_id",
              chatId: "$chatId",
              sender: "$sender",
              msg: "$msg",
              seen: "$seen",
              date: "$date",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          messages: 1,
        },
      },
      {
        $sort: {
          day: 1,
        },
      },
    ]);

    const data = getPagination({ list, limit, page, total });

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
