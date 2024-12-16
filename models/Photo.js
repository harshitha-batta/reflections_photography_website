const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, 
    description: { type: String, default: "" }, 
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true,},
    imagePath: { type: String, required: true }, 
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,}, 
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true } 
);
photoSchema.pre('deleteOne', { document: true }, async function (next) {
  await Comment.deleteMany({ photo: this._id });
  next();
});

module.exports = mongoose.model("Photo", photoSchema);
