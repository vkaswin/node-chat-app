const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const routes = require("./routes");
const { chatSocket } = require("./sockets");
const port = process.env.PORT;

connectDB();

const app = express();

const server = require("http").createServer(app);

app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use("*/images", express.static("public/images"))
  .use(routes);

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

const chatNameSpace = io.of("/chats");

chatNameSpace.on("connection", chatSocket);

server.listen(port, () => {
  console.log(`server connected on port ${port}`);
});
