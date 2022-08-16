const { Router } = require("express");
const { getAllChat } = require("../controllers/chat");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.get("/", getAllChat);

module.exports = router;
