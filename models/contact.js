const mongoose = require("mongoose");

const contactScheme = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactScheme);
