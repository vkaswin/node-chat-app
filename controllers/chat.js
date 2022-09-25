const { Chat, Message } = require("../models");
const { generateRandomColor } = require("../utils");
const socket = require("../socket");
const mongoose = require("mongoose");

// @des Get chat by id
// @route GET /api/chat/detail/:chatId
const getChatById = async (req, res) => {
  try {
    const {
      params: { chatId },
      user: { id },
    } = req;

    let data = await Chat.findById(chatId)
      .populate("users", {
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        status: 1,
      })
      .transform(async (doc) => {
        const { group = null, favourites, users, ...rest } = doc.toObject();

        if (group) {
          const chat = await doc.populate("group.admin group.createdBy", {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            status: 1,
          });

          const { group, ...rest } = chat.toObject();

          return {
            ...rest,
            ...group,
          };
        }

        const { _id: userId, ...user } = users.find(
          (user) => !user._id.equals(id)
        );

        return {
          ...rest,
          ...user,
          userId,
          isFavourite: favourites.includes(id),
        };
      });

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
            favourites: { [type === "recent" ? "$nin" : "$in"]: [id] },
          },
        },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $project: {
            user: {
              $filter: {
                input: "$users",
                as: "user",
                cond: { $ne: ["$$user", id] },
              },
            },
            latest: 1,
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
          $unwind: "$user",
        },
        {
          $unwind: "$latest",
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
          $project: {
            "group.name": "$group.name",
            "group.avatar": "$group.avatar",
            latest: 1,
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
          $unwind: "$latest",
        },
      ]);
    } else {
      req.status(400).send({ message: "Invalid chat type" });
    }

    for (let i = 0; i < data.length; i++) {
      let count = await Message.find({
        chatId: data[i]._id,
        sender: { $ne: id },
        seen: { $nin: [id] },
      }).countDocuments();

      data[i].count = count;
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

const markAsRead = async (req, res) => {
  try {
    const {
      user: { id },
      params: { chatId },
      body: { msgId },
    } = req;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(400).send({ message: "Chat Id Not Found" });

    if (Array.isArray(msgId)) {
      await Message.updateMany(
        { chatId, _id: { $in: msgId } },
        { $push: { seen: id } }
      );
    } else {
      await Message.findByIdAndUpdate(msgId, { $push: { seen: id } });
    }

    socket.io.to(chatId).emit("seen", { msgId, userId: id });
    return res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getChatsByType,
  getChatById,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
  markAsRead,
};
