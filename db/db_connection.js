import mongoose from "mongoose";

const uri = "mongodb+srv://utsosarkar1_db_user:UDG5e2BZrrPDFjLS@surakshacluster.qgq9rrg.mongodb.net/?retryWrites=true&w=majority&appName=surakshacluster";

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000
};

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB with Mongoose...");
    await mongoose.connect(uri, options);
    console.log("Successfully connected to MongoDB with Mongoose!");
    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB with Mongoose:", error);
    throw error;
  }
};

export default mongoose;
export { connectDB };
