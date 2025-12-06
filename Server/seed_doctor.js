const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const connectDB = require("./config/db");

dotenv.config();

const resetSchedule = async () => {
  await connectDB();

  try {
    console.log("🧹 Clearing ONLY Appointments (Users stay safe)...");
    await Appointment.deleteMany();

    // 1. Find our existing Doctor (Dr. House)
    const doctor = await User.findOne({ email: "house@hospital.com" });

    if (!doctor) {
      console.log("❌ Error: Dr. House not found! Run the main seed.js first.");
      process.exit(1);
    }

    console.log(`👨‍⚕️ Found Doctor: ${doctor.name}`);
    console.log("🌱 Creating fresh slots for tomorrow...");

    // 2. Create 3 fresh slots for Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const times = [9, 13, 16]; // 9 AM, 1 PM, 4 PM

    for (const hour of times) {
      const d = new Date(tomorrow);
      d.setHours(hour, 0, 0, 0);

      await Appointment.create({
        doctorId: doctor._id,
        date: d,
        status: "available",
      });
    }

    console.log(
      "✅ Schedule Reset! Dr. House is free tomorrow at 9, 1, and 4."
    );
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

resetSchedule();
