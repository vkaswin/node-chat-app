const { Router } = require("express");
const {
  createMessage,
  getMessagesByChatId,
} = require("../controllers/message");
const router = Router();

router.post("/create/:chatId", createMessage);
router.get("/:chatId", getMessagesByChatId);

module.exports = router;
