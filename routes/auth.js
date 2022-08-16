const { Router } = require("express");
const { login, register, getUserById } = require("../controllers/auth");
const { verifyToken } = require("../middleware");

const router = Router();

router.post("/login", login);

router.post("/register", register);

router.get("/user/:userId", verifyToken, getUserById);

module.exports = router;
