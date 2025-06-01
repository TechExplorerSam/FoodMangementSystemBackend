const tableService = require('../Services/TableServices');

exports.searchTables = async (req, res) => {
  try {
    const results = await tableService.searchAndFilterTables(req.query);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ message: 'Server error while searching tables' });
  }
};

exports.updateTableStatus = async (req, res) => {
    try {
        const { tableId, status } = req.body;
        const updatedTable = await tableService.updateTableStatus(tableId, status);
        res.status(200).json(updatedTable);
    }
    catch (err) {
        console.error('Error updating table status:', err);
        res.status(500).json({ message: 'Server error while updating table status' });
    }
}
exports.updateTableContent = async (req, res) => {
    try {
        const { tableId } = req.query;
        const tableData = req.body;
        console.log('Updating table with ID:', tableId, 'and data:', tableData);
        
        const updatedTable = await tableService.updateTableContent(tableId, tableData);
        res.status(200).json(updatedTable);
    } catch (err) {
        console.error('Error updating table content:', err);
        res.status(500).json({ message: 'Server error while updating table content' });
    }
}
exports.updateTableNumbers = async (req, res) => {
  try {
    const tables = req.body.tables;
    console.log('Updating table numbers with data:', tables);
    if (!Array.isArray(tables)) {
      return res.status(400).json({ message: "Invalid input: tables should be an array" });
    }

    const updatedTables = await tableService.updateTableNumbers(tables);
    res.status(200).json(updatedTables);
  } catch (err) {
    console.error('Error updating table numbers:', err);
    res.status(500).json({ message: 'Server error while updating table numbers' });
  }
};


exports.deleteTable = async (req, res) => {
    try {
        const { tableId } = req.params;
       
        const deletedTable = await tableService.deleteTable(tableId);
        res.status(200).json(deletedTable);
    }
    catch (err) {
        console.error('Error deleting table:', err);
        res.status(500).json({ message: 'Server error while deleting table' });
    }
}

exports.addTable = async (req, res) => {
    try {
        console.log('Adding new table with data:', req.body);
        const tableData = req.body;
        const newTable = await tableService.addATable(tableData);
        res.status(201).json(newTable);
    } catch (err) {
        console.error('Error adding table:', err);
        res.status(500).json({ message: 'Server error while adding table' });
    }
};

exports.getAllTables = async (req, res) => {
    try {
        const tables = await tableService.getAllTables();
        res.status(200).json(tables);
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ message: 'Server error while fetching tables' });
    }
};


