const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // <--- 1. IMPORT THIS
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patient");

// Import Models
const User = require("./models/User");
const Appointment = require("./models/Appointment");

dotenv.config();
connectDB();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors()); // <--- 2. USE THIS (Allows all connections)

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);

// Test Route
app.get("/test-models", async (req, res) => {
  res.send("Models are loaded!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
