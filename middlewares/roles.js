const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setFlashMessage } = require('../utils/flash');

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

    // Attach user to the request
    req.user = user;
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
module.exports = { isAuthenticated, isAdmin };
