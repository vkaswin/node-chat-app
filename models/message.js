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
    seen: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageScheme);
