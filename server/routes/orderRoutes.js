const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

// Guest or logged-in users can place orders
router.post('/', optionalAuth, orderController.createOrder);

// User order history (requires login)
router.get('/my-orders', requireAuth, orderController.getUserOrders);

// View order details / receipt
router.get('/:identifier', orderController.getOrderById);

module.exports = router;
