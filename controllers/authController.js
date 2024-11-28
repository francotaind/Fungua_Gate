const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, addUser } = require("../models/userModel");
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Check for existing user
        const existingUser = await findUserByEmail(email);
        console.log('Existing user check result:', existingUser); // Debug log

        if (existingUser) {
            return res.status(400).json({ error: "Email already registered." });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await addUser(email, hashedPassword);
        console.log('User creation result:', result); // Debug log

        res.status(201).json({ 
            message: "User registered successfully.",
            userId: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific database errors
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Email already registered." });
        }
        
        res.status(500).json({ error: "Error registering user." });
    }
};

// Login a user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Find user by email
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "48h" }
        );
        
        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Error logging in." });
    }
};

module.exports = { registerUser, loginUser };
