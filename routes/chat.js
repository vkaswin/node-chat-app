const { Router } = require("express");
const {
  getChatById,
  getChatsByType,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
  markAsRead,
} = require("../controllers/chat");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.get("/detail/:chatId", getChatById);
router.get("/list/:type", getChatsByType);
router.post("/group/create", createGroupChat);
router
  .route("/favourite/:chatId")
  .put(addToFavourite)
  .delete(removeFromFavourite);
router.put("/markAsRead/:chatId", markAsRead);

module.exports = router;
