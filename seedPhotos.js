const mongoose = require('mongoose');
const Photo = require('./models/Photo'); // Path to your Photo model
const User = require('./models/User');  // Path to your User model

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Array of photos to insert
const seedPhotos = [
  {
    url: 'https://cdn.glitch.global/94b02b90-c4c0-4d86-a9ff-d495a773f14b/dog.jpg?v=1734124999253',
    caption: 'Cute Dog',
    uploadedBy: '64b5c1a9e7f2b2b12e8f1234', // Replace with valid User ID
    createdAt: new Date(),
  },
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing photos
    await Photo.deleteMany({});
    console.log('Existing photos cleared.');

    // Insert new photos
    await Photo.insertMany(seedPhotos);
    console.log('Photos seeded successfully.');
  } catch (err) {
    console.error('Error seeding photos:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
