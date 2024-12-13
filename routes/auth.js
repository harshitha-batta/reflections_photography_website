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
    console.log('Registration Body:', req.body); // Log registration data
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log('New user created:', newUser); // Debug user creation
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration Error:', err.message);
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});
//Get profile
router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', {
      title: 'Your Profile',
      user: req.user, // Pass the authenticated user to the view
    });
  } else {
    req.flash('error', 'Please log in to view this page.');
    res.redirect('/auth/login');
  }
});



// Handle Login Form Submission
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/auth/profile',
    failureRedirect: '/auth/login',
    failureFlash: true,
  }),
  (req, res) => {
    console.log('Authenticated User:', req.user); // Debug user object
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
