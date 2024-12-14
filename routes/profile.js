const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

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
    const profilePhotoPath = req.file.path;
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: profilePhotoPath });
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
    const newPhoto = new Photo({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.path,
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

module.exports = router;
