const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    FoodItemName: {
        type: String,
        required: true
    },
    FoodItemPrice: {
        type: Number,
        required: true
    },
    FoodItemCategory: {
        type: String,
        enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
        required: true
    },
    FoodItemDescription: {
        type: String,
        required: true
    },
    FoodItemImageUrl: {
        type: String,
        default:null
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: true
    },
    cookingInstructions: {
        type: String,
        default: ''
    },
})
const FoodItem = mongoose.model('FoodItems', foodItemSchema);
module.exports = FoodItem;