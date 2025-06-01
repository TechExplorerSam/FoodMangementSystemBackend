const Table=require('../Models/Tables');
const Customer=require('../Models/Customer');

exports.addATable=async(tabledata)=>{
    try{
        const existingTable=await Table.findOne({tableName:tabledata.name, tableNumber:tabledata.tableNumber});
        if(existingTable){
            throw new Error('Table already exists');    
        }
        if(!tabledata.name || !tabledata.tableNumber || !tabledata.chairsCount){
            throw new Error('Please provide all required fields');
        }
        const table= new Table({
            
            tableSpecificId:tabledata.id,
            tableName:tabledata.name,
            tableStatus:tabledata.tableStatus,
            tableNumber:tabledata.tableNumber,
            tablechaircount:tabledata.chairsCount
        })
        const result=await table.save();
        return result;
    }
    catch(err){
        console.log(err);
        throw new Error('Error while adding table');
    }
}
exports.getAllTables=async()=>{
    try{
        const tables=await Table.find();
        return tables;
    }
    catch(err){
        console.log(err);
        throw new Error('Error while fetching tables');
    }
}
exports.searchAndFilterTables = async (query) => {
  const { q, status } = query;

  let filter = {};

  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  if (status && ["Available", "Reserved"].includes(status)) {
    filter.status = status;
  }

  return await Table.find(filter).sort({ name: 1 });
};

exports.updateTableStatus = async (tableId, status) => {
    try {
        const table = await Table.findById(tableId);
        if (!table) {
            throw new Error('Table not found');
        }
        table.tableStatus = status;
        await table.save();
        return table;
    }
    catch (err) {
        console.log(err);
        throw new Error('Error while updating table status');
    }
}

exports.updateTableNumbers = async (tables) => {
  try {
    const tablesArray = Object.values(tables);

    for (const table of tablesArray) {
      const { _id, tableNumber } = table;
      if (typeof tableNumber !== 'number' || tableNumber <= 0) {
        throw new Error(`Invalid table number for table ID ${_id}`);
      }
      console.log(`Updating table ID ${_id} with table number ${tableNumber}`);
      await Table.findByIdAndUpdate(_id, { tableNumber }, { new: true });
    }

    return tablesArray;
  } catch (err) {
    console.error("Error in updateTableNumbers:", err);
    throw new Error("Error while updating table numbers");
  }
};




exports.updateTableContent = async (tableId, tableData) => {
    try {
        const table = await Table.findById(tableId);
        if (!table) {
            throw new Error('Table not found');
        }
        table.tableSpecificId = tableData.id;
        table.tableName = tableData.tableName;
        table.tableNumber = tableData.tableNumber;
        table.tableStatus = tableData.tableStatus;
        table.tablechaircount = tableData.tablechaircount;
        await table.save();
        return table;
    }
    catch (err) {
        console.log(err);
        throw new Error('Error while updating table content');
    }
}

exports.deleteTable = async (tableId) => {
    try {
        const result = await Table.findByIdAndDelete(tableId);
        if (!result) {
            throw new Error('Table not found');
        }
        return result;
    }
    catch (err) {
        console.log(err);
        throw new Error('Error while deleting table');
    }
}

exports.autoAssignTableToCustomer = async (customerId) => {
    try {
        const table = await Table.findOne({ tableStatus: 'Available' }).sort({ tableSpecificId: 1 });
        if (!table) {
            throw new Error('No available tables');
        }
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }
        customer.customerBookedCurrentTableId = table._id;
        table.tableStatus = 'Reserved';
        table.tableBookedCustomerId = customerId;

        await table.save();
        return table;
    } catch (err) {
        console.log(err);
        throw new Error('Error while auto-assigning table to customer');
    }
}