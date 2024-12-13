const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'user', 'admin'], default: 'user' }, // New field

}, { timestamps: true });


// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Validate password
userSchema.methods.validatePassword = async function (password) {
  console.log('Provided Password:', password); // Log the input password
  console.log('Stored Hash:', this.password); // Log the stored hash
  const isMatch = await bcrypt.compare(password, this.password);
  console.log('Password Match:', isMatch); // Log the result
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);
