const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Google API se baat karne ke liye

const JWT_SECRET = 'EXintelligence_SECRET_KEY_2026';

// --- 1. REAL GOOGLE LOGIN ROUTE ---
router.post('/google-login', async (req, res) => {
    const { token } = req.body; // Frontend se Google Access Token aayega

    try {
        // A. Google ki API ko call karke user ki details mangwana
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const { email, name, sub: googleId } = googleResponse.data;

        // B. Check karein ki ye email hamare database mein pehle se hai?
        let user = await User.findOne({ email });

        if (!user) {
            // C. Agar naya user hai, toh use DB mein save karein
            user = new User({
                name: name,
                email: email,
                // Social login ke liye ek random secure password set kar dete hain
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
                businessName: 'Google Workspace' // Default name
            });
            await user.save();
            console.log("✅ New Google User Created:", email);
        }

        // D. Hamare system ka JWT Token banayein
        const jwtToken = jwt.sign(
            { id: user._id }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // E. Frontend ko token aur user details bhej dena
        res.json({ 
            token: jwtToken, 
            user: { id: user._id, name: user.name, businessName: user.businessName } 
        });

    } catch (err) {
        console.error("❌ Google Auth Error:", err.message);
        res.status(400).json({ message: "Google Authentication Failed" });
    }
});

// --- 2. REGULAR SIGNUP ROUTE (Email/Password) ---
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, businessName } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            businessName: businessName || 'Personal Entity' 
        });

        await newUser.save();
        res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. REGULAR LOGIN ROUTE (Email/Password) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "User not found." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, businessName: user.businessName } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;