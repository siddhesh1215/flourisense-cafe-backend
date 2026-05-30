const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const cartController = require('../controllers/cart.controller');
const cartValidator = require('../validators/cart.validator');

/**
 * @swagger
 * /user/cart/add:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_item_id, quantity]
 *             properties:
 *               menu_item_id: { type: integer, example: 3 }
 *               quantity:     { type: integer, minimum: 1, maximum: 100, example: 2 }
 *     responses:
 *       201: { description: Item added to cart }
 *       400: { description: Validation error }
 */
router.post('/add', verifyJWTToken, cartValidator.addToCart, cartController.add);

/**
 * @swagger
 * /user/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart contents }
 */
router.get('/', verifyJWTToken, cartController.getCart);

/**
 * @swagger
 * /user/cart/{id}:
 *   get:
 *     summary: Get a single cart item by ID
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cart item }
 *       404: { description: Not found }
 */
router.get('/:id', verifyJWTToken, cartController.getCartItem);

/**
 * @swagger
 * /user/cart/update/{id}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1, maximum: 100, example: 5 }
 *     responses:
 *       200: { description: Cart item updated }
 *       400: { description: Validation error }
 */
router.put('/update/:id', verifyJWTToken, cartValidator.updateCart, cartController.update);

/**
 * @swagger
 * /user/cart/clear:
 *   delete:
 *     summary: Clear all items from the cart
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart cleared }
 */
router.delete('/clear', verifyJWTToken, cartController.clearCart);

/**
 * @swagger
 * /user/cart/remove/{id}:
 *   delete:
 *     summary: Remove a specific item from the cart
 *     tags: [User — Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Item removed }
 *       404: { description: Item not found }
 */
router.delete('/remove/:id', verifyJWTToken, cartController.removeItem);

module.exports = router;
