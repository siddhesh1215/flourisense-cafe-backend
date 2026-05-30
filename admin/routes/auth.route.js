const express = require("express");
const router = express.Router();

const { verifyAdminToken } = require("../../middleware/adminAuth.middleware");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validators/auth.validator");

/**
 * @swagger
 * /admin/auth/register:
 *   post:
 *     summary: Register a new admin (bootstrapping only)
 *     tags: [Admin — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:     { type: string, example: Jane Admin }
 *               email:    { type: string, format: email, example: admin@cafe.com }
 *               phone:    { type: string, example: "9876543210" }
 *               password: { type: string, minLength: 6, example: adminPass1 }
 *     responses:
 *       201: { description: Admin created, OTP sent }
 *       400: { description: Validation error }
 */
router.post("/register", authValidation.register, authController.register);

/**
 * @swagger
 * /admin/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for first-time admin login
 *     tags: [Admin — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, otp]
 *             properties:
 *               userId: { type: integer, example: 1 }
 *               otp:    { type: string, example: "654321" }
 *     responses:
 *       200: { description: OTP verified, JWT returned }
 *       400: { description: Invalid or expired OTP }
 */
router.post("/verify-otp", authValidation.verifyOTP, authController.verifyOTP);

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin — Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: admin@cafe.com }
 *               password: { type: string, example: adminPass1 }
 *     responses:
 *       200: { description: Login successful or OTP triggered for first login }
 *       401: { description: Invalid credentials }
 */
router.post("/login", authValidation.login, authController.login);

// ─── Profile Management (authenticated admin) ─────────────────────────────────

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin — Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin profile data }
 *       401: { description: Unauthorized }
 */
router.get("/me", verifyAdminToken, authController.getProfile);

/**
 * @swagger
 * /admin/auth/profile:
 *   put:
 *     summary: Update admin name and/or phone number
 *     tags: [Admin — Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string, example: Jane Admin }
 *               phone: { type: string, example: "9876543210" }
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Validation error }
 */
router.put("/profile", verifyAdminToken, authValidation.updateProfile, authController.updateProfile);

/**
 * @swagger
 * /admin/auth/change-password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin — Auth]
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
router.put("/change-password", verifyAdminToken, authValidation.changePassword, authController.changePassword);

module.exports = router;