const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs');
const mongoose = require('mongoose');

const router = express.Router();

let gridfsBucket;
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.find({ uploader: req.user._id }); // Fetch user-uploaded photos
    console.log('User Data:', req.user); // Debug logged-in user
    console.log('Photos:', photos); // Debug fetched photos

    res.render('profile', {
      title: 'Your Profile',
      user: req.user, // Pass user data to the view
      photos, // Pass photos to the view
    });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).send('Error fetching profile data');
  }
});

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
    if (!req.file) {
      req.flash('error', 'No file uploaded.');
      return res.redirect('/profile');
    }

    const profilePhotoFilename = req.file.filename;
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
    const photos = await Photo.find({ uploader: req.user._id });
    res.render('profile', { title: 'Your Profile', user: req.user, photos });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).send('Error fetching profile data');
  }
});

// Stream profile photo
router.get('/profile-photo/:filename', async (req, res) => {
  try {
    const file = await gridfsBucket.find({ filename: req.params.filename }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).send('Profile photo not found');
    }

    const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file[0].contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.status(500).send('Error fetching profile photo');
  }
});

// Stream uploaded photos
router.get('/photo/:filename', async (req, res) => {
  try {
    const file = await gridfsBucket.find({ filename: req.params.filename }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).send('Photo not found');
    }

    const readStream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    res.set('Content-Type', file[0].contentType);
    readStream.pipe(res);
  } catch (err) {
    console.error('Error fetching photo:', err);
    res.status(500).send('Error fetching photo');
  }
});
router.post('/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'No file uploaded.');
      return res.redirect('/profile/upload');
    }

    const { title, description, category, tags } = req.body;

    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imagePath: req.file.filename, // Filename saved in GridFS
      uploader: req.user._id, // Reference to the logged-in user
    });

    await newPhoto.save(); // Save photo metadata to the database
    req.flash('success', 'Photo uploaded successfully.');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading photo:', err);
    req.flash('error', 'Failed to upload photo.');
    res.redirect('/profile/upload');
  }
});


// Upload photo with metadata

router.get('/upload', isAuthenticated, (req, res) => {
  res.render('upload', {
    title: 'Upload Photo',
    user: req.user,
    errorMessage: req.flash('error'),
    successMessage: req.flash('success'),
  });
});
;

module.exports = router;
