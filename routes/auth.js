const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Replace with the path to your User model
const passport = require('passport');
const bcrypt = require('bcrypt'); // To hash passwords securely

// Handle Register Form Submission
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send('User already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.redirect('/auth/login'); // Redirect to login page after successful registration
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Handle Login Form Submission
router.post('/login', passport.authenticate('local', {
  successRedirect: '/', // Redirect to the home page after successful login
  failureRedirect: '/auth/login', // Redirect back to login page on failure
  failureFlash: false, // Set to true if you're using flash messages
}));

module.exports = router;
