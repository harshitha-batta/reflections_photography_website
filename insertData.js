require("dotenv").config(); // Load environment variables from .env
const mongoose = require("mongoose");
const Photo = require("./models/Photo"); // Assuming Photo.js is in the same directory

async function main() {
  // MongoDB connection string using environment variables
  const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`;

  try {
    // Connect to MongoDB
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected successfully.");

    // Data to insert
    const documents = [
      {
        title: "Golden Sunrise",
        description: "A breathtaking view of the sun rising over the mountains.",
        category: "Landscapes",
        imagePath: "https://images.pexels.com/photos/12487420/pexels-photo-12487420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        uploader: "675e22944c082c7aa5648bda", // Replace with a valid User ObjectId
        likes: ["675e22944c082c7aa5648bdb"], // Replace with valid User ObjectIds
        comments: [], // Replace with valid Comment ObjectIds if available
      },
      {
        title: "Serene Lake",
        description: "A peaceful lake surrounded by lush greenery.",
        category: "Landscapes",
        imagePath: "https://images.pexels.com/photos/247600/pexels-photo-247600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        uploader: "675e22944c082c7aa5648bda", // Replace with a valid User ObjectId
        likes: [],
        comments: [],
      },
      {
        title: "City Lights",
        description: "A stunning view of city lights at night.",
        category: "Abstract",
        imagePath: "https://images.pexels.com/photos/1137525/pexels-photo-1137525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        uploader: "675e22944c082c7aa5648bdb", // Replace with a valid User ObjectId
        likes: [],
        comments: [], // Replace with valid Comment ObjectIds if available
      },
    ];

    // Insert documents into the Photo collection
    const result = await Photo.insertMany(documents);
    console.log(`${result.length} documents were inserted.`);
  } catch (err) {
    console.error("Error inserting documents:", err.message);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

main().catch(console.error);
