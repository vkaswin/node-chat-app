const { Router } = require("express");
const authRoutes = require("./auth");
const chatRoutes = require("./chat");
const messageRoutes = require("./message");
const othersRoutes = require("./others");

const router = Router();

router
  .use("/api/", othersRoutes)
  .use("/api/users", authRoutes)
  .use("/api/chats", chatRoutes)
  .use("/api/messages", messageRoutes);

module.exports = router;
