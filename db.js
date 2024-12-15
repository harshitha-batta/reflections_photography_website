const mongoose = require('mongoose');

let gridfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('MongoDB Atlas connected successfully.');

    // Initialize GridFSBucket
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'photos', // Name of the GridFS bucket
    });
    console.log('GridFSBucket initialized successfully.');

    return { gridfsBucket }; // Export the GridFSBucket instance
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process on failure
  }
};

module.exports = { connectDB, getGridFsBucket: () => gridfsBucket };
