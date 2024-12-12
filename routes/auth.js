const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('profile', { user: req.user });
  } else {
    res.redirect('/auth/login');
  }
});

// Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).send('User already exists.');

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).send('User registered successfully.');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in successfully');
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send(err.message);
    res.send('Logged out successfully');
  });
});

// Protected route
router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome ${req.user.name}`);
  } else {
    res.status(401).send('Unauthorized');
  }
});

module.exports = router;
