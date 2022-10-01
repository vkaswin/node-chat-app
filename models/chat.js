const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    group: {
      type: {
        name: { type: String },
        avatar: { type: String },
        description: { type: String },
        admin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
      default: null,
      _id: false,
    },
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    latest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
