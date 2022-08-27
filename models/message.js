const mongoose = require("mongoose");

const messageScheme = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add chatId"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pleae add senderId"],
    },
    msg: {
      type: String,
      required: [true, "Please add msg"],
    },
    date: {
      type: Date,
      required: [true, "Please addd date"],
    },
    seen: {
      type: Boolean,
      required: [true, "Please add seen"],
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageScheme);
