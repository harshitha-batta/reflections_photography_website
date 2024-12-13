const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Add this import

// Define the Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      console.log('Authenticating user with email:', email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log('User not found for email:', email);
        return done(null, false, { message: 'User not found' });
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        return done(null, false, { message: 'Invalid password' });
      }

      console.log('User authenticated successfully:', user);
      return done(null, user);
    } catch (err) {
      console.error('Error in LocalStrategy:', err.message);
      return done(err);
    }
  })
);

// Optional: JWT Generation for Sessionless Strategy
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
};

// Serialize user into the session
passport.serializeUser((user, done) => {
  console.log('Serializing user with ID:', user.id); // Only log the ID to avoid exposing sensitive data
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  console.log('Attempting to deserialize user with ID:', id);

  try {
    const user = await User.findById(id);

    if (!user) {
      console.log('No user found during deserialization for ID:', id);
      return done(null, false); // Return false to indicate no user found
    }

    console.log('User successfully deserialized:', user);
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization:', err.message);
    done(err, null); // Return null for user if an error occurs
  }
});

module.exports = { passport, generateToken };
