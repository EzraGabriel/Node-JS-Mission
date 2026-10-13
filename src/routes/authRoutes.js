const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const uploadProfileImage = require("../middleware/uploadProfileImage");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verifikasi-email", authController.verifyEmail);
router.post("/profile-image", verifyToken, uploadProfileImage, authController.uploadProfileImage);

module.exports = router;
