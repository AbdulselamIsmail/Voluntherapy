const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import the file you created

// 1. Load env vars
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// 3. Middleware to accept JSON data (Crucial!)
app.use(express.json());

// ... (Your routes and models will go here later) ...

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Import Models
const User = require("./models/User");
const Appointment = require("./models/Appointment");

// Test Route (Optional: Check if it works)
app.get("/test-models", async (req, res) => {
  // logic to test creating a user
  res.send("Models are loaded!");
});
