function isAuthenticated(req, res, next) {
  console.log('Authenticated:', req.isAuthenticated());
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You need to log in first.');
  res.redirect('/auth/login');
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
