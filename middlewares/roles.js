const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { setFlashMessage } = require('../utils/flash');

// Middleware to attach user if token exists (optional authentication)
async function attachUser(req, res, next) {
  console.log("Checking for JWT token..."); // Debug log
  const token = req.cookies.jwt;
  console.log("User being passed to EJS:", req.user || "No user found");
  if (!token) {
    console.log("No JWT token found. User is a guest.");
    req.user = null;
    res.locals.user = null; // Pass null user to templates
    return next();
  }

  try {
    // Verify and decode the token
    console.log("Token found. Verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    if (user) {
      console.log("Logged-in user:", user.name);
      req.user = user;
      res.locals.user = user; // Pass the user to templates
    } else {
      console.log("No user found for token.");
      req.user = null;
      res.locals.user = null;
    }
  } catch (err) {
    console.error("JWT verification error:", err.message);
    req.user = null;
    res.locals.user = null;
  }

  next();
}



// Middleware to enforce authentication
async function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    console.log('Unauthorized access attempt. No token provided.');
    setFlashMessage(req, 'error', 'You need to log in first.');
    return res.redirect('/auth/login');
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Fetch user details
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Authenticated token but user not found in DB.');
      setFlashMessage(req, 'error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }

    // Attach user to the request and ensure _id is a string for comparison
    req.user = user;
    req.user._id = user._id.toString();
    res.locals.user = user; // Attach user to templates

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      console.log('JWT token expired.');
      setFlashMessage(req, 'error', 'Your session has expired. Please log in again.');
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
  console.log('Access denied: User is not an admin.');
  res.status(403).json({ error: 'Access denied. Admins only.' });
}

// Export the middlewares
module.exports = {
  isAuthenticated,
  attachUser,
  isAdmin
};
