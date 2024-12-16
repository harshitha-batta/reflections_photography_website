const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const Category = require('../models/Category'); // Import Category model
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs');
const mongoose = require('mongoose');

const { setFlashMessage } = require('../utils/flash');
const router = express.Router();

let gridfsBucket;

// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos',
  });
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

// Update bio
router.post('/update-bio', isAuthenticated, async (req, res) => {
  try {
    const { bio } = req.body;
    await User.findByIdAndUpdate(req.user._id, { bio });
    setFlashMessage(res, 'success', 'Bio updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating bio:', err.message);
    setFlashMessage(res, 'error', 'Failed to update bio.');
    res.redirect('/profile');
  }
});

// Upload photo with metadata
router.get('/upload-photo', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch categories dynamically
    res.render('upload-photo', { title: 'Upload Photo', user: req.user, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send('Failed to load categories.');
  }
});

router.post('/upload-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      setFlashMessage(res, 'error', 'No file uploaded.');
      return res.redirect('/profile');
    }

    const { title, description, category, tags } = req.body;

    const newPhoto = new Photo({
      title,
      description,
      category, // Ensure category ID is passed
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imagePath: req.file.filename,
      uploader: req.user._id,
    });

    await newPhoto.save();
    setFlashMessage(res, 'success', 'Photo uploaded successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading photo:', err.message);
    setFlashMessage(res, 'error', 'Failed to upload photo.');
    res.redirect('/profile');
  }
});

// Edit photo route
router.get('/edit-photo/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    const categories = await Category.find(); // Fetch all categories
    if (!photo || photo.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).send('Unauthorized access.');
    }

    res.render('edit-photo', { title: 'Edit Photo', photo, categories, user: req.user });
  } catch (err) {
    console.error('Error fetching photo or categories:', err.message);
    res.status(500).send('Failed to load edit page.');
  }
});

router.patch('/photo/:id', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    const photoId = req.params.id;
    const { title, description, category } = req.body;
    const photo = await Photo.findById(photoId);

    if (!photo || photo.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).send('Unauthorized access.');
    }

    // Update fields
    photo.title = title || photo.title;
    photo.description = description || photo.description;
    photo.category = category || photo.category;

    if (req.file) {
      // Delete the old GridFS file
      if (photo.imagePath) {
        await gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath));
      }
      photo.imagePath = req.file.filename; // Set new file
    }

    await photo.save();
    setFlashMessage(res, 'success', 'Photo updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating photo:', err.message);
    setFlashMessage(res, 'error', 'Failed to update photo.');
    res.redirect('/profile');
  }
});

// Render upload page
router.get('/upload', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch categories dynamically
    res.render('upload', { title: 'Upload Photo', user: req.user, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).send('Failed to load upload page.');
  }
});

module.exports = router;
