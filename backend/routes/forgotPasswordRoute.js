const express = require("express");
const forgotPasswordController = require("../controllers/forgotPasswordController");

const router = express.Router();

// Tahap 1: Request OTP
router.post("/request-otp", forgotPasswordController.requestOTP);

// Tahap 2: Verify OTP
router.post("/verify-otp", forgotPasswordController.verifyOTP);

// Tahap 3: Reset Password
router.post("/reset-password", forgotPasswordController.resetPassword);

module.exports = router;