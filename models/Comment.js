const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who posted the comment
    photo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true }, // Reference to the related photo
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
