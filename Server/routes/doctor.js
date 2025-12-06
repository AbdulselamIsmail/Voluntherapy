const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");

// @route   POST /api/doctor/add-slot
// @desc    Doctor creates a new "Available" time slot
router.post("/add-slot", async (req, res) => {
  const { doctorId, date } = req.body;

  try {
    // 1. Validation: Does this doctor exist?
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res
        .status(401)
        .json({ msg: "Unauthorized: User is not a doctor" });
    }

    // 2. Create the Slot
    // Note: We don't need patientId or meetingLink yet, those come later!
    const newSlot = new Appointment({
      doctorId,
      date: new Date(date), // Ensure string is converted to Date object
      status: "available",
    });

    await newSlot.save();

    res.json({ msg: "Slot created successfully", slot: newSlot });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/doctor/my-slots/:doctorId
// @desc    See all slots (both open and booked) for this doctor
router.get("/my-slots/:doctorId", async (req, res) => {
  try {
    const slots = await Appointment.find({ doctorId: req.params.doctorId })
      .populate("patientId", "name email") // If booked, show who the patient is!
      .sort({ date: 1 }); // Sort by earliest date first

    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
