const express = require("express");
const router = express.Router();
const { searchTables } = require("../Controllers/TableController");
const { addTable, getAllTables, updateTableStatus, deleteTable } = require("../Controllers/TableController");
const { updateTableContent } = require("../Services/TableServices");
const { updateTableNumbers } = require("../Controllers/TableController");




router.get("/searchTable", searchTables);
router.post("/addTable", addTable);
router.get("/getAllTables", getAllTables);
router.put("/updateTableStatus", updateTableStatus);
router.put("/updateTable/:tableId", updateTableContent);
router.put("/updateTableNumbers", updateTableNumbers);
router.delete("/deleteTable/:tableId", deleteTable);

module.exports = router;

