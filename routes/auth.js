const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { setFlashMessage } = require('../utils/flash'); // Correct import

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

  // Log incoming data
  console.log('Register request data:', { name, email, password, role });

  // Validate input
  if (!name || !email || !password) {
    console.error('Validation Error: Missing fields');
    setFlashMessage(res, 'error', 'All fields are required.');
    return res.redirect('/auth/register');
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error('Duplicate Email Error:', email);
      setFlashMessage(res, 'error', 'Email is already registered.');
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
    console.log('User successfully registered:', { name, email, role });
    setFlashMessage(res, 'success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration Error:', err.message, err.stack);
    setFlashMessage(res, 'error', 'An error occurred during registration.');
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
      setFlashMessage(res, 'error', 'Incorrect email or password.');
      return res.redirect('/auth/login');
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      setFlashMessage(res, 'error', 'Incorrect email or password.');
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
    setFlashMessage(res, 'error', 'An error occurred during login.');
    res.redirect('/auth/login');
  }
});

// Get Profile Page
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      setFlashMessage(res, 'error', 'User not found.');
      return res.redirect('/auth/login');
    }

    const photos = await Photo.find({ uploader: user._id });

    res.render('profile', {
      title: 'Your Profile',
      user,
      photos,
    });
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    setFlashMessage(res, 'error', 'Unable to fetch profile details.');
    res.redirect('/auth/login');
  }
});

// Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  setFlashMessage(res, 'success', 'You have been logged out.');
  res.redirect('/auth/login');
});

module.exports = router;
