require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth'); // Authentication routes
const profileRoutes = require('./routes/profile'); // Profile routes
const galleryRoutes = require('./routes/gallery'); // Gallery routes
// const readerPostRoutes = require('./routes/readerPost'); //Posted image route
const { isAuthenticated, isAdmin } = require('./middlewares/roles'); // Role-based middleware

const app = express();

// Middleware for parsing JSON and forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Atlas Connection
let gridfsBucket; // Variable to hold GridFSBucket instance
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`
    );
    console.log('MongoDB Atlas connected successfully.');

    // Initialize GridFSBucket
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'photos', // Name of the GridFS bucket (must match multer config)
    });
    console.log('GridFSBucket initialized successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB(); // Connect to MongoDB

// Make GridFSBucket instance globally available
app.use((req, res, next) => {
  req.gridfsBucket = gridfsBucket; // Attach GridFSBucket to the request object
  next();
});

// Initialize cookie-parser middleware
app.use(cookieParser());

// Session configuration
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set in the environment variables.');
  process.exit(1);
}

const sessionStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}`,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Use the session store
    cookie: {
      maxAge: 3600000, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    },
  })
);

// Initialize Passport
require('./config/passport'); // Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Initialize flash middleware
app.use(flash());

// Middleware to pass flash messages to templates
app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

// Middleware to make user and role available to all templates
app.use((req, res, next) => {
  console.log('Session Data:', req.session); // Debugging log
  console.log('Cookies:', req.cookies); // Debugging log
  console.log('Authenticated User:', req.isAuthenticated() ? req.user : 'None'); // Debugging log

  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    console.log('User Role:', req.user.role); // Log user role for debugging
  } else {
    res.locals.user = null;
  }
  next();
});
app.use('/gallery', galleryRoutes); // Mount the gallery route at /gallery
// Profile routes
app.use('/profile', profileRoutes);
app.use('/', galleryRoutes); // Gallery route
// app.use('/readerPost', readerPostRoutes); // readerPost route

// Admin-only route for the admin dashboard
app.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', user: req.user });
});

// Routes
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
