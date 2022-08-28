const mongoose = require("mongoose");

const callSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    date: {
      type: Date,
    },
    type: {
      type: String,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Call", callSchema);
