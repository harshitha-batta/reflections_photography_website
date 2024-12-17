const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin, isAuthenticated } = require('../middlewares/roles');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { setFlashMessage } = require('../utils/flash'); // Correct import
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset');
const Category = require('../models/Category');
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
// Render Request Reset Page
// Render Request Reset Page
router.get('/request-reset', (req, res) => {
  res.render('requestReset', { title: 'Request Password Reset', message: '' });
});


// Handle Request Reset Token
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      setFlashMessage(res, 'error', 'Email not found.');
      return res.redirect('/auth/request-reset');
    }

    // Delete any existing reset request for the email
    await PasswordReset.deleteOne({ email });

    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token to PasswordReset collection
    await PasswordReset.create({
      email,
      resetToken: hashedToken,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });

    console.log('Plain Token:', resetToken);
    console.log('Hashed Token:', hashedToken);

    // Inform the user
    res.render('tokenSent', { title: 'Token Sent', resetToken });
  } catch (err) {
    console.error('Error creating reset token:', err);
    res.render('requestReset', {
      title: 'Request Password Reset',
      message: 'An error occurred. Please try again.',
    });
  }
});




// Render Submit Token Page
// Render Submit Token Page
router.get('/submit-token', (req, res) => {
  res.render('submitToken', { title: 'Submit Reset Token', message: '', email: '' });
});


// Verify Token and Render Reset Password Page
router.post('/verify-token', async (req, res) => {
  const { email, token } = req.body;

  try {
    const cleanToken = token.trim().toUpperCase();
    const hashedToken = crypto.createHash('sha256').update(cleanToken).digest('hex');

    console.log('Searching PasswordReset with:');
    console.log('Email:', email);
    console.log('Hashed Token:', hashedToken);

    // Query the PasswordReset collection
    const resetRequest = await PasswordReset.findOne({
      email: email,
      resetToken: hashedToken,
      expiresAt: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!resetRequest) {
      console.log('Reset token validation failed.');
      return res.render('submitToken', {
        title: 'Submit Reset Token',
        message: 'Invalid or expired reset token.',
        email: email,
      });
    }

    console.log('Reset token validated successfully.');

    // Proceed to reset the password
    res.render('resetPassword', {
      title: 'Reset Password',
      email: email,
      message: 'Token verified! Enter your new password.',
    });
  } catch (err) {
    console.error('Error verifying reset token:', err);
    res.render('submitToken', {
      title: 'Submit Reset Token',
      message: 'An error occurred during token verification.',
      email: email,
    });
  }
});


// Render Reset Password Page
router.get('/reset-password', (req, res) => {
  res.render('resetPassword', { title: 'Reset Password' });
});

// Handle Password Reset
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      setFlashMessage(res, 'error', 'User not found.');
      return res.redirect('/auth/reset-password');
    }

    // Update the user's password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Delete reset token entry
    await PasswordReset.deleteOne({ email });

    res.render('login', {
      title: 'Login',
      message: 'Password reset successful. You can now log in.',
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.render('resetPassword', {
      title: 'Reset Password',
      message: 'An error occurred. Please try again.',
      email: email,
    });
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
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    // Fetch photos uploaded by the authenticated user
    const photos = await Photo.find({ uploader: req.user._id }).populate('category');

    const categories = await Category.find({}); // Fetch categories for dropdown

    res.render('profile', {
      title: 'Your Profile',
      user: req.user,
      photos,        // Pass photos to the template
      categories,    // Pass categories to the template
    });
  } catch (err) {
    console.error('Error fetching profile data:', err.message);
    res.status(500).send('Error fetching profile data.');
  }
});


// Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  setFlashMessage(res, 'success', 'You have been logged out.');
  res.redirect('/auth/login');
});


module.exports = router;
