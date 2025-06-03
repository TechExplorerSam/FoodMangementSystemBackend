const mongoose=require('mongoose');
const customerschema=new mongoose.Schema({
    customerName:{
        type:String,
        required:true
    },
    customerPhone:{
        type:String,
        required:true
    },
    
    customerAddress:{
        type:String,
       
    },
    customerOrders:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Orders'

        
    },
    customerBookedCurrentTableId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tables'
    },
    customerBookedOrderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Orders'
    },
    
    
})
const Customer = mongoose.model('Customers', customerschema);
module.exports=Customer;