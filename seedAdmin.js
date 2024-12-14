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

    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      process.exit();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('adminpassword', 10);

    // Create the admin user with the updated schema
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword, // Store the hashed password
      role: 'admin', // Set role to admin
      bio: 'Administrator account', // Default bio for admin
      profilePhoto: '', // Default profile photo (empty for now)
      uploadedPhotos: [], // No uploaded photos initially
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser);
    process.exit();
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
})();
