const mongoose = require('mongoose');

const chefschema = new mongoose.Schema({
    chefName: {
        type: String,
        required: true
    },
    chefTakenOrders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Orders',
            required: true
        }
    ]
    ,chefStatus: {
        type: String,
        enum: ['Free', 'Busy'],
        default: 'Free'
    },
chefCurrentOrder: [
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItems'
    },
    quantity: Number
  }
]
,
    chefCurrentOrderStatus: {
        type: String,
        enum: ['Processing', 'In Progress', 'Served'],
        default: 'Processing'
    },
    chefCookingTime: {
        type: Number,
        default: 0
    },
    
   
    
});
const Chef = mongoose.model('Chefs', chefschema);
module.exports = Chef;