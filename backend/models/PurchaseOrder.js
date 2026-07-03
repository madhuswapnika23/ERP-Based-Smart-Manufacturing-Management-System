const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // price per unit at time of order
    receivedQuantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true }, // e.g. PO-0001
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    sourceRequisition: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequisition", default: null },
    items: { type: [poItemSchema], required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    gstPercent: { type: Number, default: 18 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["draft", "ordered", "partially_received", "received", "cancelled"], default: "ordered" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
