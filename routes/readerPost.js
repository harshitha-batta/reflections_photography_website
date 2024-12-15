const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated } = require('../middlewares/roles');
const upload = require('../config/multerGridFs'); // Your GridFS multer setup
const router = express.Router();

// Route to display photo details, including uploader and comments
router.get('/readerPost/:id', async (req, res) => {
  try {
    const photoId = req.params.id;

    // Find the photo and populate the uploader and comments
    const photo = await Photo.findById(photoId)
      .populate('uploader', 'name profilePhoto') // Populate the uploader's name
      .exec();

    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Render the readerPost view with the photo details
    res.render('readerPost', {
      title: photo.title,
      photo,
      uploader: photo.uploader, // Pass uploader details
      comments: photo.comments, // Pass comments array from the schema
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

// Route to display user's profile
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user by ID
    const user = await User.findById(userId).lean(); // Use lean() for plain JS objects
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return res.status(404).send('User not found');
    }

    // Fetch user's photos
    const photos = await Photo.find({ uploader: userId });

    // Resolve profilePhoto URL dynamically
    user.profilePhoto = user.profilePhoto
      ? `/profile/profile-photo/${encodeURIComponent(user.profilePhoto)}`
      : '/default-profile.png';

    // Render the profile page
    res.render('profile', {
      title: `${user.name}'s Profile`,
      user,
      photos,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).send('Server Error');
  }
});







module.exports = router;



