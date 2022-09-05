const { Router } = require("express");
const {
  getRecentChats,
  getFavouriteChats,
  getGroupChats,
  getChatById,
  createGroupChat,
  addToFavourite,
  removeFromFavourite,
  markAsRead,
} = require("../controllers/chat");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.get("/detail/:chatId", getChatById);
router.get("/recent", getRecentChats);
router.get("/favourite", getFavouriteChats);
router.get("/group", getGroupChats);
router.post("/group/create", createGroupChat);
router
  .route("/favourite/:chatId")
  .put(addToFavourite)
  .delete(removeFromFavourite);
router.put("/markAsRead", markAsRead);

module.exports = router;
