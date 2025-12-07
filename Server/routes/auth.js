const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // <--- FIX 1: Added missing import
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, sex, age, profilePicture } = req.body;

    // --- 1. SECURITY CHECK: Validate Password Strength ---
    // Regex: At least 8 chars, 1 letter, 1 number, 1 symbol
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password is too weak. It must be at least 8 characters long and include 1 letter, 1 number, and 1 symbol.",
      });
    }

    // --- 2. Check if user exists ---
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // --- 3. Hash Password ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- 4. Create User ---
    user = new User({
      name,
      email,
      password: hashedPassword, // Store the hash
      role,
      sex,
      age,
      profilePicture,
    });

    await user.save();

    res
      .status(201)
      .json({ msg: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN (Updated with JWT)
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found!");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).json("Wrong password!");

    // --- 2. GENERATE TOKEN ---
    // We put the User ID and Role inside the token.

    if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      return res.status(500).json({ msg: "Sunucu yapılandırma hatası." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload (Data inside token)
      process.env.JWT_SECRET, // Secret Key from .env
      { expiresIn: "5d" } // Expiration (5 days)
    );

    const { password, ...others } = user._doc;

    // --- 3. SEND TOKEN TO USER ---
    res.status(200).json({ ...others, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data (Load User)
router.get(
  "/user",
  require("../middleware/authMiddleware"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
