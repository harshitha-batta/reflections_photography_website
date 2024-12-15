const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { 
      type: String, 
      enum: ['Landscapes', 'Portraits', 'Abstract', 'Other'], 
      required: true 
    }, // Restrict categories to specific values
    imagePath: { type: String, required: true }, // Path to the uploaded image file in GridFS
    uploader: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }, // Reference to the user who uploaded the photo
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }], // References to users who liked the photo
    comments: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Comment' 
    }], // References to comments on the photo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
