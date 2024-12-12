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

    // Validate inputs
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    // Save new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration Error:', err.message);
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});



// Handle Login Form Submission
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  }),
  (req, res) => {
    console.log('Login Successful:', req.user); // Debugging log
  }
);



router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Error during logout:', err.message);
      req.flash('error', 'An error occurred during logout.');
      return res.redirect('/');
    }
    req.flash('success', 'You have been logged out.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
