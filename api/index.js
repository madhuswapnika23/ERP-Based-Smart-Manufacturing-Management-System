const connectDB = require("../backend/config/db");
const app = require("../backend/server");

// Vercel serverless: ensure DB connected before handling any request
let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
  return app(req, res);
};
