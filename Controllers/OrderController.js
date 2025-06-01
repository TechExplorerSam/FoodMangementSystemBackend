const orderServices = require('../Services/OrderServices');


exports.bookAnOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const result = await orderServices.bookAnOrder(orderData);
        res.status(201).json({
            message: 'Order booked successfully',
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while booking an order',
            error: err.message
        });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const result = await orderServices.updateOrderStatus(orderId);
        res.status(200).json({
            message: 'Order status updated successfully',
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while updating order status',
            error: err.message
        });
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        const result = await orderServices.getAllOrders();
        res.status(200).json({
            message: 'Orders fetched successfully',
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error while fetching orders',
            error: err.message
        });
    }
}


