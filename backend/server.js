require("dotenv").config();
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
// As you build the remaining modules, add their routes here the same way:
// const supplierRoutes = require("./routes/supplierRoutes");
// const inventoryRoutes = require("./routes/inventoryRoutes");
// const purchaseRequisitionRoutes = require("./routes/purchaseRequisitionRoutes");
// const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
// const goodsReceiptRoutes = require("./routes/goodsReceiptRoutes");
// const bomRoutes = require("./routes/bomRoutes");
// const productionOrderRoutes = require("./routes/productionOrderRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ERP backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);

// app.use("/api/suppliers", supplierRoutes);

app.use("/api/suppliers", supplierRoutes);
// app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory", inventoryRoutes);
// app.use("/api/purchase-requisitions", purchaseRequisitionRoutes);
app.use("/api/purchase-requisitions", purchaseRequisitionRoutes);
// app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
// app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
// app.use("/api/boms", bomRoutes);
app.use("/api/boms", bomRoutes);
// app.use("/api/production-orders", productionOrderRoutes);

// Basic error handler (catches thrown errors from async routes not already handled)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
