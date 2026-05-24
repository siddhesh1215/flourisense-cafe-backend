const express = require('express');
const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
const authRouter = require('./auth.route');
router.use('/auth', authRouter);

// ─── Menu ─────────────────────────────────────────────────────────────────────
const menuRouter = require('./menu.route');
router.use('/menu', menuRouter);

// ─── Cart ─────────────────────────────────────────────────────────────────────
const cartRouter = require('./cart.route');
router.use('/cart', cartRouter);

// ─── Location ─────────────────────────────────────────────────────────────────
const locationRouter = require('./location.route');
router.use('/location', locationRouter);

// ─── Order ────────────────────────────────────────────────────────────────────
const orderRouter = require('./order.route');
router.use('/order', orderRouter);

// ─── Feedback ─────────────────────────────────────────────────────────────────
const feedbackRouter = require('./feedback.route');
router.use('/feedback', feedbackRouter);

module.exports = router;
