const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    console.log('No JWT found in cookies.');
    req.flash('error', 'Unauthorized. Please log in.');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded JWT:', decoded); // Debugging log
    req.user = decoded; // Populate req.user
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
}


function isAdmin(req, res, next) {
  console.log('Authenticated:', req.isAuthenticated());
  console.log('User Role:', req.user?.role); // Debugging log
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  req.flash('error', 'Access denied. Admins only.');
  res.redirect('/');
}

function hasRole(requiredRole) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === requiredRole) return next();
    req.flash('error', 'Access denied. Insufficient permissions.');
    res.redirect('/');
  };
}

module.exports = { isAuthenticated, isAdmin, hasRole };
