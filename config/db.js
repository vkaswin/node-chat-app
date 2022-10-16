const mongoose = require("mongoose");
const { Chat, Message } = require("../models");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI
        : process.env.MONGO_URI_DEV;
    let res = await mongoose.connect(mongoURI);
    console.log(`Mongo DB Connected`, res.connection.host);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
