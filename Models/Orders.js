const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true,
  },
  orderType: {
    type: String,
    enum: ['Dine-In', 'Served', 'Take Away'],
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderedcustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers',
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Done', 'Served'],
    default: 'Processing',
  },
  orderItems: [
    {
      itemName: {
        type: String,
        required: true,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItems',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      itemPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  orderTimeStamp: {
    type: Date,
    required: true,
  },
  orderedTableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tables',
    required: function () {
      return this.orderType === 'Dine-In';
    },
  },
  ItemsCount: {
    type: Number,
    required: true,
  },
  OngoingDurationTimer: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  cookingInstructions: {
    type: String,
    default: '',
  },
  isRepeated:{
    type:Boolean, 
    default:false
  },
  isRepeatOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Orders',
    default: null,
  },
  orderTakenStatus: {
    type: String,
    enum: ['Picked Up', 'Not Picked Up'],
    default: 'Not Picked Up',
    required: function () {
      return this.orderType === 'Take Away';
    },
  },
  orderDeliveryAddress: {
    type: String,
    required: function () {
      return this.orderType === 'Take Away';
    },
  },
});

const Order = mongoose.model('Orders', orderSchema);
module.exports = Order;
