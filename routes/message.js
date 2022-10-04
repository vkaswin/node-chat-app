const { Router } = require("express");
const {
  createMessage,
  getMessagesByChatId,
  getMessagesByMsgId,
  getNewMessagesByChatId,
} = require("../controllers/message");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.post("/create/:chatId", createMessage);
router.get("/new/:chatId", getNewMessagesByChatId);
router.get("/:chatId/:msgId", getMessagesByMsgId);
router.get("/:chatId", getMessagesByChatId);

module.exports = router;
