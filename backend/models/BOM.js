const mongoose = require("mongoose");

const bomComponentSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    quantityRequired: { type: Number, required: true, min: 1 }, // quantity needed per 1 unit of finished product
  },
  { _id: false }
);

const bomSchema = new mongoose.Schema(
  {
    bomId: { type: String, required: true, unique: true }, // e.g. BOM-0001
    productName: { type: String, required: true, trim: true },
    finishedMaterial: { type: mongoose.Schema.Types.ObjectId, ref: "Material", default: null }, // if the finished product is also tracked as a Material
    components: { type: [bomComponentSchema], required: true },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BOM", bomSchema);
