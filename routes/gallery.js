const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo'); // Your Photo model

// Route to render the gallery page
router.get('/', async (req, res) => {
    try {
        const photos = await Photo.find(); // Fetch all photos from the database
        console.log('Fetched photos:', photos); // Debugging log
        res.render('gallery', { title: 'Gallery', photos }); // Pass photos to the EJS template
    } catch (err) {
        console.error('Error fetching photos:', err.message);
        res.status(500).send('Server Error');
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


