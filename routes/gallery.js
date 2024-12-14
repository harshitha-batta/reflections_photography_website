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

module.exports = router;


