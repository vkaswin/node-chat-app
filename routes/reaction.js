const { Router } = require("express");
const { createReaction, updateReaction } = require("../controllers/reaction");
const { verifyToken } = require("../middleware");
const router = Router();

router.use(verifyToken);
router.post("/create", createReaction);
router.put("/update", updateReaction);

module.exports = router;
