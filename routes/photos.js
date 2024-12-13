const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const { isAuthenticated } = require('../middlewares/roles');

// Upload a photo (admin only)
router.post('/upload', isAuthenticated, async (req, res) => {
  try {
    const { title, description, category, imagePath } = req.body;

    const photo = new Photo({
      title,
      description,
      category,
      imagePath,
      uploader: req.user._id,
    });

    await photo.save();
    req.flash('success', 'Photo uploaded successfully!');
    res.redirect('/gallery');
  } catch (err) {
    console.error('Error uploading photo:', err.message);
    req.flash('error', 'An error occurred while uploading the photo.');
    res.redirect('/gallery');
  }
});

// Like a photo
router.post('/:photoId/like', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      req.flash('error', 'Photo not found.');
      return res.redirect('/gallery');
    }

    if (!photo.likes.includes(req.user._id)) {
      photo.likes.push(req.user._id);
      await photo.save();
    }

    req.flash('success', 'Photo liked!');
    res.redirect(`/photos/${photo._id}`);
  } catch (err) {
    console.error('Error liking photo:', err.message);
    req.flash('error', 'An error occurred while liking the photo.');
    res.redirect('/gallery');
  }
});

// Comment on a photo
router.post('/:photoId/comment', isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;

    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      req.flash('error', 'Photo not found.');
      return res.redirect('/gallery');
    }

    const comment = new Comment({
      text,
      author: req.user._id,
      photo: photo._id,
    });

    await comment.save();
    photo.comments.push(comment._id);
    await photo.save();

    req.flash('success', 'Comment added!');
    res.redirect(`/photos/${photo._id}`);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    req.flash('error', 'An error occurred while adding the comment.');
    res.redirect('/gallery');
  }
});

module.exports = router;
