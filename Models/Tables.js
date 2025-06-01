const mongoose = require('mongoose');


const tableschema=new mongoose.Schema({
    tableSpecificId:{
        type:Number,
        required:true,
    

    },
    tableName:{
        type:String,
        unique:true

    },
    tableStatus:{
        type:String,
        enum:['Available','Reserved'],
        default:'Available'


        

    },
    tablechaircount:{
        type:Number,
        required:true

    },
    tableBookedCustomerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customers'
    },
    tableNumber:{
        type:Number,
        required:true,
        
    }


})


const Table = mongoose.model('Tables', tableschema);
module.exports=Table;