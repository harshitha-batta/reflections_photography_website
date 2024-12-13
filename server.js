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
const { isAuthenticated, isAdmin } = require('./middlewares/roles'); // Role-based middleware

const app = express();

// Middleware for parsing JSON and forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB(); // Connect to MongoDB

// Initialize cookie-parser middleware
app.use(cookieParser());

// Session configuration
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set in the environment variables.');
  process.exit(1);
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
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
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    console.log(`Authenticated User: ${req.user.email}, Role: ${req.user.role}`);
  } else {
    res.locals.user = null;
    console.log('No authenticated user.');
  }
  next();
});

// Define the root route
app.get('/', (req, res) => {
  res.render('gallery', { title: 'Home Page' }); // Render an EJS view
});

// Admin-only route for the admin dashboard
app.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/dashboard', { title: 'Admin Dashboard', user: req.user });
});

// Routes
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message || err);
  res.status(err.status || 500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
