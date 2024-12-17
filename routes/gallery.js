const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo'); // Your Photo model
const Category = require("../models/Category"); // Category model

// Route to render the gallery page
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().lean(); // Fetch all categories
    const photos = await Photo.find().lean(); // Fetch all photos
    const heroPhotos = await Photo.find().limit(5).lean(); // Fetch 5 hero photos for the slider

    res.render("gallery", {
      title: "Gallery",
      heroPhotos, // Pass hero photos for the hero slider
      photos,
      categories, // Pass categories for the dropdown
    });
  } catch (err) {
    console.error("Error fetching gallery data:", err.message);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load the gallery at this time. Please try again later.",
    });
  }
});

// Route to display photos by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Fetch all categories for the dropdown
    const categories = await Category.find().lean();

    // Fetch photos for the selected category and populate the category field
    const photos = await Photo.find({ category: categoryId })
      .populate("category")
      .lean();

    // Fetch hero photos (can still be general or filtered)
    const heroPhotos = await Photo.find().limit(5).lean();

    res.render("gallery", {
      title: `Gallery - ${categories.find(cat => cat._id.toString() === categoryId)?.name || 'Category'}`,
      heroPhotos,
      photos,
      categories, // Pass categories for dropdown
    });
  } catch (err) {
    console.error("Error fetching category photos:", err.message);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load photos for this category. Please try again later.",
    });
  }
});

module.exports = router;
