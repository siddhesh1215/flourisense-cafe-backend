const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const menuController = require('../controllers/menu.controller');

// Public routes — no auth required
router.get('/popular', menuController.getPopular);
router.get('/category/:category_id', menuController.getByCategory);
router.get('/:id', menuController.getById);
router.get('/', menuController.getAll);

module.exports = router;
