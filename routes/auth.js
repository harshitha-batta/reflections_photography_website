const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Replace with the path to your User model
const passport = require('passport');
const bcrypt = require('bcrypt'); // To hash passwords securely
const jwt = require('jsonwebtoken');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const Photo = require('../models/Photo'); // Assuming Photo model for user content
const Comment = require('../models/Comment'); // Assuming Comment model

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
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Login Error:', err.message);
    req.flash('error', 'An error occurred during login.');
    res.redirect('/auth/login');
  }
});

// Get Profile Page
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    if (decoded.role === 'admin') {
      // Admin-specific data (optional statistics, user activity)
      const users = await User.find().select('name email role');
      res.render('profile/admin', { title: 'Admin Dashboard', user: decoded, users });
    } else {
      // User-specific data (photos, likes, comments)
      const photos = await Photo.find({ uploadedBy: decoded.id });
      const comments = await Comment.find({ userId: decoded.id });
      res.render('profile/user', { title: 'Your Profile', user: decoded, photos, comments });
    }
  } catch (err) {
    console.error('Profile Error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
});

// Admin-Specific Routes
router.get('/admin/manage-galleries', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const galleries = await Photo.find(); // Replace with Gallery model if available
    res.render('admin/manage-galleries', { title: 'Manage Galleries', galleries });
  } catch (err) {
    console.error('Error fetching galleries:', err.message);
    req.flash('error', 'Unable to fetch galleries.');
    res.redirect('/auth/profile');
  }
});

router.get('/admin/manage-comments', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const comments = await Comment.find();
    res.render('admin/manage-comments', { title: 'Moderate Comments', comments });
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    req.flash('error', 'Unable to fetch comments.');
    res.redirect('/auth/profile');
  }
});

// User Content Routes
router.get('/profile/photos', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.find({ uploadedBy: req.user.id });
    res.render('profile/photos', { title: 'Your Photos', photos });
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    req.flash('error', 'Unable to fetch photos.');
    res.redirect('/auth/profile');
  }
});

router.get('/profile/comments', isAuthenticated, async (req, res) => {
  try {
    const comments = await Comment.find({ userId: req.user.id });
    res.render('profile/comments', { title: 'Your Comments', comments });
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    req.flash('error', 'Unable to fetch comments.');
    res.redirect('/auth/profile');
  }
});

// Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('success', 'You have been logged out.');
  res.redirect('/auth/login');
});

module.exports = router;
