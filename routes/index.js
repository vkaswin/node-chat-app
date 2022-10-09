const { Router } = require("express");
const authRoutes = require("./user");
const chatRoutes = require("./chat");
const messageRoutes = require("./message");
const contactRoutes = require("./contact");
const callRoutes = require("./call");
const reactionRoutes = require("./reaction");
const othersRoutes = require("./others");

const router = Router();

router
  .use("/api/", othersRoutes)
  .use("/api/user", authRoutes)
  .use("/api/chat", chatRoutes)
  .use("/api/message", messageRoutes)
  .use("/api/contact", contactRoutes)
  .use("/api/call", callRoutes)
  .use("/api/reaction", reactionRoutes);

module.exports = router;
