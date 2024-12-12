const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Replace with the path to your User model
const passport = require('passport');
const bcrypt = require('bcrypt'); // To hash passwords securely

// Show Register Page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' }); // Renders the register.ejs view
});

// Show Login Page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' }); // Renders the login.ejs view
});

// Handle Register Form Submission
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'User already exists.');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error during registration:', err.message);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/register');
  }
});


// Handle Login Form Submission
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true, // Enable flash messages for login failure
}));


module.exports = router;
