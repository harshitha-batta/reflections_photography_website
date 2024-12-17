const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { setFlashMessage } = require('../utils/flash'); // Correct import
const PasswordReset = require('../models/PasswordReset');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

  // Log request data for debugging
  console.log('Register request data:', { name, email, password, role });

  // Validate required fields
  if (!name || !email || !password) {
    console.error('Validation Error: Missing fields');
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
    console.log('User successfully registered:', { name, email, role });
    setFlashMessage(res, 'success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration Error:', err.message);
    setFlashMessage(res, 'error', 'An error occurred during registration.');
    res.redirect('/auth/register');
  }
});
router.get('/reset-password', (req, res) => {
  res.render('requestResetPassword', { title: 'Reset Password' });
});

// Route to request password reset
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send('User with this email does not exist.');
  }

  // Generate and hash reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = Date.now() + 3600000; // Token expires in 1 hour

  // Save the reset token to the PasswordReset collection
  await PasswordReset.create({
    email: user.email,
    resetToken: hashedToken,
    expiresAt,
  });

  // Create reset link
  const resetURL = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

  // Configure nodemailer to send the email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetURL}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    res.send('Password reset link sent to your email.');
  } catch (err) {
    console.error('Error sending email:', err.message);
    res.status(500).send('Failed to send password reset email.');
  }
});

// Route to display the reset form
router.get('/reset-password/:token', async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // Find the reset token in the PasswordReset collection
  const resetRequest = await PasswordReset.findOne({
    resetToken: hashedToken,
    expiresAt: { $gt: Date.now() }, // Token must not be expired
  });

  if (!resetRequest) {
    return res.status(400).send('Token is invalid or expired.');
  }

  // Render the password reset form and pass the email
  res.render('newPassword', { title: 'Set New Password', email: resetRequest.email });
});

// Route to handle new password submission
router.post('/reset-password/:token', async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // Find the valid reset token
  const resetRequest = await PasswordReset.findOne({
    resetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!resetRequest) {
    return res.status(400).send('Token is invalid or expired.');
  }

  // Find the user and update their password
  const user = await User.findOne({ email: resetRequest.email });
  if (!user) {
    return res.status(404).send('User not found.');
  }

  // Hash the new password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  await user.save();

  // Delete the reset request
  await PasswordReset.deleteOne({ _id: resetRequest._id });

  res.send('Your password has been reset successfully. You can now log in with your new password.');
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
    res.redirect('/');
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
