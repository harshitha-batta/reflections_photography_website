const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setFlashMessage } = require('../utils/flash');
// Middleware to attach user if token exists (optional authentication)
async function attachUser(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.user = null; // No user for guests
    return next();
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    req.user = user || null; // Attach user or null if not found
  } catch (err) {
    console.error('JWT verification error:', err.message);
    req.user = null; // Treat errors as unauthenticated
  }

  next();
}

async function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    setFlashMessage(req, 'error', 'You need to log in first.');
    return res.redirect('/auth/login');
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Fetch user details
    const user = await User.findById(decoded.id);
    if (!user) {
      setFlashMessage(req, 'error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }

    // Attach user to the request and ensure _id is an ObjectId
    req.user = user;
    req.user._id = user._id.toString(); // Ensure _id is a string for comparison

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      setFlashMessage(req, 'error', 'Session expired. Please log in again.');
    } else {
      setFlashMessage(req, 'error', 'Invalid session. Please log in again.');
    }
    res.redirect('/auth/login');
  }
}
// Middleware to verify if the user is an admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Admins only.' });
}

// Export the middlewares
module.exports = { isAuthenticated, attachUser, isAdmin };
