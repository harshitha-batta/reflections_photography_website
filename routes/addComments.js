const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware for auth

// POST: Add a new comment
router.post('/comments/:photoId', isAuthenticated, async (req, res) => {
  try {
    console.log('User:', req.user); // Debugging: check the user
    console.log('Comment Text:', req.body.text); // Debugging: check the form data
    const photoId = req.params.photoId;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      console.log('Photo not found');
      req.flash('error', 'Photo not found');
      return res.redirect('back');
    }

    // Add the comment to the photo
    const newComment = {
      text: req.body.text,
      authorName: req.user.name, // Assuming `req.user` has `name`
    };

    photo.comments.push(newComment);
    await photo.save();

    console.log('Comment added successfully!');
    req.flash('success', 'Comment added successfully');
    res.redirect(`/readerPost/${photoId}`);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    req.flash('error', 'An error occurred while adding the comment');
    res.redirect('back');
  }
});

