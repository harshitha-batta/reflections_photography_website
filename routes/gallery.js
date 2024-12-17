const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo'); 
const Category = require("../models/Category"); 

// Route to render the gallery page
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find(); 
    const photos = await Photo.find(); 

    res.render("gallery", {
      title: "Gallery",
      photos,
      categories,
    });
  } catch (err) {
    console.error("Error fetching photos or categories:", err.message);
    res.status(500).send("Server Error");
  }
});

// Route to display photos by category
router.get("/category/:categoryName", async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    // Fetch the category by name (case-insensitive)
    const category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, "i") });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Find photos associated with the category's ObjectId
    const photos = await Photo.find({ category: category._id }).populate("category", "name");
    const categories = await Category.find(); // Fetch all categories for dropdown

    res.render("gallery", {
      title: `Gallery - ${category.name}`,
      photos,
      categories
    });
  } catch (err) {
    console.error("Error fetching category photos:", err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Photo = require("../models/Photo");
// const Category = require("../models/Category");

// // Route to display photos by category name
// router.get("/category/:categoryName", async (req, res) => {
//   try {
//     const categoryName = req.params.categoryName;

//     // Find the Category document based on its name
//     const category = await Category.findOne({ name: categoryName });

//     if (!category) {
//       return res.status(404).send("Category not found");
//     }

//     // Find all photos with the matched category ObjectId
//     const photos = await Photo.find({ category: category._id }).populate("category", "name");
//     const categories = await Category.find(); // Fetch all categories for the dropdown

//     res.render("gallery", {
//       title: `Gallery - ${category.name}`,
//       photos,
//       categories, // Pass categories for the dropdown
//     });
//   } catch (err) {
//     console.error("Error fetching category photos:", err.message);
//     res.status(500).send("Server Error");
//   }
// });

// module.exports = router;




