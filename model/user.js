const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please add userName"],
    },
    email: {
      type: String,
      required: [true, "Please add email"],
    },
    password: {
      type: String,
      required: [true, "Please add password"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
