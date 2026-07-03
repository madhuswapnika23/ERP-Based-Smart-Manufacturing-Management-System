const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true }, // e.g. SUP-0001
    name: { type: String, required: true, trim: true },
    gstNumber: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "India" },
    paymentTerms: { type: String, default: "Net 30" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
