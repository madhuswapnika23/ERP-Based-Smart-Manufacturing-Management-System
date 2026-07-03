const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    materialId: { type: String, required: true, unique: true }, // e.g. MAT-0001
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["raw", "semi-finished", "finished"], default: "raw" },
    category: { type: String, trim: true },
    unit: { type: String, required: true }, // e.g. kg, pcs, litre
    description: { type: String, default: "" },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, default: 0, min: 0 },
    minimumStock: { type: Number, required: true, min: 0 },
    maximumStock: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, required: true, min: 0 },
    warehouse: { type: String, default: "Warehouse A" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
