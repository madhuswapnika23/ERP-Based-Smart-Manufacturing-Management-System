const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // ignore
}

const seedDemoData = async () => {
  try {
    const User = require("../models/User");
    const adminExists = await User.findOne({ email: "admin@test.com" });
    if (!adminExists) {
      console.log("Seeding default admin user...");
      await User.create({
        name: "Admin User",
        email: "admin@test.com",
        password: "test123",
        role: "admin",
        department: "Management"
      });
      console.log("Admin user created (email: admin@test.com, password: test123)");
    }
  } catch (err) {
    console.warn("Seed warning:", err.message);
  }
};

let isConnected = false;

const connectDB = async () => {
  // Reuse existing connection (important for Vercel serverless cold starts)
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Reusing existing MongoDB connection.");
    return;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI environment variable is not set! Check your Vercel/Render environment variables.");
    throw new Error("MONGO_URI is not defined");
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,  // increased for Vercel cold starts
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      dbName: "erp_db",
      // These prevent Mongoose from buffering queries when disconnected
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);

    // Handle disconnection (auto-reconnect on next request)
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Will reconnect on next request.");
      isConnected = false;
    });

    await seedDemoData();
  } catch (err) {
    isConnected = false;
    console.error(`MongoDB Atlas connection failed: ${err.message}`);
    console.warn(
      "⚠️  WARNING: Falling back to In-Memory MongoDB. ALL DATA IS TEMPORARY and will be LOST on server restart."
    );
    console.warn(
      "⚠️  FIX: Set the MONGO_URI environment variable in your Vercel/Render dashboard."
    );

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      const conn = await mongoose.connect(fallbackUri, {
        dbName: "erp_db",
        bufferCommands: false,
      });
      isConnected = true;
      console.log(`Fallback In-Memory MongoDB connected: ${conn.connection.host}`);
      await seedDemoData();
    } catch (fallbackErr) {
      console.error("Failed to start Fallback MongoDB:", fallbackErr.message);
    }
  }
};

module.exports = connectDB;
