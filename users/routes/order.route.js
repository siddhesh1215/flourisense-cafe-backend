const express = require('express');
const router = express.Router();

const { verifyJWTToken } = require('../../middleware/JWT.middleware');
const orderController = require('../controllers/order.controller');
const orderValidator = require('../validators/order.validator');

// All order routes require authentication
router.post('/place', verifyJWTToken, orderValidator.placeOrder, orderController.place);
router.get('/history', verifyJWTToken, orderController.history);
router.get('/:id', verifyJWTToken, orderController.getById);
router.put('/cancel/:id', verifyJWTToken, orderController.cancel);

module.exports = router;
