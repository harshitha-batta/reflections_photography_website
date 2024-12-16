const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const isAuthenticated = require('../middleware/isAuthenticated'); // Middleware for auth

// POST: Add a new comment
router.post('/comments/:photoId', isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    const photoId = req.params.photoId;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      req.flash('error', 'Photo not found');
      return res.redirect('back');
    }

    // Add the comment to the photo
    const newComment = {
      text,
      authorName: req.user.name, // Assuming user info is stored in req.user
    };
    photo.comments.push(newComment);
    await photo.save();

    req.flash('success', 'Comment added successfully');
    res.redirect(`/readerPost/${photoId}`); // Redirect back to the photo page
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'An error occurred while adding the comment');
    res.redirect('back');
  }
});

module.exports = router;
