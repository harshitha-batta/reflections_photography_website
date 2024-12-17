require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const path = require('path');
const jwt = require('jsonwebtoken');
const { connectDB, getGridFsBucket } = require('./db'); // Import MongoDB connection
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const galleryRoutes = require('./routes/gallery');
const readerPostRoutes = require('./routes/readerPost'); //Posted image route
const adminRoutes = require('./routes/admin');
const { attachUser, isAuthenticated, isAdmin } = require('./middlewares/roles');
const { setFlashMessage } = require('./utils/flash');
const app = express();
const methodOverride = require('method-override');
const addCommentsRoutes = require('./routes/addComments');
const Category = require('./models/Category'); 
const Photo = require('./models/Photo'); 

const PasswordReset = require('./models/PasswordReset');
// Middleware for parsing JSON and forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname)));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));

// MongoDB Connection
connectDB(); // Establish MongoDB connection

// Attach GridFSBucket to the request object
app.use((req, res, next) => {
  req.gridfsBucket = getGridFsBucket();
  next();
});
app.use((req, res, next) => {
  res.locals.flash = res.locals.flash || {}; // Ensure flash is always defined
  next();
});

// Initialize cookie-parser middleware
app.use(cookieParser()); // Use cookie-parser middleware
app.use(attachUser);
// Middleware to set and read flash messages using cookies
app.use((req, res, next) => {
  res.locals.successMessage = req.cookies.successMessage || null;
  res.locals.errorMessage = req.cookies.errorMessage || null;

  // Clear flash messages after they are passed to the view
  res.clearCookie('successMessage');
  res.clearCookie('errorMessage');

  next();
});

// Serve static files first
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.user = req.user; // Pass `user` to all templates
  next();
});
// Utility to set flash messages

// Middleware to make user and role available to all templates
app.use((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      res.locals.user = decoded; // Attach decoded JWT payload to templates
      console.log('Authenticated User:', decoded);
    } catch (err) {
      console.error('JWT verification error:', err.message);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// Dynamic routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/', galleryRoutes);
app.use('/', readerPostRoutes); // Dynamic photo routes
app.use('/admin', adminRoutes);
app.use('/addComments', addCommentsRoutes);


// Admin-only route for the admin dashboard
app.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', user: req.user });
});

app.get('/about', (req, res) => {
  res.render('AboutUs'); 
});

app.get('/gallery', async (req, res) => {
  try {
    // Fetch categories and photos from MongoDB
    const categories = await Category.find(); // Fetch all categories
    const photos = await Photo.find(); // Fetch all photos

    // Pass fetched data to gallery.ejs
    res.render('gallery', { categories, photos, heroPhotos: photos.slice(0, 3) }); // First 3 photos as heroPhotos
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).send('Something went wrong!');
});



// Cleanup expired reset tokens every hour
setInterval(async () => {
  try {
    await PasswordReset.deleteMany({ expiresAt: { $lt: Date.now() } });
    console.log('Expired reset tokens cleaned up.');
  } catch (err) {
    console.error('Error cleaning up expired tokens:', err);
  }
}, 60 * 60 * 1000); // Runs every hour

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { setFlashMessage };
