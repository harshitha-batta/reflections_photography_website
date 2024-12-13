const mongoose = require('mongoose');
const Photo = require('./models/Photo'); // Path to your Photo model
const User = require('./models/User');  // Path to your User model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/photoGallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error(err));

async function seedDatabase() {
  try {
    // Example users (ensure these users exist in the database)
    const user1 = await User.findOne({ name: 'User 1' });
    const user2 = await User.findOne({ name: 'User 2' });

    if (!user1 || !user2) {
      console.log('Please ensure the users exist in the database before running this script.');
      return;
    }

    // Sample photo data
    const photos = [
      {
        url: 'https://cdn.glitch.global/dc604644-5d05-44f1-ab42-b5ead1bd10e0/dog.jpg?v=1734122850023',
        caption: 'Cute Dog',
        uploadedBy: user1._id,
      }
      // {
      //   url: '/uploads/photo2.jpg',
      //   caption: 'A serene lake surrounded by lush greenery',
      //   uploadedBy: user2._id,
      // },
      // {
      //   url: '/uploads/photo3.jpg',
      //   caption: 'A bustling cityscape at night',
      //   uploadedBy: user1._id,
      // },
    ];

    // Clear existing photos
    await Photo.deleteMany();
    console.log('Existing photos cleared.');

    // Insert new photos
    await Photo.insertMany(photos);
    console.log('Sample photos inserted.');

    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

// Run the script
seedDatabase();
