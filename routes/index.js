const { Router } = require("express");
const authRoutes = require("./auth");
const chatRoutes = require("./chat");
const messageRoutes = require("./message");
const utilsRoutes = require("./utils");
const { verifyToken } = require("../middleware");

const router = Router();

router
  .use("/api/", utilsRoutes)
  .use("/api/users", authRoutes)
  .use(verifyToken)
  .use("/api/chats", chatRoutes)
  .use("/api/messages", messageRoutes);

module.exports = router;
