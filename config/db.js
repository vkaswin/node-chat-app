const mongoose = require("mongoose");
// const { Chat, Message } = require("../models");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI
        : process.env.MONGO_URI_DEV;
    let res = await mongoose.connect(mongoURI);
    // const chatId = [
    //   "630349d4634d5afb324cc562",
    //   "63034cd790c742e978cdc9b4",
    //   "63034cd790c742e978cdc9b6",
    //   "63034cd790c742e978cdc9b7",
    //   "63034cd790c742e978cdc9b8",
    //   "63034cd790c742e978cdc9b9",
    //   "63034cd790c742e978cdc9ba",
    //   "63034cd790c742e978cdc9bb",
    //   "63034cd790c742e978cdc9b5",
    //   "63034cd790c742e978cdc9bc",
    //   "63072f724ce73f0b507e2485",
    //   "630b0f43eec40a5d7c66c959",
    //   "633ac77d7387214d4d5b2d7d",
    //   "633ac7c18879aaa979baf657",
    //   "633ad1d98e345d775cafbace",
    //   "633ad1e08e345d775cafbad5",
    // ];
    // chatId.forEach(async (id) => {
    //     await Chat.findByIdAndUpdate(id,{$set:{
    //         messages:[]
    //     }})
    //   let data = await Chat.findById(id);
    //   await Message.updateMany(
    //     { chatId: id },
    //     {
    //       $push: {
    //         seen: {
    //           $each: data.users,
    //         },
    //       },
    //     }
    //   );
    // });
    console.log(`Mongo DB Connected`, res.connection.host);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
