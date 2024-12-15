const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated, isAdmin } = require('../middlewares/roles');

const router = express.Router();

let gridfsBucket;

// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos',
  });
});

// Remove a photo by ID or filename
router.delete('/photo/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Remove photo document
    const photo = await Photo.findByIdAndDelete(id);
    if (!photo) {
      setFlashMessage(res, 'error', 'Photo not found.');
      return res.redirect('/admin/dashboard');
    }

    // Remove file from GridFS
    try {
      await gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath));
      console.log('Photo successfully deleted from GridFS.');
    } catch (err) {
      console.warn('GridFS deletion error:', err.message);
      setFlashMessage(res, 'error', 'Photo removed, but file deletion failed.');
      return res.redirect('/admin/dashboard');
    }

    setFlashMessage(res, 'success', 'Photo removed successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error while removing photo:', err.message, err.stack);
    setFlashMessage(res, 'error', 'Failed to remove photo due to a server error.');
    res.redirect('/admin/dashboard');
  }
});



// Remove a user by ID
router.delete('/user/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Remove user from MongoDB
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optionally: Remove photos uploaded by the user
    const userPhotos = await Photo.find({ uploader: id });
    const photoDeletionPromises = userPhotos.map((photo) => {
      return gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath));
    });

    await Promise.all(photoDeletionPromises);
    await Photo.deleteMany({ uploader: id });

    res.json({ success: true, message: 'User and associated photos removed successfully' });
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const photos = await Photo.find(); // Fetch all photos

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      users,
      photos,
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
    res.status(500).send('Error fetching admin data');
  }
});

module.exports = router;
