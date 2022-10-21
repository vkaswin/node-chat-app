const { Router } = require("express");
const { getMetaData, uploadFile } = require("../controllers/others");
const multer = require("multer");
const router = Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // limiting files size to 1 MB
  },
});

router.get("/metadata", getMetaData);
router.post("/fileupload", upload.array("file"), uploadFile);

module.exports = router;
