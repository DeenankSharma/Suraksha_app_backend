// db/connectDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGO_URI;

// Check if URI exists
if (!uri) {
  console.error('MONGO_URI is not defined in environment variables!');
}

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cachedConnection = null;

const connectDB = async () => {
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    console.log("Establishing new MongoDB connection...");
    console.log("URI starts with:", uri.substring(0, 20)); // Log first 20 chars for debugging
    
    const connection = await mongoose.connect(uri, options);
    
    cachedConnection = connection;
    console.log("Successfully connected to MongoDB!");
    
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Error code:", error.code);
    cachedConnection = null;
    throw new Error(`Database connection not available: ${error.message}`);
  }
};

export default connectDB;