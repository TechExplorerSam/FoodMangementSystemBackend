const customer=require('../Models/Customer')
const order=require('../Models/Orders')
const table=require('../Models/Tables')
const orderservices=require('../Services/OrderServices')
const fooditem=require('../Models/FoodItems')
exports.addACustomer=async(customerdata)=>{
    try{
        const existingcustomer=await customer.findOne({customerName:customerdata.customerName,customerPhone:customerdata.customerPhone});
        if(existingcustomer){
            throw new Error('Customer already exists');
        }
        if(!customerdata.customerName || !customerdata.customerPhone || !customerdata.customerAddress){
            throw new Error('Please provide all required fields');
        }
        const newcustomer= new customer({
            customerName:customerdata.customerName,
            customerPhone:customerdata.customerPhone,
            customerAddress:customerdata.customerAddress,
           
        })
        const result=await newcustomer.save();
        return result;
    }
    catch(err){
        console.log(err);
        throw new Error('Error while adding customer');
    }
}

exports.bookAnOrder=async(orderdata)=>{
    try{
        const bookorder=orderservices.bookAnOrder({
            orderType:orderdata.orderType,
            orderStatus:orderdata.orderStatus,
            orderItems:orderdata.orderItems,
            orderTimeStamp:orderdata.orderTimeStamp,
            orderedTableId:orderdata.orderedTableId,
            ItemsCount:orderdata.ItemsCount,
            OngoingDurationTimer:new Date.now(),
            totalAmount:orderdata.totalAmount,
            cookingInstructions:orderdata.cookingInstructions
        })
       
        const customers=await customer.findById(orderdata.customerId);
        if(!customers){
            throw new Error('Customer not found');
        }
        customers.customerBookedOrderId=bookorder._id;
        customers.customerBookedCurrentTableId=orderdata.orderedTableId;
        await customers.save();
        const tabledata=await table.findById(orderdata.orderedTableId);
        if(!tabledata){
            throw new Error('Table not found');
        }
        tabledata.tableStatus='Reserved';
        await tabledata.save();
        return bookorder;
    }
    catch(err){
        console.log(err);
        throw new Error('Error while booking an order');
    }
}

exports.searchFoodItems = async (query) => {
  try {
    const { name, category, minPrice, maxPrice, isAvailable } = query;

    const searchCriteria = {};

    if (name) {
      searchCriteria.itemName = { $regex: name, $options: 'i' }; 
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (minPrice || maxPrice) {
      searchCriteria.FoodItemPrice = {};
      if (minPrice) searchCriteria.FoodItemPrice.$gte = Number(minPrice);
      if (maxPrice) searchCriteria.FoodItemPrice.$lte = Number(maxPrice);
    }

    if (isAvailable !== undefined) {
      searchCriteria.isAvailable = isAvailable === 'true';
    }

    const foodItems = await fooditem.find(searchCriteria);
    return foodItems;
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error('Unable to fetch food items');
  }
};


