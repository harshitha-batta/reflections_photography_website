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


// Upload photo with tags
router.post('/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  const { title, description, category, tags } = req.body;

  try {
    // Create a new photo document
    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.filename, // Store the GridFS filename
      uploader: req.user._id,
    });

    await newPhoto.save();
    req.flash('success', 'Photo uploaded successfully.');
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error uploading photo:', err);
    req.flash('error', 'Failed to upload photo.');
    res.redirect('/auth/profile');
  }
});
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');

let gfs;

// Initialize GridFS
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('photos'); // Same bucket name as used in multer storage
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
    console.log('Requested Filename:', req.params.filename);

    const file = await gfs.files.findOne({ filename: req.params.filename });

    if (!file || file.length === 0) {
      console.log('File not found in GridFS.');
      return res.status(404).send('Profile photo not found');
    }

    console.log('File Found:', file);
    console.log('File MIME Type:', file.contentType);

    if (file.contentType.includes('image')) {
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      console.log('Invalid content type:', file.contentType);
      res.status(400).send('Not a valid image file');
    }
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.status(500).send('Error fetching profile photo');
  }
});



module.exports = router;
