const analytics = require('../Models/Analytics');
const chefs = require('../Models/Chefs');
const FoodItem = require('../Models/FoodItems');
const Orders = require('../Models/Orders');
const tables = require('../Models/Tables');
const analyticsModel = require('../Models/Analytics');
const Chefs = require('../Models/Chefs');
const moment = require('moment');

exports.getAnalytics = async () => {
  try {
    const analyticsData = await analyticsModel.findOne();

    if (!analyticsData) {
      throw new Error('No analytics data found');
    }

    const revenueByDayMap = {};
    analyticsData.RevenueGenerated.forEach(entry => {
      const day = moment(entry.orderDate).format('ddd');
      revenueByDayMap[day] = (revenueByDayMap[day] || 0) + entry.orderTotal;
    });

    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueByDay = allDays.map(day => ({
      day,
      revenue: revenueByDayMap[day] || 0
    }));

    const orders = await Orders.find({});
    console.log("Orders fetched:", orders);
   const orderSummary = {
  "Dine-In": 0,
  "Take Away": 0,
  "Served": 0
};

orders.forEach(order => {
  console.log("Processing order:", order);
  if (orderSummary.hasOwnProperty(order.orderType)) {
    orderSummary[order.orderType]++;
  }
});


    const chefsData = await Chefs.find({});
    const chefs = chefsData.map(chef => ({
      name: chef.chefName,
      orders: chef.chefTakenOrders.length || 0
    }));
    const tablesData = await tables.find({});
    console.log("Tables fetched:", tablesData);
   

    return {
      totalChefs: analyticsData.totalChefs,
      totalRevenue: analyticsData.totalRevenue,
      totalOrders: analyticsData.totalOrders,
      totalClients: analyticsData.totalCustomers,
      orderSummary,
      revenueByDay,
      chefs: chefs,
      tables: tablesData.map(table => ({
        tableName: table.tableName,
        tableStatus: table.tableStatus,
        tablechaircount: table.tablechaircount,
        tableBookedCustomerId: table.tableBookedCustomerId ? table.tableBookedCustomerId.toString() : null,
        tableNumber: table.tableNumber
      }))
    };

  } catch (err) {
    console.error('Error in getAnalytics:', err);
    throw new Error('Error while fetching analytics data');
  }
};


exports.calculateAnalytics = async () => {
  try {
    const [totalChefs, totalTables] = await Promise.all([
      Chefs.countDocuments(),
      tables.countDocuments()
    ]);

    const totalRevenueAgg = await Orders.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    const orderSummaryRaw = await Orders.find({}, {
      _id: 1,
      orderDate: 1,
      totalAmount: 1
    });

    const orderSummary = orderSummaryRaw.map(order => ({
      orderId: order._id,
      orderDate: order.orderDate,
      orderTotal: order.totalAmount
    }));

    const revenueByDay = Array(7).fill(0);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    orderSummaryRaw.forEach(order => {
      const dayIndex = new Date(order.orderDate).getDay();
      revenueByDay[dayIndex] += order.totalAmount;
    });

    const revenueByDayFormatted = weekDays.map((day, idx) => ({
      day,
      revenue: revenueByDay[idx]
    }));

    let analyticsDoc = await analytics.findOne();

    if (analyticsDoc) {
      analyticsDoc.totalChefs = totalChefs;
      analyticsDoc.totalTables = totalTables;
      analyticsDoc.totalRevenue = totalRevenue;
      analyticsDoc.orderSummary = orderSummary;
      analyticsDoc.RevenueGenerated = orderSummary;
      analyticsDoc.updatedAt = new Date();
      analyticsDoc.revenueByDay = revenueByDayFormatted;

      await analyticsDoc.save();
    } else {
      analyticsDoc = new analytics({
        totalChefs,
        totalTables,
        totalRevenue,
        orderSummary,
        RevenueGenerated: orderSummary,
        revenueByDay: revenueByDayFormatted,
        createdAt: new Date()
      });

      await analyticsDoc.save();
    }

    return analyticsDoc;
  } catch (err) {
    console.error("🔥 Error in calculateAnalytics:", err);
    throw new Error("Error while calculating analytics");
  }
};

exports.updateAnalytics = async (orderId) => {
  try {
    const order = await Orders.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const analyticsData = await analytics.findOne();
    if (!analyticsData) {
      throw new Error('Analytics data not found');
    }

    analyticsData.totalRevenue += order.orderTotal;

    const orderDateStr = new Date(order.orderTimeStamp).toISOString().slice(0, 10);

    let dateGroup = analyticsData.orderSummary.find(group => group.date === orderDateStr);

    if (!dateGroup) {
      analyticsData.orderSummary.push({
        date: orderDateStr,
        orders: [{
          orderId: order._id,
          orderTotal: order.orderTotal
        }]
      });
    } else {
      dateGroup.orders.push({
        orderId: order._id,
        orderTotal: order.orderTotal
      });
    }

    await analyticsData.save();
    console.log(`Analytics updated for Order ID ${order._id}`);

  } catch (err) {
    console.error('Error in updateAnalytics:', err);
    throw new Error('Error while updating analytics data');
  }
};
