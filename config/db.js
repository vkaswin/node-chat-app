const mongoose = require("mongoose");
const { User } = require("../models");

const connectDB = async () => {
  try {
    let res = await mongoose.connect(process.env.MONGO_URI_DEV);
    console.log(`Mongo DB Connected`, res.connection.host);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
