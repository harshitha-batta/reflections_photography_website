const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const Comment = require("../models/Comment");
// const Comment = require("../models/User");
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware for auth

// POST: Add a comment to a photo
router.post("/comments/:photoId", isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;
    const photoId = req.params.photoId;

    // Create a new comment document
    const newComment = await Comment.create({
      text,
      user: req.user.id, // Use the authenticated user's ID
      photo: photoId,
    });

    // Push the new comment's ID to the photo's comments array
    await Photo.findByIdAndUpdate(photoId, { $push: { comments: newComment._id } });

    req.flash("success", "Comment added successfully");
    res.redirect(`/readerPost/${photoId}`); // Redirect back to the photo page
  } catch (err) {
    console.error("Error adding comment:", err.message);
    req.flash("error", "Failed to add comment");
    res.redirect("back");
  }
});

module.exports = router;