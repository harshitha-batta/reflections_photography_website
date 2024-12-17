const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Photo = require('../models/Photo');
const { isAuthenticated, isAdmin } = require('../middlewares/roles');
const { setFlashMessage } = require('../utils/flash');
const Comment = require('../models/Comment'); // Add this line

const router = express.Router();

let gridfsBucket;

// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'photos',
  });
});
// Remove a comment by ID
router.delete('/comment/:id', isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      setFlashMessage(res, 'error', 'Invalid comment ID.');
      return res.redirect('/admin/dashboard');
    }

    // Find the comment
    const comment = await Comment.findById(id);
    if (!comment) {
      setFlashMessage(res, 'error', 'Comment not found.');
      return res.redirect('/admin/dashboard');
    }

    // Remove the comment from the associated photo
    await Photo.findByIdAndUpdate(comment.photo, {
      $pull: { comments: id },
    });

    // Delete the comment
    await comment.deleteOne();

    setFlashMessage(res, 'success', 'Comment removed successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error while deleting comment:', err.message);
    setFlashMessage(res, 'error', 'Failed to remove comment.');
    res.redirect('/admin/dashboard');
  }
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

    // Remove user from the database
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      setFlashMessage(res, 'error', 'User not found.');
      return res.redirect('/admin/dashboard');
    }

    // Optionally, remove user's photos (if applicable)
    try {
      const userPhotos = await Photo.find({ uploader: id });
      const photoDeletionPromises = userPhotos.map((photo) =>
        gridfsBucket.delete(new mongoose.Types.ObjectId(photo.imagePath))
      );

      await Promise.all(photoDeletionPromises);
      await Photo.deleteMany({ uploader: id });
      console.log('All associated photos deleted for user:', id);
    } catch (err) {
      console.warn('Failed to delete associated photos for user:', id, err.message);
      setFlashMessage(res, 'error', 'User removed, but failed to delete their photos.');
      return res.redirect('/admin/dashboard');
    }

    setFlashMessage(res, 'success', 'User removed successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error while removing user:', err.message, err.stack);
    setFlashMessage(res, 'error', 'Failed to remove user due to a server error.');
    res.redirect('/admin/dashboard');
  }
});

router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const photos = await Photo.find(); // Fetch all photos
    const comments = await Comment.find()
      .populate('user', 'name email') // Fetch user details
      .populate('photo', 'title')     // Fetch associated photo details
      .lean();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      users,
      photos,
      comments, // Pass comments to the view
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
    res.status(500).send('Error fetching admin data');
  }
});


module.exports = router;
