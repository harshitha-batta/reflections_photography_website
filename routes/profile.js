const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs'); // Your GridFS multer setup

const router = express.Router();

// Update user bio
router.post('/update-bio', isAuthenticated, async (req, res) => {
  const { bio } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { bio });
    req.flash('success', 'Bio updated successfully.');
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error updating bio:', err);
    req.flash('error', 'Failed to update bio.');
    res.redirect('/auth/profile');
  }
});

// Upload profile photo
router.post('/upload-profile-photo', isAuthenticated, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.user) {
      req.flash('error', 'You need to log in first.');
      return res.redirect('/auth/login');
    }

    const profilePhotoFilename = req.file.filename; // Get the GridFS filename
    await User.findByIdAndUpdate(req.user.id, { profilePhoto: profilePhotoFilename });
    req.flash('success', 'Profile photo updated successfully.');
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    req.flash('error', 'Failed to upload profile photo.');
    res.redirect('/auth/profile');
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.find({ uploader: req.user.id }); // Fetch photos uploaded by the user
    res.render('profile', { title: 'Your Profile', user: req.user, photos });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).send('Error fetching profile data');
  }
});


const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');

let gfs;
let gridfsBucket;

// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos', // Same bucket name as in the multer config
  });
  console.log('GridFSBucket initialized successfully.');
});

// Route to display an image
router.get('/image/:filename', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file || file.length === 0) {
      return res.status(404).send('File not found');
    }

    // Check if the file is an image
    if (file.contentType.includes('image')) {
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      res.status(400).send('Not an image file');
    }
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).send('Error fetching image');
  }
});
router.get('/profile-photo/:filename', async (req, res) => {
  try {
    const file = await mongoose.connection.db
      .collection('photos.files')
      .findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).send('Profile photo not found');
    }

    // Stream the file from GridFSBucket
    const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file.contentType); // Set the content type of the response
    readStream.pipe(res);
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.status(500).send('Error fetching profile photo');
  }
});
// Upload photo with tags
router.post('/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  const { title, description, category, tags } = req.body;

  console.log('Logged-in User:', req.user); // Debug logged-in user

  try {
    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.filename, // Store the GridFS filename or file path
      uploader: req.user.id, // Assign the logged-in user's ID
    });

    await newPhoto.save();
    req.flash('success', 'Photo uploaded successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading photo:', err);
    req.flash('error', 'Failed to upload photo.');
    res.redirect('/profile');
  }
});





module.exports = router;
