const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

(async () => {
  try {
    // Connect to the database
    await mongoose.connect(
      `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    // Hash the password
    const hashedPassword = await bcrypt.hash('adminpassword', 10);

    // Create the admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin', // Set role to admin
    });

    await adminUser.save();
    console.log('Admin user created:', adminUser);
    process.exit();
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
})();
