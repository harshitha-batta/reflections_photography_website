require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const authRoutes = require('./routes/auth'); // Adjust the path if needed
const app = express();

// Middleware for parsing JSON and forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('MongoDB Atlas connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB(); // Call the async function

// Session configuration
app.use(
  session({
    secret: 'your_secret_key', // Change this to something secure
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}`,
    }),
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

// Make user variable available to all EJS templates
app.use((req, res, next) => {
  console.log('Current user:', req.user); // Log the user object for debugging
  res.locals.user = req.user || null;
  next();
});

// Define the root route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page' }); // Render an EJS view
});

// Routes
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
const flash = require('connect-flash');

// Add flash middleware
app.use(flash());

// Middleware to make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
