const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const cartController = require('../controllers/cart.controller');
const cartValidator = require('../validators/cart.validator');

// All cart routes require authentication
router.post('/add', verifyJWTToken, cartValidator.addToCart, cartController.add);
router.get('/', verifyJWTToken, cartController.getCart);
router.get('/:id', verifyJWTToken, cartController.getCartItem);
router.put('/update/:id', verifyJWTToken, cartValidator.updateCart, cartController.update);
router.delete('/clear', verifyJWTToken, cartController.clearCart);
router.delete('/remove/:id', verifyJWTToken, cartController.removeItem);

module.exports = router;
