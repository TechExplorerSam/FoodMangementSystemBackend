const orders = require('../Models/Orders');
const FoodItem = require('../Models/FoodItems');
const Table = require('../Models/Tables');
const customerServices = require('./CustomerServices');
const customer = require('../Models/Customer');
exports.bookAnOrder = async (orderData) => {
    try {
      const exisitingCustomer = await customer.findOne({
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress
      });
      if (!exisitingCustomer) {
        const newCustomer = await customerServices.addACustomer({
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerAddress: orderData.customerAddress
        });
        orderData.orderedCustomerId = newCustomer._id;
      } else {
        orderData.orderedCustomerId = exisitingCustomer._id;
      }
        
        
        const order = new orders({
            orderType: orderData.orderType,
            orderStatus: orderData.orderStatus,
            orderItems: orderData.orderItems,
            orderTimeStamp: orderData.orderTimeStamp,
            orderedTableId: orderData.orderedTableId,
            ItemsCount: orderData.ItemsCount,
            OngoingDurationTimer: orderData.OngoingDurationTimer,
            totalAmount: orderData.totalAmount,
            cookingInstructions:orderData.cookingInstructions
        });
        if (orderData.orderType === "Take Away") {
          order.orderDeliveryAddress = orderData.orderDeliveryAddress;
         
          
           
            
        }
        const result = await order.save();
        return result;
    } catch (err) {
        console.log(err);
        throw new Error('Error while booking an order');
    }
}



exports.updateOrderStatus = async (orderId) => {
  try {
    const order = await orders.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.orderStatus === "Served") return order;

    const now = new Date();
    const durationInMinutes = Math.floor((now - order.orderTimeStamp) / 60000);

    const updatedOrder = await exports.UpdateOrderTimer(orderId, durationInMinutes);

    if (updatedOrder.orderStatus === "Served") {
      await exports.autoFreeTableIfOrderCompleted(orderId);
    }

    return updatedOrder;
  } catch (err) {
    console.error("Update Order Status Error:", err);
    throw new Error("Error while updating order status");
  }
};

exports.UpdateOrderTimer = async (orderId) => {
  try {
    const order = await orders.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.orderStatus === "Served") return order;

    const now = new Date();
    const elapsedMinutes = Math.floor((now - order.orderTimeStamp) / 60000);

    const foodItems = await FoodItem.find({
      _id: { $in: order.orderItems.map(item => item.itemId) }
    });

    if (!foodItems.length) throw new Error("No food items found for this order");

    const allItemsDone = foodItems.every(item => elapsedMinutes >= item.preparationTime);
    const slowestPrepTime = Math.max(...foodItems.map(item => item.preparationTime));

    order.OngoingDurationTimer = elapsedMinutes;

    if (order.orderType === "Take Away") {
      if (allItemsDone) {
        order.orderStatus = "Done";
        order.orderTakenStatus = "Not Picked Up"; 
      } else {
        order.orderStatus = "Processing";
      }
    }

    else if (order.orderType === "Dine In") {
      if (!allItemsDone) {
        order.orderStatus = "Processing";
      } else if (allItemsDone && elapsedMinutes <= slowestPrepTime + 2) {
        order.orderStatus = "Done";
      } else if (elapsedMinutes > slowestPrepTime + 2) {
        order.orderStatus = "Served";
      }
    }

    await order.save();
    return order;

  } catch (err) {
    console.error("Timer update failed:", err);
    throw new Error("Error while updating order timer");
  }
};


exports.autoFreeTableIfOrderCompleted = async (orderId) => {
  try {
    const order = await orders.findById(orderId);

    if (!order) throw new Error("Order not found");

    if (order.orderType !== "Dine In") return;

    if (order.orderStatus === "Served") {
      const table = await Table.findById(order.orderedTableId);

      if (!table) {
        console.warn(`No table found with ID ${order.orderedTableId}`);
        return;
      }

      table.tableStatus = 'Available';
      table.tableBookedCustomerId = null;

      await table.save();
      console.log(`Table ${table.tableSpecificId} is now free.`);
    }
  } catch (err) {
    console.error('Error while auto-freeing table:', err);
    throw new Error('Failed to auto free table after order completion');
  }
};
