const { Router } = require("express");
const {
  login,
  register,
  getUserById,
  updateUserStatus,
} = require("../controllers/user");
const { verifyToken } = require("../middleware");

const router = Router();

router.post("/login", login);

router.post("/register", register);

router.use(verifyToken);

router.put("/status", updateUserStatus);

router.get("/:userId", getUserById);

module.exports = router;
