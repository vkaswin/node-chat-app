const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let res = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo DB Connected`, res.connection.host);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
