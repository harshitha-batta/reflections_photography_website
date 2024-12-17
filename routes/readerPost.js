const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const Photo = require("../models/Photo");
const Comment = require('../models/Comment');
const { attachUser, isAuthenticated } = require("../middlewares/roles");
const upload = require("../config/multerGridFs"); // Your GridFS multer setup
const mongoose = require("mongoose");
let gridfsBucket;
const Category = require('../models/Category'); // Add this line
const router = express.Router();
// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "photos",
  });
});
// Route for readerPost (accessible to both guests and logged-in users)
router.get('/readerPost/:id', attachUser, async (req, res) => {
  try {
    const photoId = req.params.id;

    // Validate photoId
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).send('Invalid Photo ID');
    }

    const photo = await Photo.findById(photoId)
      .populate('uploader', 'name profilePhoto')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name profilePhoto' },
      });

    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Filter out invalid comments
    photo.comments = photo.comments.filter((comment) => comment.user);

    res.render('readerPost', {
      title: photo.title,
      photo,
      uploader: photo.uploader,
      comments: photo.comments,
      user: req.user, // Null for guests, valid user for authenticated users
    });
  } catch (err) {
    console.error('Error fetching photo:', err.message);
    res.status(500).send('Server Error');
  }
});


// GET Like Count
// router.post("/like/:id", async (req, res) => {
//   try {
//     const photoId = req.params.id;
//     const userId = req.user._id;

//     const photo = await Photo.findById(photoId);
//     if (!photo) return res.status(404).send("Photo not found");

//     if (!photo.likes.includes(userId)) {
//       photo.likes.push(userId); 
//       await photo.save();
//     }

//     res.redirect(`/readerPost/${photoId}`);
//   } catch (err) {
//     console.error("Error liking photo:", err.message);
//     res.status(500).send("Server Error");
//   }
// });

router.post("/like/:id", attachUser, isAuthenticated, async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user._id;

    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    let liked = false;

    // Check if user already liked the photo
    const likeIndex = photo.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike the photo
      photo.likes.splice(likeIndex, 1);
    } else {
      // Like the photo
      photo.likes.push(userId);
      liked = true;
    }

    await photo.save();

    res.json({ liked, likesCount: photo.likes.length });
  } catch (err) {
    console.error("Error toggling like:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});


// Regex to ensure the ID is a valid MongoDB ObjectId
router.get('/user/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid User ID');
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send('User not found');

    const photos = await Photo.find({ uploader: userId }).populate('category');
    const categories = await Category.find();

    const profilePhotoUrl = user.profilePhoto
      ? `/profile/profile-photo/${encodeURIComponent(user.profilePhoto)}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=250`;

    res.render('profile_other', {
      title: `${user.name}'s Profile`,
      user: { ...user, profilePhoto: profilePhotoUrl },
      photos,
      categories,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err.message);
    res.status(500).send('Server Error');
  }
});



// Add a comment to a photo
router.post('/comments/:photoId', isAuthenticated, async (req, res) => {
  const { text } = req.body;  // The comment text
  const { photoId } = req.params; // The photo being commented on

  try {
    // Find the photo by ID
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Create a new comment
    const newComment = new Comment({
      text,
      user: req.user.id, // Authenticated user's ID
      photo: photoId,    // Reference the photo
    });

    await newComment.save();

    // Add the comment's ID to the photo's comments array
    photo.comments.push(newComment._id);
    await photo.save();

    res.redirect(`/readerPost/${photoId}`); // Redirect back to the post
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Failed to add comment');
  }
});
// Delete a comment
router.delete('/comments/:commentId', isAuthenticated, async (req, res) => {
  const { commentId } = req.params;

  // Validate commentId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).send('Invalid Comment ID');
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).send('Comment not found');
    }

    if (comment.user.toString() !== req.user.id.toString()) {
      return res.status(403).send('You are not authorized to delete this comment');
    }

    await Photo.findByIdAndUpdate(comment.photo, { $pull: { comments: commentId } });
    await comment.deleteOne();

    res.redirect(`/readerPost/${comment.photo}`);
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).send('Failed to delete comment');
  }
});

module.exports = router;

