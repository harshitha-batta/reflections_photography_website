const User = require('./models/User');
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const userEmail = 'user12@example.com'; // The email of the user to promote
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { role: 'admin' },
      { new: true }
    );

    console.log('User promoted to admin:', updatedUser);
    process.exit();
  } catch (err) {
    console.error('Error updating user role:', err.message);
    process.exit(1);
  }
})();
