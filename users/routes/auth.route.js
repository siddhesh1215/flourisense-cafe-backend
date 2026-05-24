const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");
const { verifyJWTToken } = require("../../middleware/JWT.middleware");

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH ROUTES
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Register User */
router.post("/register", authValidation.register, authController.register);

/** Verify OTP */
router.post("/verify-otp", authController.verifyOTP);

/** Login User */
router.post("/login", authController.login);

/** Resend OTP */
router.post("/resend-otp", authController.resendOTP);

// ─── Protected: user must be authenticated ───────────────────────────────────

/** GET /user/auth/me — fetch own profile */
router.get("/me", verifyJWTToken, authController.getProfile);

/** PUT /user/auth/profile — update name / phone */
router.put(
  "/profile",
  verifyJWTToken,
  authValidation.updateProfile,
  authController.updateProfile
);

/** PUT /user/auth/change-password — change password */
router.put(
  "/change-password",
  verifyJWTToken,
  authValidation.changePassword,
  authController.changePassword
);

module.exports = router;

