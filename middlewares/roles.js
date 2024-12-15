const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify authentication
async function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash('error', 'You need to log in first.');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Fetch full user data from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }

    req.user = user; // Attach full user object to `req.user`
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    return res.redirect('/auth/login');
  }
}

// Middleware to set global `user` for templates
async function setUserInLocals(req, res, next) {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const user = await User.findById(decoded.id);
      if (user) {
        res.locals.user = user; // Set user globally for templates
      } else {
        res.locals.user = null;
      }
    } catch (err) {
      console.error('Error setting user in locals:', err.message);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }

  next();
}

// Middleware to check admin role
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admins only.');
  res.redirect('/');
}

// Middleware to check specific roles
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      return next();
    }
    req.flash('error', 'Access denied. Insufficient permissions.');
    res.redirect('/');
  };
}

module.exports = { isAuthenticated, isAdmin, hasRole, setUserInLocals };
