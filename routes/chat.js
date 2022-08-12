const { Router } = require("express");
const { getAllChat } = require("../controllers/chat");
const router = Router();

router.get("/", getAllChat);

module.exports = router;
