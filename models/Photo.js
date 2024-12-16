const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Title of the photo
    description: { type: String, default: '' }, // Optional description of the photo
    category: { type: String, required: true }, // Category of the photo
    imagePath: { type: String, required: true }, // URL or path to the image
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the uploader (user)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user references who liked the photo
    comments: [
      {
        text: { type: String, required: true }, // Comment text
        authorName: { type: String, required: true }, // Name of the user who made the comment
        createdAt: { type: Date, default: Date.now }, // Timestamp when the comment was created
        updatedAt: { type: Date, default: Date.now }, // Timestamp when the comment was last updated
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields for the Photo document
);

module.exports = mongoose.model('Photo', photoSchema);


// const mongoose = require('mongoose');

// const photoSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, default: '' },
//     category: { 
//       type: String, 
//       enum: ['Landscapes', 'Portraits', 'Abstract', 'Other'], 
//       required: true 
//     }, // Restrict categories to specific values
//     imagePath: { type: String, required: true }, // Path to the uploaded image file in GridFS
//     uploader: { 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'User', 
//       required: true 
//     }, // Reference to the user who uploaded the photo
//     likes: [{ 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'User' 
//     }], // References to users who liked the photo
//     comments: [{ 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'Comment' 
//     }], // References to comments on the photo
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Photo', photoSchema);
