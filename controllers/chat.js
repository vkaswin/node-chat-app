const { Chat } = require("../models");
const user = require("../models/user");
const { generateRandomColor } = require("../utils");

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

// @des Get recent chats
// @route GET /api/chat/recent
const getRecentChats = async (req, res) => {
  try {
    const {
      user: { id },
    } = req;

    const data = await Chat.find(
      {
        users: id,
        latest: { $ne: null },
        group: { $eq: null },
        favourites: { $nin: [id] },
      },
      { group: 0 }
    )
      .populate(
        "users",
        { _id: 1, name: 1, email: 1, avatar: 1, status: 1 },
        { _id: { $ne: id } }
      )
      .populate("latest", {
        msg: 1,
        date: 1,
      })
      .sort({ updatedAt: -1 })
      .transform((docs) => {
        return docs.map((doc) => {
          const {
            latest,
            unseen,
            users: [{ _id: userId, ...user }],
            ...rest
          } = doc.toObject();
          return {
            count: unseen.length,
            ...latest,
            ...user,
            ...rest,
            userId,
          };
        });
      });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des Get favourite chats
// @route GET /api/chat/favourite
const getFavouriteChats = async (req, res) => {
  try {
    const {
      user: { id },
    } = req;

    const data = await Chat.find(
      {
        users: id,
        latest: { $ne: null },
        group: { $eq: null },
        favourites: { $in: [id] },
      },
      { group: 0 }
    )
      .populate(
        "users",
        { _id: 1, name: 1, email: 1, avatar: 1, status: 1 },
        { _id: { $ne: id } }
      )
      .populate("latest", {
        msg: 1,
        date: 1,
      })
      .sort({ updatedAt: -1 })
      .transform((docs) => {
        return docs.map((doc) => {
          const {
            latest,
            unseen,
            users: [{ _id: userId, ...user }],
            ...rest
          } = doc.toObject();
          return {
            count: unseen.length,
            ...latest,
            ...user,
            ...rest,
            userId,
          };
        });
      });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des Get group chats
// @route GET /api/chat/group
const getGroupChats = async (req, res) => {
  try {
    const {
      user: { id },
    } = req;

    const data = await Chat.find(
      {
        users: id,
        latest: { $ne: null },
        group: { $ne: null },
        messages: { $ne: [] },
      },
      { group: 1, unseen: 1, latest: 1 }
    )
      .populate("latest", { msg: 1, date: 1 })
      .sort({ updatedAt: -1 })
      .transform((docs) => {
        return docs.map((doc) => {
          const {
            latest,
            unseen,
            group: { admin, ...group },
            ...rest
          } = doc.toObject();
          return {
            count: unseen.length,
            ...latest,
            ...group,
            ...rest,
          };
        });
      });

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

    if (!chat) return res.status(400).send({ message: "Invalid Chat Id" });

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

    if (!chat) return res.status(400).send({ message: "Invalid Chat Id" });

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

module.exports = {
  getRecentChats,
  getFavouriteChats,
  getGroupChats,
  getChatById,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
};
