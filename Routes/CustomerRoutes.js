const CustomerController = require('../Controllers/CustomerController');
const express = require('express');
const router = express.Router();



router.get('/getAllFoodItemsForConsumers',CustomerController.getAllFoodItemsForConsumers)

router.get('/searchFoodItems', CustomerController.searchFoodItems);

router.post('/placeOrder',CustomerController.placeOrder)
module.exports = router;