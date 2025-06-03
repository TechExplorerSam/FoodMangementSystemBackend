const OrdersController = require('../Controllers/OrderController');

const express = require('express');
const router = express.Router();

router.get('/getAllOrders', OrdersController.getAllOrders);

router.put('/updateOrderStatusIfTake-Away/:id', OrdersController.UpdateOrderStatusIfTakeAway);

module.exports = router;
