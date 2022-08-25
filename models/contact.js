const mongoose = require("mongoose");

const contactScheme = mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add chatId"],
      ref: "Chat",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add addedBy"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add user"],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactScheme);
