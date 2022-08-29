const { Router } = require("express");
const {
  login,
  register,
  getUserById,
  updateUserStatus,
  getAllUsers,
  searchUsers,
} = require("../controllers/user");
const { verifyToken } = require("../middleware");

const router = Router();

router.post("/login", login);

router.post("/register", register);

router.use(verifyToken);

router.put("/status", updateUserStatus);

router.get("/detail/:userId", getUserById);

router.get("/all", getAllUsers);

router.get("/search", searchUsers);

module.exports = router;
