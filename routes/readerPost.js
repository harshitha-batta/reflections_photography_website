const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs'); // Your GridFS multer setup
const router = express.Router();

router.get('/readerPost/:id', async (req, res) => {
  try {
    const photoId = req.params.id;

    // Find the photo and populate the uploader (user) details
    const photo = await Photo.findById(photoId).populate('uploader');
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Render the page with the photo and user details
    res.render('readerPost', {
      title: photo.title,
      photo,
      uploader: photo.uploader, // Pass the user (uploader) object
    });
  } catch (err) {
    console.error('Error fetching photo:', err.message);
    res.status(500).send('Server Error');
  }
});


// GET Like Count
router.post('/like/:id', async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user._id; // Replace with the authenticated user's ID

    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).send('Photo not found');

    if (!photo.likes.includes(userId)) {
      photo.likes.push(userId); // Add user to likes array
      await photo.save();
    }

    res.redirect(`/readerPost/${photoId}`);
  } catch (err) {
    console.error('Error liking photo:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;