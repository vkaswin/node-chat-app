const { Router } = require("express");
const {
  createMessage,
  handleReaction,
  getReactions,
  getReactionsByType,
} = require("../controllers/message");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.post("/create/:chatId", createMessage);
router.post("/send/:msgId", handleReaction);
router.get("/reaction/type/:msgId", getReactionsByType);
router.get("/reaction/:msgId", getReactions);

module.exports = router;
