const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { uploadSignature } = require("../controllers/uploadController");

// Only logged-in users can upload
router.post("/signature", authMiddleware, uploadSignature);

module.exports = router;
