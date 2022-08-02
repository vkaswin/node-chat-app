const { Router } = require("express");
const { createMessage } = require("../controllers/messageController");
const router = Router();

router.post("/create/:chatId", createMessage);

module.exports = router;
