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

// ─── Order ────────────────────────────────────────────────────────────────────
const orderRouter = require('./order.route');
router.use('/order', orderRouter);

module.exports = router;
