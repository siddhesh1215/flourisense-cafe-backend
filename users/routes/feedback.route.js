const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const feedbackController = require('../controllers/feedback.controller');
const feedbackValidator = require('../validators/feedback.validator');

// POST /api/v1/user/feedback — submit feedback (auth required)
router.post('/', verifyJWTToken, feedbackValidator.submitFeedback, feedbackController.submit);

// GET /api/v1/user/feedback/my — get current user's own feedback (auth required)
router.get('/my', verifyJWTToken, feedbackController.getMyFeedback);

// GET /api/v1/user/feedback — public listing of active feedback (no auth)
router.get('/', feedbackValidator.getPublic, feedbackController.getPublic);

module.exports = router;

