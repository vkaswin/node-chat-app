const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { auth } = require("./routes");
const port = process.env.PORT;

connectDB();

const app = express();

const server = require("http").createServer(app);

app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use("/api/auth", auth);

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(socket.id, "socket connected");
});

server.listen(port, () => {
  console.log(`server connected on port ${port}`);
});
