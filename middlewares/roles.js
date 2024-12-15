const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash('error', 'You need to log in first.');
    return res.redirect('/auth/login');
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Fetch user details
    const user = await User.findById(decoded.id);
    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }

    // Attach user to the request
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      req.flash('error', 'Session expired. Please log in again.');
    } else {
      req.flash('error', 'Invalid session. Please log in again.');
    }
    res.redirect('/auth/login');
  }
}
// Middleware to verify if the user is an admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // If the user is not an admin, redirect to the home page with a flash message
  req.flash('error', 'Access denied. Admins only.');
  res.redirect('/');
}

// Export the middlewares
module.exports = { isAuthenticated, isAdmin };
