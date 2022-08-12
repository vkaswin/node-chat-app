const { Router } = require("express");
const { getMetaData } = require("../controllers/utils");
const router = Router();

router.get("/metadata", getMetaData);

module.exports = router;
