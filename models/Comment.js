const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true }, // Reference to the photo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
