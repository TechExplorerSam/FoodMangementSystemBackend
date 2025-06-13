const orders = require('../Models/Orders');
const FoodItem = require('../Models/FoodItems');
const Table = require('../Models/Tables');
const customerServices = require('./CustomerServices');
const customer = require('../Models/Customer');
const moment = require('moment'); 
const TableServices= require('./TableServices');
const chefServices = require('./ChefServices');
const {calculateAnalytics} = require('./AnalyticsServices');

exports.bookAnOrder = async (orderData) => {
    try {
      console.log("Order Data:", orderData);
      const exisitingCustomer = await customer.findOne({
        customerName: orderData.customerDetails.customerName,
        customerPhone: orderData.customerDetails.customerPhone,
        customerAddress: orderData.customerDetails.customerAddress
      });
      if (!exisitingCustomer) {
        const newCustomer = await customerServices.addACustomer({
          customerName: orderData.customerDetails.customerName,
          customerPhone: orderData.customerDetails.customerPhone,
          customerAddress: orderData.customerDetails.customerAddress
        });
        orderData.orderedCustomerId = newCustomer._id;
        const assignTable=await TableServices.autoAssignTableToCustomer(newCustomer._id);
        if (assignTable) {
          orderData.orderedTableId = assignTable._id;
        } else {
          throw new Error('No available tables to assign');
        }
      } else {
        orderData.orderedCustomerId = exisitingCustomer._id;
       const repeatSameOrderInPast = await orders.findOne({
  orderedcustomerId: exisitingCustomer._id,
  orderStatus: "Done",
  orderTimeStamp: { $gte: moment().subtract(1, 'day').toDate() } 
});

if (repeatSameOrderInPast) {
const pastItemIds = repeatSameOrderInPast.orderItems
  .map(i => `${i.itemName}_${i.itemPrice}`)
  .sort();

const currentItemIds = orderData.orderItems
  .map(i => `${i.itemName}_${i.itemPrice}`)
  .sort();

  const isSameOrder = JSON.stringify(pastItemIds) === JSON.stringify(currentItemIds);

  if (isSameOrder) {
    console.log("Same order repeated within 24 hours");

    orderData.orderedTableId = repeatSameOrderInPast.orderedTableId;
    orderData.isRepeated = true;
    orderData.isRepeatOf = repeatSameOrderInPast._id;
  } else {
    console.log("Different items ordered, not a repeat");

    const assignTable = await TableServices.autoAssignTableToCustomer(exisitingCustomer._id);
    if (assignTable) {
      orderData.orderedTableId = assignTable._id;
    } else {
      throw new Error('No available tables to assign');
    }

    orderData.isRepeated = false;
    orderData.isRepeatOf = null;
  }
} else {
  const assignTable = await TableServices.autoAssignTableToCustomer(exisitingCustomer._id);
  if (assignTable) {
    orderData.orderedTableId = assignTable._id;
  } else {
    throw new Error('No available tables to assign');
  }

  orderData.isRepeated = false;
  orderData.isRepeatOf = null;
}

      }
        const itemNames = orderData.orderItems.map(item => item.itemName);
        const foodItems = await FoodItem.find({ FoodItemName: { $in: itemNames } });
        console.log("Food Items Found:", foodItems);
        
        orderData.orderItems = orderData.orderItems.map(item => {
          const foodItem = foodItems.find(f => f.FoodItemName.toString() === item.itemName);
          if (!foodItem) {
            throw new Error(`Food item with ID ${item.itemName} not found`);
          }
          return {
            itemId: foodItem._id,
            itemName: foodItem.FoodItemName,
            itemPrice: foodItem.FoodItemPrice,
            quantity: item.quantity,
            image: foodItem.FoodItemImageUrl
          };
        });
     
        const getNextOrderId = async () => {
  const lastOrder = await orders.findOne().sort({ orderId: -1 }).limit(1);
  return lastOrder ? lastOrder.orderId + 1 : 101; 
};
const newOrderId = await getNextOrderId();

        const order = new orders({
           orderId: newOrderId,
            orderType: orderData.orderType,
            orderStatus: orderData.orderStatus,
            orderItems: orderData.orderItems,
            orderTimeStamp: new Date(),
            orderedTableId: orderData.orderedTableId,
            ItemsCount: orderData.ItemsCount,
            OngoingDurationTimer: 0, 
            totalAmount: orderData.totalAmount,
            cookingInstructions: orderData.cookingInstructions,
            orderedcustomerId: orderData.orderedCustomerId
        });
       if (orderData.orderType === "Take Away") {

  
  order.orderDeliveryAddress=orderData.customerDetails.customerAddress;
}

        console.log("Order before saving:", order);
        const result = await order.save();
        await chefServices.assignChefToOrder(order.orderItems);
        console.log("Order saved successfully:", result);
        await calculateAnalytics();
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

exports.UpdateOrderStatusIfTakeAway = async (orderId, newStatus) => {
  try {
    const order = await orders.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.orderType !== "Take Away") {
      throw new Error("This function is only for Take Away orders");
    }

    order.orderTakenStatus = newStatus;

    if (newStatus === "Picked Up") {
      order.orderStatus = "Done";
    } else {
      order.orderStatus = "Processing";
    }

    await order.save();
    return order;
  } catch (err) {
    console.error("Error updating Take Away order status:", err);
    throw new Error("Failed to update Take Away order status");
  }
}
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
    console.log("Food Items for Order:", foodItems);
    if (!foodItems || foodItems.length === 0) {
      console.warn(`No food items found for order ID ${orderId}`);
      throw new Error("No food items found for this order");
    }

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

    else if (order.orderType === "Dine-In") {
      if (!allItemsDone) {
        order.orderStatus = "Processing";
      } else if (allItemsDone && elapsedMinutes <= slowestPrepTime + 2) {
        order.orderStatus = "Done";
      } else if (elapsedMinutes > slowestPrepTime + 2) {
        order.orderStatus = "Served";
      }
    }

    await order.save();
    exports.autoFreeTableIfOrderCompleted(orderId).catch(err => {
      console.error("Error auto freeing table:", err);
    }
    );
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

    if (order.orderType !== "Dine-In") return;

    if (order.orderStatus === "Served") {
      const table = await Table.findById(order.orderedTableId);

      if (!table) {
        console.warn(`No table found with ID ${order.orderedTableId}`);
        return;
      }

      table.tableStatus = 'Available';
      table.tableBookedCustomerId = null;
console.log(`Freeing table ${table.tableSpecificId} after order completion.`);
      await table.save();
      console.log(`Table ${table.tableSpecificId} is now free.`);
    }
  } catch (err) {
    console.error('Error while auto-freeing table:', err);
    throw new Error('Failed to auto free table after order completion');
  }
};



