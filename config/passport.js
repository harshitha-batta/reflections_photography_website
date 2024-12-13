const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
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
      console.error('Error in LocalStrategy:', err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Attempting to deserialize user with ID:', id);
  try {
    const user = await User.findById(id);
    if (user) {
      console.log('User found during deserialization:', user);
      done(null, user);
    } else {
      console.log('No user found for ID:', id);
      done(null, null);
    }
  } catch (err) {
    console.error('Error during deserialization:', err);
    done(err, null);
  }
});


module.exports = passport;
