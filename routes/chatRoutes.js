const { Router } = require("express");
const {} = require("../controllers/chatController");
const router = Router();

router.get("/route", (req, res) => {
  res.status(200).send({ message: "Success" });
});

module.exports = router;
