const { Chat } = require("../models");

// @des Get chat by id
// @route GET /api/chat/:chatId
const getChatById = async (req, res) => {
  try {
    const {
      params: { chatId },
      user: { id },
    } = req;

    let {
      users: [user],
      messages,
      _id,
    } = await Chat.findById(chatId).populate(
      "users",
      { password: 0 },
      { _id: { $ne: id } }
    );
    res.status(200).send({ data: { _id, user, messages }, message: "Success" });
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

    const chats = await Chat.find({
      users: id,
      messages: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .populate("users", { password: 0 }, { _id: { $ne: id } })
      .populate(
        "messages",
        {
          _id: 1,
          msg: 1,
          date: 1,
          seen: 1,
        },
        {
          to: { $eq: id },
        }
      );

    let data = chats.map(
      ({ users: [user], createdAt, updatedAt, _id, messages }) => {
        return {
          _id,
          user,
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

    res.status(200).send({ message: "Success", data: [] });

    return;

    const chats = await Chat.find({
      users: id,
      messages: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .populate("users", { password: 0 });

    // console.log(chats);

    let data = chats.map(({ users, createdAt, updatedAt, _id, messages }) => {
      return {
        _id,
        user: users.find((user) => !user._id.equals(id)),
        createdAt,
        updatedAt,
        messages,
      };
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

    res.status(200).send({ message: "Success", data: [] });

    return;

    const chats = await Chat.find({
      users: id,
      messages: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .populate("users", { password: 0 });

    // console.log(chats);

    let data = chats.map(({ users, createdAt, updatedAt, _id, messages }) => {
      return {
        _id,
        user: users.find((user) => !user._id.equals(id)),
        createdAt,
        updatedAt,
        messages,
      };
    });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getRecentChats,
  getFavouriteChats,
  getGroupChats,
  getChatById,
};
