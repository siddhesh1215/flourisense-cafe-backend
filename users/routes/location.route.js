const express = require('express');
const router = express.Router();

const locationController = require('../controllers/location.controller');

/**
 * @swagger
 * /user/location:
 *   get:
 *     summary: List all active locations
 *     tags: [User — Location]
 *     responses:
 *       200: { description: Locations list }
 */
router.get('/', locationController.getAll);

/**
 * @swagger
 * /user/location/{id}:
 *   get:
 *     summary: Get a single location by ID
 *     tags: [User — Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Location details }
 *       404: { description: Not found }
 */
router.get('/:id', locationController.getById);

/**
 * @swagger
 * /user/location/{id}/menu-items:
 *   get:
 *     summary: Get menu items available at a specific location
 *     tags: [User — Location]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Available menu items at this location }
 *       404: { description: Location not found }
 */
router.get('/:id/menu-items', locationController.getMenuItems);

module.exports = router;
