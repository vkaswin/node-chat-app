const { Router } = require("express");
const {
  getChatById,
  getChatsByType,
  getChatMessagesByMsgId,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
  markAsReadByMsgId,
  markAsRead,
} = require("../controllers/chat");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.get("/detail/:chatId", getChatById);
router.get("/messages/:chatId/:msgId", getChatMessagesByMsgId);
router.get("/list/:type", getChatsByType);
router.post("/group/create", createGroupChat);
router
  .route("/favourite/:chatId")
  .put(addToFavourite)
  .delete(removeFromFavourite);
router.put("/markAsRead/all/:chatId", markAsRead);
router.put("/markAsRead/:chatId/:msgId", markAsReadByMsgId);

module.exports = router;
