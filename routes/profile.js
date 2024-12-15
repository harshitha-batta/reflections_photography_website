const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
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
    const photos = await Photo.find({ uploader: req.user._id }); // Fetch photos by the user
    console.log('Fetched Photos:', photos); // Debug logs
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
// Delete a photo
router.delete('/photo/:id', isAuthenticated, async (req, res) => {
  console.log(`DELETE request received for photo ID: ${req.params.id}`);
  try {
    const photoId = req.params.id;
    const photo = await Photo.findById(photoId);

    if (!photo) {
      console.error('Photo not found');
      return res.status(404).send('Photo not found');
    }

    if (photo.uploader.toString() !== req.user._id.toString()) {
      console.error('Unauthorized delete attempt');
      return res.status(403).send('You are not authorized to delete this photo.');
    }

    // Delete photo document
    await photo.remove();
    console.log('Photo document deleted:', photoId);

    // Delete GridFS file
    if (gridfsBucket) {
      try {
        await gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath));
        console.log('GridFS file deleted:', photo.imagePath);
      } catch (err) {
        console.error('Error deleting GridFS file:', err);
      }
    }

    setFlashMessage(res, 'success', 'Photo deleted successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error in DELETE route:', err);
    setFlashMessage(res, 'error', 'Failed to delete photo.');
    res.redirect('/profile');
  }
});

// Upload profile photo
router.post('/upload-profile-photo', isAuthenticated, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      setFlashMessage(res, 'error', 'No file uploaded.');
      return res.redirect('/profile');
    }

    const profilePhotoFilename = req.file.filename;
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: profilePhotoFilename });
    setFlashMessage(res, 'success', 'Profile photo updated successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    setFlashMessage(res, 'error', 'Failed to upload profile photo.');
    res.redirect('/profile');
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

// Upload photo with metadata
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
      category,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      imagePath: req.file.filename,
      uploader: req.user._id,
    });

    await newPhoto.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedPhotos: newPhoto._id },
    });

    setFlashMessage(res, 'success', 'Photo uploaded successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error uploading photo:', err);
    setFlashMessage(res, 'error', 'Failed to upload photo.');
    res.redirect('/profile');
  }
});


// Edit a photo
router.patch('/photo/:id', isAuthenticated, async (req, res) => {
  console.log('PATCH request received');
  console.log('Photo ID:', req.params.id);
  console.log('Request Body:', req.body);

  try {
    const photoId = req.params.id;
    const { title, description, category } = req.body;

    const photo = await Photo.findById(photoId);

    if (!photo || photo.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).send('You are not authorized to edit this photo.');
    }

    if (title) photo.title = title;
    if (description) photo.description = description;
    if (category) photo.category = category;
    await photo.save();

    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating photo:', err.message);
    res.status(500).send('Failed to update photo.');
  }
});



// Render upload page
router.get('/upload', isAuthenticated, (req, res) => {
  res.render('upload', {
    title: 'Upload Photo',
    user: req.user,
  });
});

module.exports = router;
