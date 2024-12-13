const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true }, // Path to the uploaded photo
  caption: { type: String }, // Optional photo caption
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who uploaded the photo
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', photoSchema);
