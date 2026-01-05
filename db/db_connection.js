// db/db_connection.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI environment variable is not defined!');
}

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

// Cached connection for serverless
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  // If connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log("MongoDB connection in progress, waiting...");
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
    return mongoose.connection;
  }

  if (!uri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    console.log("Establishing new MongoDB connection...");
    
    const connection = await mongoose.connect(uri, options);
    
    cachedConnection = connection;
    console.log("Successfully connected to MongoDB!");
    
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    cachedConnection = null;
    throw error;
  }
};

export default connectDB;
export { mongoose };