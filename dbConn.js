// dbConn.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/blogDb", {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Connected to the MongoDB database.");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
