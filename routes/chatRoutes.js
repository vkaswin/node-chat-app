const { Router } = require("express");
const { getAllChat } = require("../controllers/chatController");
const router = Router();

router.get("/", getAllChat);

module.exports = router;
