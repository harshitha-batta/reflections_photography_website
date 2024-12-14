const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config(); // Load environment variables

// MongoDB URI
const mongoURI = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}`;

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: 'photos', // Name of the GridFS bucket
      filename: `${Date.now()}-${file.originalname}`, // Unique filename
    };
  },
});

// Error handling for GridFS initialization
storage.on('connection', (db) => {
  console.log('GridFS connected successfully.');
});

storage.on('connectionFailed', (err) => {
  console.error('Failed to connect to GridFS:', err);
});

// Configure multer to use the GridFS storage
const upload = multer({ storage });

module.exports = upload;
