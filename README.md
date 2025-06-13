 Food Management System – Backend (Node.js + Express + MongoDB)
 ========================== 
 Robust backend powering a smart restaurant management system – Orders, Tables, Chefs, Customers, and Analytics. Built with performance, scalability, and modularity in mind.

 Project Structure
-------------------
FoodManagementSystem/
├── backend/
│   ├── Controllers/         # Handles HTTP requests
│   ├── Models/              # Mongoose schemas
│   ├── Routes/              # API endpoints
│   ├── Services/            # Business logic layer
│   ├── server.js             # Entry point
│   └── .env                 # Environment variables

 Features
 CRUD operations for Food Items, Chefs, Tables, Orders, Customers

 Order Management with dynamic statuses (Processing, Served, etc.)

Chef order tracking and current assignments

 Table reservation and availability tracking

 Daily & weekly analytics with revenue tracking

 Secure backend with JWT Authentication (if enabled)

Clean MVC + Service architecture for scalability

 Cron-based hourly analytics updates




Tech Stack
------------ 

 | Tech       | Purpose                            |
| ---------- | ---------------------------------- |
| Node.js    | Runtime environment                |
| Express.js | Web framework                      |
| MongoDB    | Database                           |
| Mongoose   | ODM for MongoDB                    |
| dotenv     | Environment configuration          |
| moment.js  | Date manipulation                  |
| node-cron  | Scheduled tasks (analytics update) |


 Environment Setup
Create a .env file in the backend/ folder:

PORT=5000
MONGO_URI=mongodb://localhost:27017/food-management
JWT_SECRET=yourSuperSecretJWTKey


 Installation & Setup

 # Step 1: Clone the repo
git clone https://github.com/TechExplorerSam/FoodMangementSystemBackend.git
cd FoodManagementSystem/backend

# Step 2: Install dependencies
npm install

# Step 3: Run MongoDB (make sure it's running locally or use MongoDB Atlas)

# Step 4: Start the server
npm run dev


Project Highlights
 Real-time analytics using Mongo Aggregation

 Modular service-based logic (not cluttered in controllers)

 Auto-analytics calculation on order placement

 Error-handling with clear responses and logging

 Clean formatting with Prettier and ESLint (optional)


Cron Jobs
node-cron is used to trigger automatic analytics every hour.

cron.schedule('0 * * * *', async () => {
  await calculateAnalytics();
  console.log("Hourly analytics updated!");
});


Author
Sampath – Java & MERN Stack Developer
 LinkedIn
Portfolio: coming soon
🛠️ Built with ❤️ and sleepless nights