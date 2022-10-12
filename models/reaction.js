const mongoose = require("mongoose");

const reactionSchema = mongoose.Schema(
  {
    msgId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    reaction: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema);