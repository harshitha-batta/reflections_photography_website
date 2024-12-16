const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const Photo = require("../models/Photo");
const Comment = require('../models/Comment');
const { isAuthenticated } = require("../middlewares/roles");
const upload = require("../config/multerGridFs"); // Your GridFS multer setup
const mongoose = require("mongoose");
let gridfsBucket;
const router = express.Router();
// Initialize GridFSBucket after MongoDB connection
mongoose.connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "photos",
  });
});
// Route to display photo details, including uploader and comments
router.get("/readerPost/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    // Find the photo and populate the uploader and comments
    const photo = await Photo.findById(photoId)
      .populate("uploader", "name profilePhoto") // Populate the uploader's name
      .exec();

    if (!photo) {
      return res.status(404).send("Photo not found");
    }

    // Render the readerPost view with the photo details
    res.render("readerPost", {
      title: photo.title,
      photo,
      uploader: photo.uploader, // Pass uploader details
      comments: photo.comments, // Pass comments array from the schema
    });
  } catch (err) {
    console.error("Error fetching photo:", err.message);
    res.status(500).send("Server Error");
  }
});

// GET Like Count
router.post("/like/:id", async (req, res) => {
  try {
    const photoId = req.params.id;
    const userId = req.user._id; // Replace with the authenticated user's ID

    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).send("Photo not found");

    if (!photo.likes.includes(userId)) {
      photo.likes.push(userId); // Add user to likes array
      await photo.save();
    }

    res.redirect(`/readerPost/${photoId}`);
  } catch (err) {
    console.error("Error liking photo:", err.message);
    res.status(500).send("Server Error");
  }
});

// Regex to ensure the ID is a valid MongoDB ObjectId
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid User ID: ${userId}`);
      return res.status(400).send("Invalid User ID");
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return res.status(404).send("User not found");
    }

    const photos = await Photo.find({ uploader: userId });
    console.log(
      "Photos for user:",
      photos.map((photo) => photo.imagePath)
    ); // Debug log

    const profilePhotoUrl = user.profilePhoto
      ? user.profilePhoto.startsWith("http")
        ? user.profilePhoto
        : `/profile/profile-photo/${encodeURIComponent(user.profilePhoto)}`
      : "/default-profile.png";

    res.render("profile", {
      title: `${user.name}'s Profile`,
      user: { ...user, profilePhoto: profilePhotoUrl },
      photos,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).send("Server Error");
  }
});


// POST route to add a comment
router.post('/comments/:photoId', isAuthenticated, async (req, res) => {
  const { text } = req.body; 
  const { photoId } = req.params; 

  try {
    const newComment = new Comment({
      text,
      user: req.user.id, 
      photo: photoId, 
    });

    await newComment.save();

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }
    photo.comments.push(newComment._id);
    await photo.save();

    res.redirect(`/readerPost/${photoId}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Something went wrong while adding the comment');
  }
});

module.exports = router;

