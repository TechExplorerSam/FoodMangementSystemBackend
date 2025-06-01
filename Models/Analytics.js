const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    totalOrders: {
        type: Number,
        default: 0
    },
    totalCustomers: {
        type: Number,
        default: 0
    },
    totalTables: {
        type: Number,
        default: 0
    },
    totalChefs: {
        type: Number,
        default: 4
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    orderSummary: [
        {
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Orders'
            },
            orderDate: {
                type: Date,
                default: Date.now
            },
            orderTotal: {
                type: Number,
                default: 0
            }
        }
    ],
    RevenueGenerated: [
        {
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Orders'
            },
            orderDate: {
                type: Date,
                default: Date.now
            },
            orderTotal: {
                type: Number,
                default: 0
            }
        }
    ],
    TotalTablesStatus: [
        {
            tableId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tables'
            },
            tableStatus: {
                type: String,
                enum: ['Available', 'Occupied'],
                default: 'Available'
            }
        }
    ],
    chefs: [{
        chefId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chefs'
        },
       
    }
],
Tables: [{
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tables'
    }
}],
});
const Analytics = mongoose.model('Analytics', AnalyticsSchema);
module.exports = Analytics;