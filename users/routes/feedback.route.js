const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const feedbackController = require('../controllers/feedback.controller');
const feedbackValidator = require('../validators/feedback.validator');

/**
 * @swagger
 * /user/feedback:
 *   post:
 *     summary: Submit feedback (auth required)
 *     tags: [User — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:      { type: integer, minimum: 1, maximum: 5, example: 4 }
 *               message:     { type: string, maxLength: 1000, example: Great coffee! }
 *               location_id: { type: integer, nullable: true, example: 1 }
 *               order_id:    { type: integer, nullable: true, example: 7 }
 *     responses:
 *       201: { description: Feedback submitted }
 *       400: { description: Validation error }
 *
 *   get:
 *     summary: List public/active feedback (no auth required)
 *     tags: [User — Feedback]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 100 }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *       - in: query
 *         name: location_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Feedback list }
 */
router.post('/', verifyJWTToken, feedbackValidator.submitFeedback, feedbackController.submit);
router.get('/', feedbackValidator.getPublic, feedbackController.getPublic);

/**
 * @swagger
 * /user/feedback/my:
 *   get:
 *     summary: Get the current user's own feedback entries
 *     tags: [User — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User's feedback list }
 */
router.get('/my', verifyJWTToken, feedbackController.getMyFeedback);

module.exports = router;
