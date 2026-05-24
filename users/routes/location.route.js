const express = require('express');
const router = express.Router();

const locationController = require('../controllers/location.controller');

// ─── Public routes — no auth required ────────────────────────────────────────

// GET /api/v1/user/location — list all active locations
router.get('/', locationController.getAll);

// GET /api/v1/user/location/:id — single location detail
router.get('/:id', locationController.getById);

// GET /api/v1/user/location/:id/menu-items — items available at a location
router.get('/:id/menu-items', locationController.getMenuItems);

module.exports = router;
