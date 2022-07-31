const mongoose = require("mongoose");
const { Chat, User } = require("../models");

const connectDB = async () => {
  try {
    let res = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo DB Connected`, res.connection.host);
    // let data = await Chat.create({
    //   users: ["62da683eb05ae58adbf5d68e", "62dd5deec5426336e7598d1b"],
    // });
    // console.log(data);
    // let data = await Chat.find({
    //   users: { $in: "62dd5deec5426336e7598d1b" },
    // }).populate("users", { userName: 1, email: 1, _id: 1 });

    // console.log(JSON.stringify(data));

    // let data = await Chat.findByIdAndUpdate("62e5758b548dc9d46b8ab669", {
    //   $push: {
    //     messages: {
    //       from: "62da683eb05ae58adbf5d68e",
    //       to: "62da69aaff81236594365fe9",
    //       msg: "Hello Jordan",
    //       date: "2022-07-30T18:18:35.312Z",
    //     },
    //   },
    // });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
