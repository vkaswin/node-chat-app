const mongoose = require("mongoose");

const messageScheme = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    msg: {
      type: String,
    },
    date: {
      type: Date,
    },
    seen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    reaction: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reaction",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

messageScheme.statics.query = [
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
            status: 1,
            email: 1,
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

module.exports = mongoose.model("Message", messageScheme);
