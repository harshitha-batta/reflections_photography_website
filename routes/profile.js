const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs'); // Your GridFS multer setup
const mongoose = require('mongoose');

const router = express.Router();

let gridfsBucket;

// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos', // Same bucket name as in the multer config
  });
  console.log('GridFSBucket initialized successfully.');
});

// Update user bio
router.post('/update-bio', isAuthenticated, async (req, res) => {
  const { bio } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, { bio });
    req.flash('success', 'Bio updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating bio:', err);
    req.flash('error', 'Failed to update bio.');
    res.redirect('/profile');
  }
});

// Upload profile photo
router.post('/upload-profile-photo', isAuthenticated, upload.single('profilePhoto'), async (req, res) => {
  try {
    const profilePhotoFilename = req.file.filename; // Get the GridFS filename
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: profilePhotoFilename });
    req.flash('success', 'Profile photo updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    req.flash('error', 'Failed to upload profile photo.');
    res.redirect('/profile');
  }
});

// Fetch profile and photos
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.find({ uploader: req.user._id }); // Fetch photos uploaded by the user
    console.log('Fetched Photos:', photos); // Log fetched photos
    res.render('profile', { title: 'Your Profile', user: req.user, photos });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).send('Error fetching profile data');
  }
});


// Stream profile photo
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
    res.set('Content-Type', file.contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.status(500).send('Error fetching profile photo');
  }
});

// Stream uploaded photos
router.get('/photo/:filename', async (req, res) => {
  try {
    const file = await mongoose.connection.db
      .collection('photos.files')
      .findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).send('Photo not found');
    }

    // Stream the file from GridFSBucket
    const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file.contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error('Error fetching photo:', err);
    res.status(500).send('Error fetching photo');
  }
});

// Upload photo with metadata
router.post('/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  console.log('Uploaded File:', req.file); // Log the uploaded file details
  console.log('User:', req.user); // Log the user uploading the file

  if (!req.file) {
    req.flash('error', 'Failed to upload photo.');
    return res.redirect('/profile/upload');
  }

  const { title, description, category, tags } = req.body;

  try {
    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.filename,
      uploader: req.user._id,
    });

    await newPhoto.save();
    console.log('Photo Metadata Saved:', newPhoto); // Log metadata saved
    req.flash('success', 'Photo uploaded successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error saving photo metadata:', err);
    req.flash('error', 'Failed to save photo metadata.');
    res.redirect('/profile/upload');
  }
});

module.exports = router;
