const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { setFlashMessage } = require('../utils/flash'); // Correct import
const crypto = require('crypto');

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
router.get('/request-reset', (req, res) => {
  res.render('resetPassword', { title: 'Request Password Reset' });
});

// Show Login Page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Handle Register Form Submission
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    setFlashMessage(res, 'error', 'All fields are required.');
    return res.redirect('/auth/register');
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      setFlashMessage(res, 'error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();
    setFlashMessage(res, 'success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    setFlashMessage(res, 'error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});

// Request Password Reset Token (Using Email)
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found.');

    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    res.send({ message: 'Your reset token:', resetToken });
  } catch (err) {
    res.status(500).send('Error processing reset token.');
  }
});

// Reset Password Using Token
router.post('/reset-password-with-token', async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found.');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (user.passwordResetToken !== hashedToken || Date.now() > user.passwordResetExpires) {
      return res.status(400).send('Invalid or expired reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.send('Password reset successful. You can now log in.');
  } catch (err) {
    res.status(500).send('Error resetting password.');
  }
});

// Handle Login Form Submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      setFlashMessage(res, 'error', 'Incorrect email or password.');
      return res.redirect('/auth/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      setFlashMessage(res, 'error', 'Incorrect email or password.');
      return res.redirect('/auth/login');
    }

    const token = generateToken(user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });

    res.redirect('/');
  } catch (err) {
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
