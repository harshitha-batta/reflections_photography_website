const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Landscapes', 'Portraits', 'Abstract', 'Other'], required: true },
    tags: [{ type: String }],
    imagePath: { type: String, required: true }, // GridFS filename
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
