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
    messages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: [] },
    ],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
