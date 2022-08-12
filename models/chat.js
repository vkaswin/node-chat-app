const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);