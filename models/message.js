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
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      required: true,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageScheme);
