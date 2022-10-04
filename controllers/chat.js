const { Chat, Message } = require("../models");
const { generateRandomColor } = require("../utils");
const socket = require("../socket");
const mongoose = require("mongoose");

// @des Get chat by id
// @route GET /api/chat/detail/:chatId
const getChatById = async (req, res) => {
  try {
    let {
      params: { chatId },
      user: { id },
    } = req;

    id = mongoose.Types.ObjectId(id);
    chatId = mongoose.Types.ObjectId(chatId);

    let data;
    let chat = await Chat.findById(chatId);

    if (chat.group) {
      let [result] = await Chat.aggregate([
        {
          $match: { _id: chatId },
        },
        {
          $lookup: {
            from: "messages",
            foreignField: "_id",
            localField: "messages",
            as: "messages",
            pipeline: [
              {
                $match: {
                  seen: { $ne: id },
                },
              },
              {
                $project: {
                  id: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "users",
            as: "users",
            pipeline: [
              {
                $project: {
                  _id: 1,
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
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "group.admin",
            as: "group.admin",
          },
        },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "group.createdBy",
            as: "group.createdBy",
          },
        },
        {
          $project: {
            users: 1,
            name: "$group.name",
            avatar: "$group.avatar",
            group: {
              createdBy: {
                $first: "$group.createdBy",
              },
              admin: 1,
            },
            messages: {
              $cond: {
                if: { $gt: [{ $size: "$messages" }, 0] },
                then: true,
                else: false,
              },
            },
            favourite: {
              $cond: {
                if: { $in: [id, "$favourites"] },
                then: true,
                else: false,
              },
            },
          },
        },
      ]);

      data = result;
    } else {
      let [result] = await Chat.aggregate([
        {
          $match: { _id: chatId },
        },
        {
          $lookup: {
            from: "messages",
            foreignField: "_id",
            localField: "messages",
            as: "messages",
            pipeline: [
              {
                $match: {
                  seen: { $ne: id },
                },
              },
              {
                $project: {
                  seen: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            favourites: 1,
            messages: 1,
            user: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", id] },
              },
            },
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
                  _id: 1,
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
            user: {
              $first: "$user",
            },
            messages: {
              $cond: {
                if: { $gt: [{ $size: "$messages" }, 0] },
                then: true,
                else: false,
              },
            },
            favourite: {
              $cond: {
                if: { $in: [id, "$favourites"] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $project: {
            name: "$user.name",
            avatar: "$user.avatar",
            status: "$user.status",
            userId: "$user._id",
            email: "$user.email",
            favourite: 1,
            messages: 1,
          },
        },
      ]);

      data = result;
    }

    res.status(200).send({
      message: "Success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des Get chat by type
// @route GET /api/chat/list/:type
const getChatsByType = async (req, res) => {
  try {
    let {
      user: { id },
      params: { type },
    } = req;

    let data;

    id = mongoose.Types.ObjectId(id);

    if (type === "recent" || type === "favourite") {
      data = await Chat.aggregate([
        {
          $match: {
            users: id,
            latest: { $ne: null },
            group: { $eq: null },
            favourites: { [type === "recent" ? "$ne" : "$eq"]: id },
          },
        },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $lookup: {
            from: "messages",
            foreignField: "_id",
            localField: "messages",
            as: "messages",
            pipeline: [
              {
                $match: {
                  seen: { $ne: id },
                },
              },
              {
                $project: {
                  seen: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "latest",
            foreignField: "_id",
            as: "latest",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  msg: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            latest: {
              $first: "$latest",
            },
            user: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", id] },
              },
            },
            messages: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: { $ne: ["$$message.seen", id] },
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  id: "$_id",
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
            _id: 1,
            msg: "$latest.msg",
            date: "$latest.date",
            user: {
              $first: "$user",
            },
            count: {
              $size: "$messages",
            },
          },
        },
      ]);
    } else if (type === "group") {
      data = await Chat.aggregate([
        {
          $match: {
            users: id,
            latest: { $ne: null },
            group: { $ne: null },
          },
        },
        {
          $lookup: {
            from: "messages",
            foreignField: "_id",
            localField: "messages",
            as: "messages",
            pipeline: [
              {
                $match: {
                  seen: { $ne: id },
                },
              },
              {
                $project: {
                  seen: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "latest",
            foreignField: "_id",
            as: "latest",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  msg: 1,
                  date: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            latest: {
              $first: "$latest",
            },
            group: 1,
            messages: 1,
          },
        },
        {
          $project: {
            group: {
              name: "$group.name",
              avatar: "$group.avatar",
            },
            msg: "$latest.msg",
            date: "$latest.date",
            count: {
              $size: "$messages",
            },
          },
        },
      ]);
    } else {
      req.status(400).send({ message: "Invalid chat type" });
    }

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des Create group chat
// @route POST /api/chat/group/create
const createGroupChat = async (req, res) => {
  try {
    const {
      user: { id },
      body,
    } = req;

    body.group.createdBy = id;
    body.group.admin = [id];
    body.group.avatar = generateRandomColor();

    let data = await Chat.create(body);
    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(200).send({ message: "Error" });
  }
};

const addToFavourite = async (req, res) => {
  try {
    const {
      user: { id },
      params: { chatId },
    } = req;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    await Chat.findByIdAndUpdate(chatId, {
      $push: {
        favourites: id,
      },
    });

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ message: "Error" });
  }
};

const removeFromFavourite = async (req, res) => {
  try {
    const {
      user: { id },
      params: { chatId },
    } = req;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    await Chat.findByIdAndUpdate(chatId, {
      $pull: {
        favourites: id,
      },
    });

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(200).send({ message: "Error" });
  }
};

const markAsReadByMsgId = async (req, res) => {
  try {
    const {
      user: { id },
      params: { chatId, msgId },
    } = req;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    await Message.findByIdAndUpdate(msgId, { $push: { seen: id } });

    socket.io.to(chatId).emit("seen", { msgId, userId: id });
    return res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const markAsRead = async (req, res) => {
  let {
    params: { chatId },
    user: { id },
  } = req;
  let msgId;

  try {
    msgId = await Message.aggregate([
      {
        $match: {
          chatId: mongoose.Types.ObjectId(chatId),
          seen: { $ne: mongoose.Types.ObjectId(id) },
        },
      },
      {
        $project: {
          id: "$_id",
          _id: 0,
        },
      },
    ]);

    await Message.updateMany(
      {
        chatId,
        seen: { $ne: id },
      },
      {
        $push: {
          seen: id,
        },
      }
    );

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  } finally {
    let rooms = socket.io.sockets.adapter.rooms;

    if (rooms.has(chatId) && rooms.get(chatId).size > 1) {
      rooms.get(chatId).forEach((socketId) => {
        socket.io.to(socketId).emit("seen", { msgId, userId: id });
      });
    }
  }
};

module.exports = {
  getChatsByType,
  getChatById,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
  markAsReadByMsgId,
  markAsRead,
};
