const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config(); // To load environment variables

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}`,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'photos', // Name of the GridFS bucket
      filename: `${Date.now()}-${file.originalname}`, // Unique filename
    };
  },
});

// Configure multer to use the GridFS storage
const upload = multer({ storage });

module.exports = upload;
