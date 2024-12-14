const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash('error', 'You need to log in first.');
    return res.redirect('/auth/login');
  }

  try {
    // Verify the token and attach the decoded user to `req.user`
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    return res.redirect('/auth/login');
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
