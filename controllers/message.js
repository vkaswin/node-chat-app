const { Message, Chat } = require("../models");
const socket = require("../socket");
const mongoose = require("mongoose");

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

    let rooms = socket.getRooms();

    if (!rooms) return;

    users.forEach((userId) => {
      userId = userId.toString();
      if (!rooms.has(userId)) return;
      socket.io.to(userId).emit("message", { message, chat, userId });
    });
  }
};

const handleReaction = async (req, res) => {
  let {
    params: { msgId },
    user: { id },
    body: { reaction },
  } = req;
  try {
    let msg = await Message.findById(msgId);

    if (!msg) return res.status(400).send({ message: "Message Id Not Found" });

    let isExist = await Message.findOne({
      _id: msgId,
      reactions: {
        $elemMatch: {
          user: { $eq: id },
        },
      },
    });

    if (isExist) {
      await Message.updateOne(
        {
          _id: msgId,
          reactions: {
            $elemMatch: {
              user: { $eq: id },
            },
          },
        },
        {
          "reactions.$.reaction": reaction,
        }
      );
    } else {
      await Message.findByIdAndUpdate(msgId, {
        $push: {
          reactions: {
            user: id,
            reaction,
            date: new Date().toISOString(),
          },
        },
      });
    }

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const getReactions = async (req, res) => {
  let {
    params: { msgId },
  } = req;
  try {
    let data = await Message.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(msgId) },
      },
      {
        $unwind: "$reactions",
      },
      {
        $group: {
          _id: "$reactions.reaction",
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          reaction: "$_id",
        },
      },
    ]);

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const getReactionsByType = async (req, res) => {
  let {
    params: { msgId },
    query: { page = 1, limit = 25, type },
  } = req;

  page = +page;
  limit = +limit;

  try {
    let data = await Message.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(msgId) },
      },
      {
        $unwind: "$reactions",
      },
      ...(type
        ? [
            {
              $match: {
                "reactions.reaction": type,
              },
            },
          ]
        : []),
      { $skip: (page - 1) * limit },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          reaction: "$reactions.reaction",
          user: "$reactions.user",
          date: "$reactions.date",
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "user",
          as: "user",
          pipeline: [
            {
              $project: {
                id: "$_id",
                _id: 0,
                name: 1,
                email: 1,
                avatar: 1,
                status: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          name: { $first: "$user.name" },
          status: { $first: "$user.status" },
          avatar: { $first: "$user.avatar" },
          email: { $first: "$user.email" },
          userId: { $first: "$user._id" },
          date: "$date",
        },
      },
    ]);

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  createMessage,
  handleReaction,
  getReactions,
  getReactionsByType,
  //   getSeen,
};
