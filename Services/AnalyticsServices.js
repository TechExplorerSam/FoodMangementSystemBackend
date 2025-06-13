const Analytics = require('../Models/Analytics');
const Chef = require('../Models/Chefs');
const Table = require('../Models/Tables');
const Order = require('../Models/Orders');
const Orders = require('../Models/Orders');
const Chefs = require('../Models/Chefs');
const Tables = require('../Models/Tables');
const moment = require('moment');
const Customer = require('../Models/Customer');

exports.getAnalytics = async () => {
  try {
    const analyticsData = await Analytics.findOne();

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

    const allOrders = await Orders.find({});
    const orderSummary = {
      "Dine-In": 0,
      "Take Away": 0,
      "Served": 0
    };

    allOrders.forEach(order => {
      if (orderSummary.hasOwnProperty(order.orderType)) {
        orderSummary[order.orderType]++;
      }
      if (order.orderStatus === "Served") {
        orderSummary["Served"]++;
      }
    });

    const chefsData = await Chefs.find({});
    const chefSummary = chefsData.map(chef => ({
      name: chef.chefName,
      orders: chef.chefCurrentOrder?.length || 0
    }));

    const tablesData = await Tables.find({});
    const tableSummary = tablesData.map(table => ({
      tableNumber: table.tableNumber,
      tableName: table.tableName,
      tableStatus: table.tableStatus,
      tableChairCount: table.tablechaircount,
      bookedCustomerId: table.tableBookedCustomerId?.toString() || null
    }));

    return {
      totalChefs: analyticsData.totalChefs,
      totalRevenue: analyticsData.totalRevenue,
      totalTables: analyticsData.totalTables,
      totalOrders: analyticsData.totalOrders,
      totalCustomers: analyticsData.totalCustomers,
      orderSummary,
      revenueByDay,
      chefs: chefSummary,
      tables: tableSummary,
      lastUpdated: analyticsData.updatedAt || analyticsData.createdAt
    };

  } catch (err) {
    console.error(' Error in getAnalytics:', err);
    throw new Error('Error while fetching analytics data');
  }
};


exports.calculateAnalytics = async () => {
  try {
    const [totalChefs, totalTables] = await Promise.all([
      Chef.countDocuments(),
      Table.countDocuments()
    ]);

    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    const orders = await Order.find({}, {
      _id: 1,
      orderDate: 1,
      totalAmount: 1
    });

    const orderSummary = orders.map(order => ({
      orderId: order._id,
      orderDate: order.orderDate,
      orderTotal: order.totalAmount
    }));

    const revenueByDayArray = Array(7).fill(0); 
    orders.forEach(order => {
      const dayIndex = new Date(order.orderDate).getDay();
      revenueByDayArray[dayIndex] += order.totalAmount;
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = weekDays.map((day, idx) => ({
      day,
      revenue: revenueByDayArray[idx]
    }));
const [totalCustomers, totalOrders] = await Promise.all([
      Order.countDocuments(),
      Customer.countDocuments()
    ]);
    let analyticsDoc = await Analytics.findOne();

    if (analyticsDoc) {
      analyticsDoc.totalChefs = totalChefs;
      analyticsDoc.totalTables = totalTables;
      analyticsDoc.totalCustomers = totalCustomers;
      analyticsDoc.totalOrders = totalOrders;
      analyticsDoc.totalRevenue = totalRevenue;
      analyticsDoc.orderSummary = orderSummary;
      analyticsDoc.RevenueGenerated = orderSummary;
      analyticsDoc.revenueByDay = revenueByDay;
      analyticsDoc.updatedAt = new Date();
    } else {
      analyticsDoc = new Analytics({
        totalChefs,
        totalCustomers,
        totalOrders,
        totalTables,
        totalRevenue,
        orderSummary,
        RevenueGenerated: orderSummary,
        revenueByDay,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await analyticsDoc.save();
    console.log("Analytics successfully calculated and saved.");
    return analyticsDoc;

  } catch (err) {
    console.error("Error in calculateAnalytics:", err);
    throw new Error("Error while calculating analytics");
  }
};