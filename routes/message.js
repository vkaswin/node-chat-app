const { Router } = require("express");
const { createMessage } = require("../controllers/message");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.post("/create/:chatId", createMessage);

module.exports = router;
