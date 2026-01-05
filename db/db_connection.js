// db/connectDB.js (or wherever this file is)
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

const options = {
  serverSelectionTimeoutMS: 5000, // Reduced from 30s
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
};

// Cached connection variable - CRITICAL for serverless
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    console.log("Establishing new MongoDB connection...");
    
    // Connect with mongoose
    const connection = await mongoose.connect(uri, options);
    
    cachedConnection = connection;
    console.log("Successfully connected to MongoDB!");
    
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    cachedConnection = null; // Reset cache on error
    throw error;
  }
};

export default connectDB;
export { mongoose };