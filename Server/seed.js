const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // <--- 1. Import bcryptjs
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log("🔥 Destroying old data...");
    await Appointment.deleteMany();
    await User.deleteMany();

    console.log("🔒 Generating Password Hash...");

    // --- 2. Generate the hash ONCE for password "StrongPassword123!" ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("StrongPassword123!", salt);

    console.log("🌱 Creating Users...");

    // --- 3. Create 3 Doctors (Use the hashed variable) ---
    const doctors = await User.create([
      {
        name: "Dr. Gregory House",
        email: "house@hospital.com",
        password: hashedPassword, // <--- Using the hash
        role: "doctor",
        sex: "male",
        profilePicture: "https://i.pravatar.cc/150?img=11",
      },
      {
        name: "Dr. Lisa Cuddy",
        email: "cuddy@hospital.com",
        password: hashedPassword, // <--- Using the hash
        role: "doctor",
        sex: "female",
        profilePicture: "https://i.pravatar.cc/150?img=5",
      },
      {
        name: "Dr. James Wilson",
        email: "wilson@hospital.com",
        password: hashedPassword, // <--- Using the hash
        role: "doctor",
        sex: "male",
        profilePicture: "https://i.pravatar.cc/150?img=8",
      },
    ]);

    // --- 4. Create 3 Patients (Use the hashed variable) ---
    const patients = await User.create([
      {
        name: "Marty McFly",
        email: "marty@future.com",
        password: hashedPassword, // <--- Using the hash
        role: "patient",
        sex: "male",
        age: 17,
      },
      {
        name: "Sarah Connor",
        email: "sarah@skynet.com",
        password: hashedPassword, // <--- Using the hash
        role: "patient",
        sex: "female",
        age: 29,
      },
      {
        name: "Tony Stark",
        email: "tony@avengers.com",
        password: hashedPassword, // <--- Using the hash
        role: "patient",
        sex: "male",
        age: 45,
      },
    ]);

    console.log(
      `✅ Created ${doctors.length} Doctors and ${patients.length} Patients.`
    );
    console.log("🌱 Creating 5 Appointments per Doctor...");

    // Helper to generate a date relative to today
    const getDate = (daysAdd, hour) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAdd);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    const timeOffsets = [
      { days: 0, hour: 9 }, // Today Morning
      { days: 0, hour: 14 }, // Today Afternoon
      { days: 1, hour: 10 }, // Tomorrow Morning
      { days: 1, hour: 16 }, // Tomorrow Afternoon
      { days: 2, hour: 11 }, // Day After
    ];

    let totalSlots = 0;

    for (const doc of doctors) {
      for (const time of timeOffsets) {
        await Appointment.create({
          doctorId: doc._id,
          date: getDate(time.days, time.hour),
          status: "available",
        });
        totalSlots++;
      }
    }

    console.log(`✅ Successfully created ${totalSlots} Available Slots.`);
    console.log("-----------------------------------------");
    console.log("🧪 TEST DATA INFO:");
    console.log(`Doctors: ${doctors.map((d) => d.name).join(", ")}`);
    console.log(`Patients: ${patients.map((p) => p.name).join(", ")}`);
    console.log(`Password for all: StrongPassword123!`);
    console.log("-----------------------------------------");

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
