const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true, min: 0 },
    acceptedQuantity: { type: Number, required: true, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const goodsReceiptSchema = new mongoose.Schema(
  {
    grnNumber: { type: String, required: true, unique: true }, // e.g. GRN-0001
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    items: { type: [grnItemSchema], required: true },
    warehouse: { type: String, default: "Warehouse A" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receivedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoodsReceipt", goodsReceiptSchema);
