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

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      dbName: "erp_db"
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (err) {
    console.error(`MongoDB Atlas connection failed: ${err.message}`);
    console.log("Starting Fallback In-Memory MongoDB Server...");

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      const conn = await mongoose.connect(fallbackUri, { dbName: "erp_db" });
      console.log(`Fallback In-Memory MongoDB connected: ${conn.connection.host}`);
      await seedDemoData();
    } catch (fallbackErr) {
      console.error("Failed to start Fallback MongoDB:", fallbackErr.message);
    }
  }
};

module.exports = connectDB;


