const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const orderController = require('../controllers/order.controller');
const orderValidator = require('../validators/order.validator');

/**
 * @swagger
 * /user/order/place:
 *   post:
 *     summary: Place a new order from the current cart
 *     tags: [User — Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payment_method]
 *             properties:
 *               payment_method: { type: string, enum: [cash, card, upi, online], example: cash }
 *               location_id:    { type: integer, nullable: true, example: 1 }
 *               order_type_id:  { type: integer, nullable: true, example: 1 }
 *     responses:
 *       201: { description: Order placed }
 *       400: { description: Validation error or empty cart }
 */
router.post('/place', verifyJWTToken, orderValidator.placeOrder, orderController.place);

/**
 * @swagger
 * /user/order/history:
 *   get:
 *     summary: Get current user's order history
 *     tags: [User — Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order list }
 */
router.get('/history', verifyJWTToken, orderController.history);

/**
 * @swagger
 * /user/order/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [User — Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order details }
 *       404: { description: Order not found }
 */
router.get('/:id', verifyJWTToken, orderController.getById);

/**
 * @swagger
 * /user/order/cancel/{id}:
 *   put:
 *     summary: Cancel an order
 *     tags: [User — Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order cancelled }
 *       400: { description: Order cannot be cancelled }
 */
router.put('/cancel/:id', verifyJWTToken, orderController.cancel);

module.exports = router;
