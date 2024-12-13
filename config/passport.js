const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

// Define the Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`Authentication failed. No user found for email: ${email}`);
        return done(null, false, { message: 'No account found with this email.' });
      }
      console.log(`Found User: ${user.email}`);
      const isMatch = await user.validatePassword(password);
      console.log(`Password Validation for ${email}:`, isMatch);
      if (!isMatch) {
        console.log(`Authentication failed. Incorrect password for email: ${email}`);
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      console.error('Error during authentication:', err.message);
      return done(err);
    }
  })
);


// JWT Generation for Stateless Authentication
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in the environment.');
    throw new Error('JWT_SECRET must be defined for secure token generation.');
  }

  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role, // Include role for role-based access control
  };

  console.log('Generating JWT for user:', payload.email);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Serialize user into the session
passport.serializeUser((user, done) => {
  console.log(`Serializing user with ID: ${user.id}`);
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  console.log(`Attempting to deserialize user with ID: ${id}`);
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log(`Deserialization failed. No user found with ID: ${id}`);
      return done(null, false, { message: 'Session user not found.' });
    }

    console.log(`User successfully deserialized: ${user.email}`);
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization:', err.message);
    done(err, null);
  }
});

module.exports = { passport, generateToken };
