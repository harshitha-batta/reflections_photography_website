const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name
  description: { type: String, default: "" }, // Optional description of the category
});

module.exports = mongoose.model("Category", categorySchema);
