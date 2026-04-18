const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    console.log("Signup attempt for:", req.body.email); // Debugging ke liye
    try {
        const { name, email, password, businessName } = req.body;

        // Check karein user pehle se to nahi hai
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            businessName: businessName || 'Individual' 
        });

        await newUser.save();
        console.log("✅ User registered successfully!");
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        console.error("❌ Signup Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    console.log("Login attempt for:", req.body.email); // Debugging ke liye
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found. Please Sign Up." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Token banana (JWT)
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'DEER_AUTO_SECRET_KEY', 
            { expiresIn: '1d' }
        );

        console.log("✅ Login Successful!");
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                businessName: user.businessName 
            } 
        });
    } catch (err) {
        console.error("❌ Login Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;