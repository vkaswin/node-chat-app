const { Router } = require("express");
const { createMessage } = require("../controllers/messageController");
const router = Router();

router.post("/create", createMessage);

module.exports = router;
