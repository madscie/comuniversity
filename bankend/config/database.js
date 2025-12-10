// config/database.js - Complete corrected version
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

// MongoDB Atlas connection string
const getMongoURI = () => {
  const {
    DB_USER = "",
    DB_PASSWORD = "",
    DB_HOST = "cluster0.mongodb.net",
    DB_NAME = "communiversity_library",
    DB_OPTIONS = "retryWrites=true&w=majority"
  } = process.env;

  // Check if using connection string directly (recommended for Atlas)
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Build connection string from components
  const auth = DB_USER && DB_PASSWORD ? `${DB_USER}:${DB_PASSWORD}@` : "";
  return `mongodb+srv://${auth}${DB_HOST}/${DB_NAME}?${DB_OPTIONS}`;
};

// MongoDB client instance (for direct MongoDB driver access)
let client;
let clientPromise;

// Mongoose connection (for ODM)
let mongooseConnection;

// Create MongoDB client promise
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the connection is preserved
  if (!global._mongoClientPromise) {
    const uri = getMongoURI();
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client each time
  const uri = getMongoURI();
  client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  clientPromise = client.connect();
}

// MongoDB driver connection test
export const testConnection = async () => {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    console.log("✅ MongoDB Atlas connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error.message);
    return false;
  }
};

// Mongoose connection setup
export const connectMongoose = async () => {
  try {
    if (mongooseConnection) {
      return mongooseConnection;
    }

    const uri = getMongoURI();
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongooseConnection = mongoose.connection;
    
    mongooseConnection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongooseConnection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from MongoDB");
    });

    console.log("✅ Mongoose connected to MongoDB Atlas");
    return mongooseConnection;
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error.message);
    throw error;
  }
};

// Get database instance
export const getDatabase = async (dbName = process.env.DB_NAME || "communiversity_library") => {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("❌ Failed to get database:", error.message);
    throw error;
  }
};

// Get collection helper
export const getCollection = async (collectionName, dbName = process.env.DB_NAME || "communiversity_library") => {
  try {
    const db = await getDatabase(dbName);
    return db.collection(collectionName);
  } catch (error) {
    console.error(`❌ Failed to get collection ${collectionName}:`, error.message);
    throw error;
  }
};

// Close connections
export const closeConnections = async () => {
  try {
    if (client) {
      await client.close();
      console.log("✅ MongoDB client connections closed");
    }
    
    if (mongooseConnection) {
      await mongoose.disconnect();
      console.log("✅ Mongoose connections closed");
    }
  } catch (error) {
    console.error("❌ Error closing connections:", error.message);
  }
};

// For backward compatibility
export const connectDB = async () => {
  console.log('🔌 Connecting to MongoDB...');
  
  // Connect using Mongoose
  await connectMongoose();
  
  // Get and return the database instance
  const db = await getDatabase();
  console.log('✅ Database connection established');
  return db;
};

// Export the client promise (main export to replace mysql pool)
export default clientPromise;