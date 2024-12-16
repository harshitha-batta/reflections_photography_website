require("dotenv").config(); // Load environment variables from .env
const mongoose = require("mongoose");
const Category = require("./models/Category"); // Assuming Category.js is in the same directory

async function main() {
  // MongoDB connection string using environment variables
  const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}/${process.env.DATABASE}?retryWrites=true&w=majority`;

  try {
    // Connect to MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully.");

    // Categories to insert
    const categories = [
      { name: "Trees"},
      { name: "Blur"},
      { name: "Beautiful"},
      { name: "Love"},
      { name: "Daylight"},
      { name: "Wood"},
      { name: "Leaf"},
      { name: "Flower"},
      { name: "Fall"},
      { name: "City"},
      { name: "Beach"},
      { name: "Rain"},
      { name: "Autumn"},
      { name: "Mountains"},
      { name: "Nature"},
      { name: "Desert"},
      { name: "Winter"},
      { name: "Travel"},
      { name: "Summer"},
      { name: "HD Wallpapers"},
      { name: "Forest"},
      { name: "Spring"},
      { name: "Landscape"},
      { name: "Portraits"},
      { name: "Abstract"},
    ];

    // Insert categories into the Category collection
    const result = await Category.insertMany(categories);
    console.log(`${result.length} categories were inserted.`);
  } catch (err) {
    console.error("Error inserting categories:", err.message);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

main().catch(console.error);
