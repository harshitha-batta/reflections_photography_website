// middleware/isAuthenticated.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next(); // User is authenticated
  }
  // Redirect or send JSON response if unauthenticated
  req.flash('error', 'You must log in to add a comment');
  return res.redirect('/login');
};
