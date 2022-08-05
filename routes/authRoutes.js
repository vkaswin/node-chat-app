const { Router } = require("express");
const {
  login,
  register,
  getUserById,
} = require("../controllers/authController");

const router = Router();

router.post("/login", login);

router.post("/register", register);

router.get("/user/:userId", getUserById);

module.exports = router;
