const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Replace with the path to your User model
const passport = require('passport');
const bcrypt = require('bcrypt'); // To hash passwords securely
const jwt = require('jsonwebtoken');

// JWT Generation Function
function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role, // Include role in the token
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
}

// Show Register Page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// Show Login Page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle Register Form Submission
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role
    });

    await newUser.save();
    console.log('New User Registered:', newUser); // Debugging log
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration Error:', err.message);
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});

// Handle Login Form Submission
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  try {
    const token = generateToken(req.user);
    console.log('Generated JWT:', token); // Debugging log
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Enable in production
      sameSite: 'lax', // Prevent CSRF
      maxAge: 3600000, // 1 hour
    });
    console.log('JWT Cookie Set:', res.getHeader('Set-Cookie')); // Debugging log
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Login Error:', err.message);
    req.flash('error', 'An error occurred during login.');
    res.redirect('/auth/login');
  }
});

// Get Profile Page
router.get('/profile', (req, res) => {
  console.log('Incoming Cookies:', req.cookies); // Debugging log

  const token = req.cookies.jwt;
  if (!token) {
    req.flash('error', 'Unauthorized. Please log in.');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded JWT:', decoded); // Debugging log
    res.render('profile', { title: 'Your Profile', user: decoded });
  } catch (err) {
    console.error('JWT verification error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
});

// Admin-Only Route Example
router.get('/admin/dashboard', (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash('error', 'Unauthorized. Please log in.');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    if (decoded.role !== 'admin') {
      req.flash('error', 'Access denied. Admins only.');
      return res.redirect('/');
    }

    res.render('admin/dashboard', { title: 'Admin Dashboard', user: decoded });
  } catch (err) {
    console.error('Admin Route Error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
});

// Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('success', 'You have been logged out.');
  res.redirect('/auth/login');
});

module.exports = router;
