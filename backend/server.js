const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const materialRoutes = require("./routes/materialRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const purchaseRequisitionRoutes = require("./routes/purchaseRequisitionRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const goodsReceiptRoutes = require("./routes/goodsReceiptRoutes");
const bomRoutes = require("./routes/bomRoutes");
const productionOrderRoutes = require("./routes/productionOrderRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ERP Smart Manufacturing Backend is running", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-requisitions", purchaseRequisitionRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/boms", bomRoutes);
app.use("/api/production-orders", productionOrderRoutes);

// Serve frontend dist bundle in deployment
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("ERP Smart Manufacturing Management System API Server active. Build frontend or run dev server.");
    }
  });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
