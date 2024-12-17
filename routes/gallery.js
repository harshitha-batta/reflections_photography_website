const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo'); // Your Photo model
const Category = require("../models/Category"); // Category model

// Route to render the gallery page
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories
    const photos = await Photo.find(); // Fetch all photos

    res.render("gallery", {
      title: "Gallery",
      photos,
      categories, // Pass categories to the template
    });
  } catch (err) {
    console.error("Error fetching photos or categories:", err.message);
    res.status(500).send("Server Error");
  }
});

// Route to display photos by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const categories = await Category.find(); // Fetch all categories for the dropdown
    const photos = await Photo.find({ category: categoryId }).populate(
      "category"
    ); // Fetch photos for the selected category

    res.render("gallery", {
      title: "Gallery - Filtered by Category",
      photos,
      categories, // Pass categories to the template for the dropdown
    });
  } catch (err) {
    console.error("Error fetching category photos:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

module.exports = router;


