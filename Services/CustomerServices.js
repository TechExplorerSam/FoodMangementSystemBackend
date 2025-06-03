const customer=require('../Models/Customer')
const order=require('../Models/Orders')
const table=require('../Models/Tables')
const orderservices=require('../Services/OrderServices')
const fooditem=require('../Models/FoodItems')
const orderServices=require('../Services/OrderServices')
exports.addACustomer=async(customerdata)=>{
    try{
 console.log("Customer data "+customerdata.customerName);
        const existingcustomer=await customer.findOne({customerName:customerdata.customerName,customerPhone:customerdata.customerPhone});
        if(existingcustomer){
            throw new Error('Customer already exists');
        }
       
        if(!customerdata.customerName || !customerdata.customerPhone ){
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
            cookingInstructions:orderdata.cookingInstructions,
            orderCustomerName:orderdata.orderCustomerName,
            orderCustomerPhone:orderdata.orderCustomerPhone,
            orderCustomerAddress:orderdata.orderCustomerAddress
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
        return  bookorder;
    }
    catch(err){
        console.log(err);
        throw new Error('Error while booking an order');
    }
}

exports.searchFoodItems = async (query) => {
  try {
    const { FoodItemName, FoodItemCategory, isAvailable } = query;

    const searchCriteria = {};

    if (FoodItemName) {
      searchCriteria.FoodItemName = { $regex: FoodItemName, $options: 'i' };
    }

    if (FoodItemCategory) {
      searchCriteria.FoodItemCategory = FoodItemCategory;
    }

    if (typeof isAvailable !== 'undefined') {
      searchCriteria.isAvailable = isAvailable === 'true';
    }

    const foodItems = await fooditem.find(searchCriteria);
    console.log('Food items found:', foodItems);
    return foodItems;
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error('Unable to fetch food items');
  }
};


exports.getAllFoodItemsForCustomers = async () => {
  try {
    const foodItems = await fooditem.find({ isAvailable: true });
    return foodItems;
  } catch (error) {
    console.error('Error fetching food items:', error);
    throw new Error('Unable to fetch food items');
  }
}

exports.placeOrder = async (orderData) => {
  console.log('Placing order with data:', orderData);
  try {
    if(orderData.orderType==="Dine-In"){
      orderData.customerAddress = "N/A";

    
    }
    const newOrder = await orderServices.bookAnOrder({
      orderType: orderData.orderType,
      orderStatus: orderData.orderStatus,
      orderItems: orderData.items,
      orderTimeStamp: new Date(),
      orderedTableId: orderData.orderedTableId,
      ItemsCount: orderData.ItemsCount,
      OngoingDurationTimer: new Date(),
      totalAmount: orderData.totalAmount,
      cookingInstructions: orderData.cookingInstructions,
      customerDetails: {
        customerName: orderData.customerDetails.customerName,
        customerPhone: orderData.customerDetails.customerPhone,
        customerAddress: orderData.customerDetails.customerAddress
      }
    });
  
    console.log('New order created:', newOrder);
    const savedOrder = await newOrder.save();
const tableData = orderData.orderType === "Dine-In"
  ? await table.findById(savedOrder.orderedTableId)
  : null;
    if (!tableData) {
      throw new Error('Table not found');
    }
    console.log('Order placed successfully:', savedOrder);
    return {savedOrder,tableData};
  } catch (error) {
    console.error('Error placing order:', error);
    throw new Error('Unable to place order');
  }
}