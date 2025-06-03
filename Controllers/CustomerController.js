const customerService = require('../Services/CustomerServices');
exports.getAllFoodItemsForConsumers = async (req, res) => {
    try {
        const foodItems = await customerService.getAllFoodItemsForCustomers();
        res.status(200).json(foodItems);
    } catch (err) {
        console.error('Error fetching food items:', err);
        res.status(500).json({ message: 'Server error while fetching food items' });
    }
};

exports.searchFoodItems = async (req, res) => {
    try {
        const foodItems = await customerService.searchFoodItems(req.query);
        res.status(200).json(foodItems);
    } catch (err) {
        console.error('Error searching food items:', err);
        res.status(500).json({ message: 'Server error while searching food items' });
    }
};

exports.placeOrder = async (req, res) => {
    try {
        const orderData = req.body;
        console.log('Placing order with data:', orderData);
        const result = await customerService.placeOrder(orderData);
        res.status(201).json({
            message: 'Order placed successfully',
            data: result,
           
        });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({
            message: 'Server error while placing order',
            error: err.message
        });
    }
}