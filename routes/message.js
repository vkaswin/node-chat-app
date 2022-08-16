const { Router } = require("express");
const {
  createMessage,
  getMessagesByChatId,
} = require("../controllers/message");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.post("/create/:chatId", createMessage);
router.get("/:chatId", getMessagesByChatId);

module.exports = router;
