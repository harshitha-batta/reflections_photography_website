const mongoose = require('mongoose');
const User = require('./models/User');
const Photo = require('./models/Photo');
const Comment = require('./models/Comment');

// Load environment variables
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`;

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

// Function to clean up orphaned photos and comments
async function cleanupOrphanedData() {
  try {
    // 1. Identify orphaned photos
    const orphanedPhotos = await Photo.find({ uploader: { $nin: await User.find().select('_id') } });
    console.log(`Found ${orphanedPhotos.length} orphaned photos.`);

    // Delete orphaned photos
    for (const photo of orphanedPhotos) {
      console.log(`Deleting photo with ID: ${photo._id}`);
      await photo.deleteOne();
    }

    // 2. Identify orphaned comments
    const orphanedComments = await Comment.find({ user: { $nin: await User.find().select('_id') } });
    console.log(`Found ${orphanedComments.length} orphaned comments.`);

    // Delete orphaned comments
    for (const comment of orphanedComments) {
      console.log(`Deleting comment with ID: ${comment._id}`);
      await comment.deleteOne();
    }

    console.log('Orphaned photos and comments have been cleaned up.');
  } catch (err) {
    console.error('Error cleaning up orphaned data:', err.message);
  }
}

// Run the cleanup
async function main() {
  await connectDB();
  await cleanupOrphanedData();
  mongoose.connection.close();
  console.log('Database connection closed.');
}

main();
