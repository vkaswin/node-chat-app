const mongoose = require("mongoose");

const groupSchema = {
  name: { type: String },
  avatar: { type: String },
  description: { type: String },
  admin: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
};

const chatSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    unseen: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    group: {
      type: groupSchema,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
