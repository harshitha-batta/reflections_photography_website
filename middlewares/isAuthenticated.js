module.exports = (req, res, next) => {
  if (req.isAuthenticated) {
    return next();
  }
  req.flash('error', 'Please log in to continue');
  res.redirect('/login');
};
