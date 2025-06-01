const express = require("express");
const router = express.Router();
const  AnalyticsController = require("../Controllers/AnalyticsController");

router.get("/getAnalytics",AnalyticsController.getAnalytics );



module.exports = router;
