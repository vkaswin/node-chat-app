const { Message, Chat } = require("../models");
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

module.exports = {
  createMessage,
};
