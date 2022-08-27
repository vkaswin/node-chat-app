const mongoose = require("mongoose");

const callSchema = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add userId"],
        ref: "User",
      },
    ],
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add chatId"],
      ref: "Chat",
    },
    date: {
      type: Date,
      required: [true, "Please add date"],
    },
    type: {
      type: String,
      required: [true, "Please add type"],
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add initiatedBy"],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Call", callSchema);
