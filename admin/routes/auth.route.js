const express = require("express");
const router = express.Router();

const { verifyJWTToken } = require("../../middleware/JWT.middleware");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

router.post(
  "/register",
  authValidation.register,
  authController.register,
);

router.post(
  "/verify-otp",
  authValidation.verifyOTP,
  authController.verifyOTP,
);

router.post(
  "/login",
  authValidation.login,
  authController.login,
);

module.exports = router;