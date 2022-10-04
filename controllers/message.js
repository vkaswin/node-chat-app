const { Message, Chat } = require("../models");
const socket = require("../socket");
const mongoose = require("mongoose");

const query = [
  {
    $lookup: {
      from: "messages",
      localField: "reply",
      foreignField: "_id",
      as: "reply",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "sender",
      foreignField: "_id",
      as: "sender",
      pipeline: [
        {
          $project: {
            id: "$_id",
            _id: 0,
            name: 1,
            avatar: 1,
          },
        },
      ],
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
          sender: {
            $first: "$sender",
          },
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
];

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

    let { _id } = await Message.create({
      ...body,
      chatId,
      sender: id,
      seen: [id],
    });
    let [msg] = await Message.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: "messages",
          localField: "reply",
          foreignField: "_id",
          as: "reply",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
          pipeline: [
            {
              $project: {
                id: "$_id",
                avatar: 1,
                name: 1,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          chatId: 1,
          msg: 1,
          seen: 1,
          reply: {
            $cond: {
              if: { $gt: [{ $size: "$reply" }, 0] },
              then: {
                $first: "$reply",
              },
              else: null,
            },
          },
          date: 1,
          sender: {
            $first: "$sender",
          },
        },
      },
    ]);

    data = msg;

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
            sender: data.sender,
            msg: data.msg,
            date: data.date,
            type: "group",
            group: {
              name,
              avatar,
            },
          },
          data.sender.id,
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
          type,
          sender: data.sender,
          msg: data.msg,
          date: data.date,
        },
        data.sender.id,
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
      query: { page = 1, limit = 50 } = {},
    } = req;

    id = mongoose.Types.ObjectId(id);
    chatId = mongoose.Types.ObjectId(chatId);

    limit = +limit;
    page = +page;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    let total = await Message.find({
      chatId,
    }).countDocuments();

    const list = await Message.aggregate([
      {
        $match: {
          chatId,
          seen: { $eq: id },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit },
      ...query,
    ]);

    res
      .status(200)
      .send({ message: "Success", data: { list, hasMore: total > limit } });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des get unread messages by chatId
// @route POST /api/message/unread/:chatId/:msgId
const getMessagesByMsgId = async (req, res) => {
  try {
    let {
      user: { id },
      params: { chatId, msgId },
      query: { limit = 50, latest = 1 } = {},
    } = req;

    id = mongoose.Types.ObjectId(id);
    chatId = mongoose.Types.ObjectId(chatId);
    msgId = mongoose.Types.ObjectId(msgId);

    limit = +limit;
    latest = +latest;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    let message = await Message.findById(msgId);

    if (!message)
      return res.status(400).send({ message: "Message Id Not Found" });

    const total = await Message.find({
      chatId,
      date: { [latest ? "$gt" : "$lt"]: message.date },
    }).countDocuments();

    const list = await Message.aggregate([
      {
        $match: {
          chatId,
          date: { [latest ? "$gt" : "$lt"]: message.date },
        },
      },
      ...(!latest ? [{ $sort: { date: -1 } }] : []),
      { $limit: limit },
      ...query,
    ]);

    res.status(200).send({
      message: "Success",
      data: {
        list,
        hasMore: total - limit > 0,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des get new messages by chatId
// @route get /api/new/:chatId
const getNewMessagesByChatId = async (req, res) => {
  try {
    let {
      user: { id },
      params: { chatId },
      query: { limit = 50 } = {},
    } = req;

    id = mongoose.Types.ObjectId(id);
    chatId = mongoose.Types.ObjectId(chatId);

    limit = +limit;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    const total = await Message.find({
      chatId,
      seen: { $ne: id },
    }).countDocuments();

    const list = await Message.aggregate([
      {
        $match: {
          chatId,
          seen: { $ne: id },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
      { $limit: limit },
      ...query,
    ]);

    res.status(200).send({
      message: "Success",
      data: { list, total, hasMore: total > limit },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
  getMessagesByChatId,
  getMessagesByMsgId,
  getNewMessagesByChatId,
};