exports.getAllOrders = async () => {
  try {
    const allOrders = await orders.find()
      .populate('orderedTableId')
      .populate('orderedcustomerId');
console.log("Fetched all orders:", allOrders);
    const transformedOrders = allOrders.map(order => {
      const orderTime = moment(order.orderTimeStamp).format("h:mm A");
      const tableNumber = order.orderType=="Dine-In"?(order.orderedTableId?.tableNumber || 'NA'): 'NA';
     
      if (tableNumber=== 'NA') {
        console.warn(`No table number found for order ID ${order._id}`);
      }
      let statusText = "";
      if (order.orderType === "Dine-In"&& order.orderStatus === "Processing") {
        statusText = `Ongoing: ${order.OngoingDurationTimer} Min`;
      }
      else if(order.orderType=="Dine-In" && (order.orderStatus === "Done"|| order.orderStatus === "Served")) {
        statusText = "Done";
      }
      
      else if (order.orderType === "Served"||order.orderStatus === "Done"||order.orderStatus === "Served") {
        statusText = "Served";
      } else if (order.orderType === "Take Away") {
        statusText = order.orderTakenStatus === "Picked Up" ? "Picked Up" : "Not Picked up";
      }
      exports.UpdateOrderTimer(order._id).catch(err => {
        console.error("Error updating order timer:", err);
      });
      return {
        _id: order._id,
        id: String(order.orderId).padStart(2, '0'),
        orderType: order.orderType === "Dine-In" ? "Dine In" : order.orderType, 
        tableNumber: tableNumber < 10 ? `0${tableNumber}` : `${tableNumber}`,
        status: statusText,
        items: order.orderItems.map(item => item.itemName),
        time: orderTime
      };
      
    });

    return transformedOrders;
  } catch (err) {
    console.error("Error while fetching all orders:", err);
    throw new Error("Failed to fetch all orders");
  }
};
exports.getOrderById = async (orderId) => {
  try {
    const order = await orders.findById(orderId).populate('orderedTableId').populate('orderedCustomerId');
    if (!order) throw new Error("Order not found");
    return order;
  } catch (err) {
    console.error("Error while fetching order by ID:", err);
    throw new Error("Failed to fetch order by ID");
  }
};