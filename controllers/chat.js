const { Chat } = require("../models");
const { generateRandomColor } = require("../utils");

// @des Get chat by id
// @route GET /api/chat/detail/:chatId
const getChatById = async (req, res) => {
  try {
    const {
      params: { chatId },
      user: { id },
    } = req;

    let chat = await Chat.findById(chatId).populate("users", {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      status: 1,
    });

    if (chat.group) {
      const chatDetail = await chat.populate("group.admin group.createdBy", {
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        status: 1,
      });

      const {
        _id,
        users,
        messages,
        group: { name, admin, createdAt, createdBy, description },
      } = chatDetail;

      return res.status(200).send({
        message: "Success",
        data: {
          users,
          name,
          admin,
          createdAt,
          createdBy,
          description,
          messages,
          _id,
        },
      });
    } else {
      const { _id, users, messages, favourites } = chat;
      const { name, email, status, avatar } = users.find(
        (user) => !user._id.equals(id)
      );
      const data = {
        _id,
        name,
        email,
        status,
        avatar,
        messages,
        isFavourite: favourites.includes(id),
      };

      res.status(200).send({
        message: "Success",
        data,
      });
    }
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

    const chats = await Chat.find(
      {
        users: id,
        messages: { $ne: [] },
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
      .populate("messages", {
        _id: 1,
        msg: 1,
        date: 1,
        seen: 1,
      })
      .sort({ updatedAt: -1 });

    let data = chats.map(
      ({
        users: [{ name, status, avatar, email }],
        createdAt,
        updatedAt,
        _id,
        messages,
      }) => {
        const { msg, date, seen } = messages[messages.length - 1];
        return {
          _id,
          name,
          email,
          avatar,
          status,
          msg,
          seen,
          date,
          count: messages.length,
          message: messages[messages.length - 1],
          createdAt,
          updatedAt,
        };
      }
    );

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

    const chats = await Chat.find(
      {
        users: id,
        messages: { $ne: [] },
        group: { $eq: null },
        favourites: { $in: [id] },
      },
      { group: 0 }
    )
      .sort({ updatedAt: -1 })
      .populate(
        "users",
        { _id: 1, name: 1, email: 1, avatar: 1, status: 1 },
        { _id: { $ne: id } }
      )
      .populate("messages", {
        _id: 1,
        msg: 1,
        date: 1,
        seen: 1,
      });

    let data = chats.map(
      ({
        users: [{ name, status, avatar, email }],
        createdAt,
        updatedAt,
        _id,
        messages,
      }) => {
        const { msg, date, seen } = messages[messages.length - 1];
        return {
          _id,
          name,
          email,
          avatar,
          status,
          msg,
          seen,
          date,
          count: messages.length,
          message: messages[messages.length - 1],
          createdAt,
          updatedAt,
        };
      }
    );

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

    const chat = await Chat.find({
      users: id,
      group: { $ne: null },
      messages: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .populate("users group.admin group.createdBy", {
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        status: 1,
      })
      .populate("messages", { _id: 1, msg: 1, date: 1, seen: 1 });

    const data = chat.map(
      ({
        _id,
        messages,
        users,
        createdAt,
        updatedAt,
        group: { name, description, avatar },
      }) => {
        const { msg, date, seen } = messages[messages.length - 1];
        return {
          _id,
          name,
          description,
          message: messages[messages.length - 1],
          count: messages.length,
          msg,
          date,
          seen,
          avatar,
          users,
          createdAt,
          updatedAt,
        };
      }
    );

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
