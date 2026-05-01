const express = require("express");
const router = express.Router();

const { verifyJWTToken } = require("../../middleware/jwt.middleware");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

router.post(
  "/register",
  authValidation.register,
  authController.register,
);

router.post(
  "/verify-otp",
  authController.verifyOTP,
);

module.exports = router;
