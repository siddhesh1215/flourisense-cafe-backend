const express = require("express");
const router = express.Router();

const { verifyJWTToken } = require("../../middleware/JWT.middleware");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

/**
 * @swagger
 * /user/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [User — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:  { type: string, minLength: 2, example: John Doe }
 *               email: { type: string, format: email, example: john@example.com }
 *               password: { type: string, minLength: 6, example: secret123 }
 *               phone: { type: string, example: "9876543210" }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */
router.post("/register", authValidation.register, authController.register);

/**
 * @swagger
 * /user/auth/verify-otp:
 *   post:
 *     summary: Verify email OTP after registration
 *     tags: [User — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, otp]
 *             properties:
 *               userId: { type: integer, example: 1 }
 *               otp:    { type: string,  example: "123456" }
 *     responses:
 *       200: { description: OTP verified, JWT returned }
 *       400: { description: Invalid OTP }
 */
router.post("/verify-otp", authController.verifyOTP);

/**
 * @swagger
 * /user/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [User — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Login successful, JWT returned }
 *       401: { description: Invalid credentials }
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /user/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [User — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: john@example.com }
 *     responses:
 *       200: { description: OTP sent }
 *       404: { description: User not found }
 */
router.post("/resend-otp", authController.resendOTP);

/**
 * @swagger
 * /user/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User — Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/UserProfile' }
 *       401: { description: Unauthorized }
 */
router.get("/me", verifyJWTToken, authController.getProfile);

/**
 * @swagger
 * /user/auth/profile:
 *   put:
 *     summary: Update name and/or phone number
 *     tags: [User — Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string, example: Jane Doe }
 *               phone: { type: string, example: "9876543210" }
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Validation error }
 */
router.put("/profile", verifyJWTToken, authValidation.updateProfile, authController.updateProfile);

/**
 * @swagger
 * /user/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [User — Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password, confirm_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password:     { type: string, minLength: 6 }
 *               confirm_password: { type: string }
 *     responses:
 *       200: { description: Password changed }
 *       400: { description: Passwords do not match or wrong current password }
 */
router.put("/change-password", verifyJWTToken, authValidation.changePassword, authController.changePassword);

module.exports = router;
