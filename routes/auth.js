const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { setFlashMessage } = require('../server'); // Import utility

// JWT Generation Function
function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
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
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/auth/register');
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'Incorrect email or password.');
      return res.redirect('/auth/login');
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Incorrect email or password.');
      return res.redirect('/auth/login');
    }

    // Generate a token and send it to the client
    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });

    console.log('Generated JWT:', token);
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Login Error:', err.message);
    req.flash('error', 'An error occurred during login.');
    res.redirect('/auth/login');
  }
});

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/auth/login');
    }

    const photos = await Photo.find({ uploader: user._id });

    // Render the profile.ejs template
    res.render('profile', {
      title: 'Your Profile',
      user,
      photos,
    });
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    req.flash('error', 'Unable to fetch profile details.');
    res.redirect('/auth/login');
  }
});


// Admin Dashboard
router.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', user: req.user });
});

// Admin Account Creation (Only for Admins)
router.post('/admin/create', isAuthenticated, isAdmin, async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Create a new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin account created successfully.', admin: newAdmin });
  } catch (err) {
    console.error('Admin Account Creation Error:', err.message);
    res.status(500).json({ error: 'An error occurred while creating the admin account.' });
  }
});

// Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('success', 'You have been logged out.');
  res.redirect('/auth/login');
});


module.exports = router;
