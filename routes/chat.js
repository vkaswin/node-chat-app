const { Router } = require("express");
const {
  getRecentChats,
  getFavouriteChats,
  getGroupChats,
  getChatById,
} = require("../controllers/chat");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.get("/detail/:chatId", getChatById);
router.get("/recent", getRecentChats);
router.get("/favourite", getFavouriteChats);
router.get("/group", getGroupChats);

module.exports = router;
