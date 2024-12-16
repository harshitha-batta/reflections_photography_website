const mongoose = require("mongoose");
const Photo = require("./models/Photo"); // Adjust as needed
const Category = require("./models/Category"); // Adjust as needed

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`;

async function migratePhotoCategories() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    // Ensure fallback category exists
    const fallbackCategory = await Category.findOneAndUpdate(
      { name: "Uncategorized" },
      { name: "Uncategorized", description: "Default category for uncategorized photos" },
      { upsert: true, new: true }
    );
    console.log(`Fallback category ID: ${fallbackCategory._id}`);

    // Find photos with string or undefined categories
    const photos = await Photo.find({ $or: [{ category: { $type: "string" } }, { category: undefined }] });

    console.log(`Found ${photos.length} photos with invalid categories.`);

    for (const photo of photos) {
      const categoryName = photo.category;

      if (!categoryName || categoryName === "undefined") {
        console.log(`Assigning fallback category to photo ID: ${photo._id}`);
        photo.category = fallbackCategory._id; // Assign fallback category
      } else {
        console.log(`Resolving category for photo ID: ${photo._id}, Category: ${categoryName}`);
        const category = await Category.findOne({ name: categoryName });
        if (category) {
          photo.category = category._id;
        } else {
          console.warn(`No category found for name: "${categoryName}", assigning fallback.`);
          photo.category = fallbackCategory._id;
        }
      }

      await photo.save();
      console.log(`Updated photo ID: ${photo._id}`);
    }

    console.log("Migration completed.");
  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migratePhotoCategories();
