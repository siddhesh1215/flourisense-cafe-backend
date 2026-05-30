const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const menuController = require('../controllers/menu.controller');

/**
 * @swagger
 * /user/menu:
 *   get:
 *     summary: Get all available menu items (optional location filter)
 *     tags: [User — Menu]
 *     parameters:
 *       - in: query
 *         name: location_id
 *         schema: { type: integer }
 *         description: Filter items available at this location
 *     responses:
 *       200: { description: List of menu items }
 */
router.get('/', menuController.getAll);

/**
 * @swagger
 * /user/menu/popular:
 *   get:
 *     summary: Get popular menu items
 *     tags: [User — Menu]
 *     responses:
 *       200: { description: Popular items }
 */
router.get('/popular', menuController.getPopular);

/**
 * @swagger
 * /user/menu/category/{category_id}:
 *   get:
 *     summary: Get menu items by category
 *     tags: [User — Menu]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Items in this category }
 *       404: { description: Category not found }
 */
router.get('/category/:category_id', menuController.getByCategory);

/**
 * @swagger
 * /user/menu/{id}:
 *   get:
 *     summary: Get a single menu item by ID
 *     tags: [User — Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Menu item details }
 *       404: { description: Not found }
 */
router.get('/:id', menuController.getById);

module.exports = router;
