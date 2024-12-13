const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Photo = require('../models/Photo');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');

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
    const user = req.user;
    if (!user) {
      req.flash('error', 'Authentication failed.');
      return res.redirect('/auth/login');
    }

    const token = generateToken(user);
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
    const user = req.user;
    const photos = await Photo.find({ uploadedBy: user.id });

    res.render('profile', {
      title: 'Your Profile',
      user,
      photos,
    });
  } catch (err) {
    console.error('Error loading profile:', err.message);
    req.flash('error', 'An error occurred while loading your profile.');
    res.redirect('/auth/login');
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Photo Upload Route
router.post('/profile/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'No file uploaded.');
      return res.redirect('/auth/profile');
    }

    const photo = new Photo({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      caption: req.body.caption || '',
    });

    await photo.save();
    req.flash('success', 'Photo uploaded successfully!');
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error uploading photo:', err.message);
    req.flash('error', 'An error occurred while uploading the photo.');
    res.redirect('/auth/profile');
  }
});

// Admin Dashboard
router.get('/admin/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    res.render('admin/dashboard', { title: 'Admin Dashboard', user: req.user });
  } catch (err) {
    console.error('Admin Dashboard Error:', err.message);
    req.flash('error', 'Unable to load the admin dashboard.');
    res.redirect('/auth/login');
  }
});

// Admin Account Creation
router.post('/admin/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

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
    console.error('Error creating admin account:', err.message);
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
