const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

/**
 * ─────────────────────────────────────────────
 * AUTH ROUTES (CLEAN VERSION)
 * ─────────────────────────────────────────────
 */

/**
 * Register User
 */
router.post(
  "/register",
  authValidation.register,
  authController.register
);

/**
 * Verify OTP
 */
router.post(
  "/verify-otp",
  authController.verifyOTP
);

/**
 * Login User
 */
router.post(
  "/login",
  authController.login
);

/**
 * Resend OTP
 */
router.post(
  "/resend-otp",
  authController.resendOTP
);

module.exports = router;
