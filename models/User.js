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
// Middleware to delete user's photos and comments
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const userId = this.getQuery()._id; // Get the user ID being deleted

    // Delete all photos uploaded by the user
    const Photo = mongoose.model('Photo');
    const Comment = mongoose.model('Comment');

    const photos = await Photo.find({ uploader: userId });
    for (const photo of photos) {
      await photo.deleteOne(); // Trigger the photo delete middleware
    }

    // Delete all comments made by the user
    await Comment.deleteMany({ user: userId });

    next();
  } catch (err) {
    next(err);
  }
});



module.exports = mongoose.model('User', userSchema);
