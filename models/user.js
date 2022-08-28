const mongoose = require("mongoose");
const { generateRandomColor } = require("../utils");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    avatar: {
      type: String,
      default: generateRandomColor(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
