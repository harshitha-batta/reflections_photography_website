const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Title of the photo
    description: { type: String, default: "" }, // Optional description of the photo
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    imagePath: { type: String, required: true }, // URL or path to the image
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the uploader (user)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user references who liked the photo
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    // comments: [
    //   {
    //     text: { type: String, required: true }, // Comment text
    //     authorName: { type: String, required: true }, // Name of the user who made the comment
    //     createdAt: { type: Date, default: Date.now }, // Timestamp when the comment was created
    //     updatedAt: { type: Date, default: Date.now }, // Timestamp when the comment was last updated
    //   },
    // ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields for the Photo document
);

module.exports = mongoose.model("Photo", photoSchema);

