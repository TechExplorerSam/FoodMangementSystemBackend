const express= require('express');
const app=express()
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const {calculateAnalytics} = require('./Services/AnalyticsServices');

dotenv.config();
app.use(cors(
    {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true 
       
    }
));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the Restaurant Management System ');
});
cron.schedule('0 * * * *', async () => {
  console.log("Running hourly analytics update of the anlytics data...");
  await calculateAnalytics();
});
// Importing routes
const analyticsRoutes = require('./Routes/AnalyticsRoutes');
const tableRoutes = require('./Routes/TableRoutes');
const OrderRoutes = require('./Routes/OrderRoutes');
app.use('/admin/analytics', analyticsRoutes);
app.use('/admin/tables', tableRoutes);
app.use('/admin/orders', OrderRoutes);

mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
    console.log("Connected with mongoDB Sucessfully");
}).catch((err)=>{
    console.log(err);
}
);

app.listen(PORT,()=>{
    console.log(`App running on the port ${PORT}`)
})
