const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const routes = require("./routes");
const socket = require("./socket");
const { Message } = require("./models");
const mongoose = require("mongoose");
const port = process.env.PORT;

connectDB();

const app = express();

const server = require("http").createServer(app);

socket.init(server);

app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use("*/images", express.static("public/images"))
  .use("*/reaction", express.static("public/reaction"))
  .use(routes);

app.get("/check", async (req, res) => {
  try {
    let data = await Message.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId("633c14a74df39ad24c868aca"),
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "reactions",
          foreignField: "_id",
          as: "reactions",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $project: {
                      id: "$_id",
                      _id: 0,
                      name: 1,
                      email: 1,
                      avatar: 1,
                      status: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                reaction: 1,
                msgId: 1,
                user: { $first: "$user" },
              },
            },
            {
              $group: {
                _id: "$reaction",
                total: { $sum: 1 },
                users: { $push: "$user" },
              },
            },
            {
              $project: {
                _id: 0,
                users: 1,
                total: 1,
                reaction: "$_id",
              },
            },
          ],
        },
      },
    ]);
    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
  }
});

server.listen(port, () => {
  console.log(`server connected on port ${port}`);
});
