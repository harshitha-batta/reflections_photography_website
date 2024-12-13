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
        console.log(`Authentication failed. No user found with email: ${email}`);
        return done(null, false, { message: 'Invalid email or password.' });
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        console.log(`Authentication failed. Incorrect password for email: ${email}`);
        return done(null, false, { message: 'Invalid email or password.' });
      }

      console.log(`User authenticated successfully: ${user.email}`);
      return done(null, user); // Pass the user object to `req.user`
    } catch (err) {
      console.error(`Error during authentication for email: ${email}`, err.message);
      return done(err);
    }
  })
);

// JWT Generation Function
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables.');
  }

  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role, // Include role for role-based access control
  };

  console.log(`Generating JWT for user: ${payload.email}`);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Serialize user into the session
passport.serializeUser((user, done) => {
  if (!user || !user.id) {
    console.error('Cannot serialize user. Missing user or user ID.');
    return done(new Error('Cannot serialize user.'));
  }
  console.log(`Serializing user with ID: ${user.id}`);
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log(`Deserialization failed. No user found with ID: ${id}`);
      return done(null, false, { message: 'Session user not found.' });
    }
    console.log(`User successfully deserialized: ${user.email}`);
    done(null, user);
  } catch (err) {
    console.error(`Error during deserialization for ID: ${id}`, err.message);
    done(err, null);
  }
});

module.exports = { passport, generateToken };
