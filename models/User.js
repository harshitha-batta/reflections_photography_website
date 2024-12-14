const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' },
    bio: { type: String, default: '' }, // User bio
    profilePhoto: { type: String, default: '' }, // Path to profile photo
    uploadedPhotos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }], // References to uploaded photos
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
