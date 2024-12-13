function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You need to log in first.');
  res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
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
