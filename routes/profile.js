const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const PasswordReset = require('../models/PasswordReset');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs');
const mongoose = require('mongoose');
const Category = require('../models/Category')
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
// Fetch profile, photos, and categories
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const photos = await Photo.find({ uploader: req.user._id }).populate('category');
    const categories = await Category.find({}); // Fetch all categories

    res.render('profile', {
      title: 'Your Profile',
      user: req.user,
      photos,
      categories, // Pass categories to the template
    });
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
  const photoId = req.params.id;
  console.log(`DELETE request received for photo ID: ${photoId}`);// Debug log

  try {
    const photo = await Photo.findById(photoId);

    if (!photo) {
      console.error('Photo not found');
      return res.status(404).send('Photo not found');
    }

    if (photo.uploader.toString() !== req.user._id.toString()) {
      console.error('Unauthorized delete attempt');
      return res.status(403).send('You are not authorized to delete this photo.');
    }

    // Delete the photo document
    console.log('Deleting photo document:', photoId);
    await Photo.findByIdAndDelete(photoId); // Use findByIdAndDelete instead of remove

    // Delete the associated GridFS file
    if (gridfsBucket) {
      try {
        console.log('Deleting file from GridFS:', photo.imagePath);
        await gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath));
        console.log('GridFS file deleted:', photo.imagePath);
      } catch (err) {
        console.error('Error deleting GridFS file:', err);
      }
    }

    setFlashMessage(res, 'success', 'Photo deleted successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error in DELETE route:', err.message);
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
    const { filename } = req.params;

    // Check if the filename is a URL (external photo)
    if (filename.startsWith('http')) {
      console.log('Serving external profile photo:', filename);
      return res.redirect(filename); // Redirect to the external URL
    }

    // Fetch photo from GridFS
    const file = await gridfsBucket.find({ filename }).toArray();
    console.log('Requested profile photo:', filename, 'File found:', file);

    if (!file || file.length === 0) {
      return res.status(404).send('Profile photo not found');
    }

    const readStream = gridfsBucket.openDownloadStreamByName(filename);
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
    const { filename } = req.params;
        // Check if the filename is a URL (external photo)
    if (filename.startsWith('http')) {
      console.log('Serving external profile photo:', filename);
      return res.redirect(filename); // Redirect to the external URL
    }
    const file = await gridfsBucket.find({ filename }).toArray();
    console.log('Requested photo:', filename, 'File found:', file);

    if (!file || file.length === 0) {
      return res.status(404).send('Photo not found');
    }

    const readStream = gridfsBucket.openDownloadStreamByName(filename);
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
    console.log('File uploaded:', req.file); // Debugging uploaded file
    console.log('Form Data:', req.body);     // Debugging form inputs

    if (!req.file) {
      console.error('No file uploaded.');
      setFlashMessage(res, 'error', 'No file uploaded.');
      return res.redirect('/profile');
    }

    const { title, description, category, tags } = req.body;

    // Check if category exists
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      console.error('Category not found:', category);
      setFlashMessage(res, 'error', 'Invalid category selected.');
      return res.redirect('/profile');
    }

    console.log('Resolved Category:', categoryDoc);

    // Save the new photo to the database
    const newPhoto = new Photo({
      title,
      description,
      category: categoryDoc._id,
      imagePath: req.file.filename, // GridFS file reference
      uploader: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    const savedPhoto = await newPhoto.save();
    console.log('Photo Saved:', savedPhoto);

    // Update user with the new photo
    await User.findByIdAndUpdate(req.user._id, {
      $push: { uploadedPhotos: savedPhoto._id },
    });

    setFlashMessage(res, 'success', 'Photo uploaded successfully!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Error during photo upload:', err);
    setFlashMessage(res, 'error', 'Failed to upload photo.');
    res.redirect('/profile');
  }
});



router.patch('/photo/:id', isAuthenticated, upload.single('photo'), async (req, res) => {
  console.log('PATCH route triggered for photo ID:', req.params.id);

  try {
    const photoId = req.params.id;
    const { title, description, category } = req.body;

    const photo = await Photo.findById(photoId);

    if (!photo || photo.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).send('You are not authorized to edit this photo.');
    }

    // Resolve and update category
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(400).send('Invalid category selected.');
      }
      photo.category = categoryDoc._id;
    }

    // Update fields
    photo.title = title || photo.title;
    photo.description = description || photo.description;

    // Handle new photo upload
    if (req.file) {
      photo.imagePath = req.file.filename;
    }

    await photo.save();
    console.log('Photo successfully updated:', photo);
    res.redirect('/profile'); // Redirect back to the profile page
  } catch (err) {
    console.error('Error updating photo:', err.message);
    res.status(500).send('Failed to update photo.');
  }
});



// Render upload page with categories
router.get('/upload', isAuthenticated, async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find({});
    res.render('upload', {
      title: 'Upload Photo',
      user: req.user,
      categories, // Pass categories to the template
    });
  } catch (err) {
    console.error('Error fetching categories for upload page:', err.message);
    res.status(500).send('Failed to load upload page.');
  }
});


module.exports = router;

