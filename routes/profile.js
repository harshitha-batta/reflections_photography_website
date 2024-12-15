const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();

let gridfsBucket;
router.get('/', async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash('error', 'Unauthorized. Please log in.');
    return res.redirect('/auth/login');
  }

  try {
    // Verify the token and get the user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const userId = decoded.id;

    // Fetch the user's profile information
    const user = await User.findById(userId);

    // Fetch photos uploaded by this user
    const photos = await Photo.find({ uploader: userId }); // Filter photos by uploader

    // Pass user and their photos to the EJS template
    res.render('profile', {
      title: 'Your Profile',
      user,
      photos,
    });
  } catch (err) {
    console.error('JWT verification or database error:', err.message);
    req.flash('error', 'Session expired. Please log in again.');
    res.redirect('/auth/login');
  }
});


// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos',
  });
});


// Update user bio
router.post('/update-bio', isAuthenticated, async (req, res) => {
  const { bio } = req.body;

  try {
    // Debug log
    console.log('User ID:', req.user._id, 'Bio:', bio);

    // Update user bio
    const user = await User.findByIdAndUpdate(req.user._id, { bio }, { new: true });

    // Debug updated user
    console.log('Updated User:', user);

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
    console.log("HERE:", file)

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
      return res.redirect('/auth/profile');
    }

    const { title, description, category, tags } = req.body;

    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.filename,
      uploader: req.user.id, // Ensure this is set correctly
    });

    await newPhoto.save();

    // Optionally update the user's `uploadedPhotos` array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { uploadedPhotos: newPhoto._id },
    });

    req.flash('success', 'Photo uploaded successfully.');
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error uploading photo:', err);
    req.flash('error', 'Failed to upload photo.');
    res.redirect('/auth/profile');
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
