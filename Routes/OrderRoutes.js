const OrdersController = require('../Controllers/OrderController');

const express = require('express');
const router = express.Router();

router.get('/getAllOrders', OrdersController.getAllOrders);

module.exports = router;
