const mongoose = require("mongoose");

const productionOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. PRD-0001
    bom: { type: mongoose.Schema.Types.ObjectId, ref: "BOM", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }, // how many finished units to produce
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    workCenter: { type: String, default: "" }, // kept simple as a text field for MVP (Assembly, Painting, etc.)
    status: {
      type: String,
      enum: ["planned", "released", "in_progress", "completed", "cancelled"],
      default: "planned",
    },
    // Filled in by MRP check when order is created/released
    mrpResult: {
      materialsAvailable: { type: Boolean, default: null },
      shortfalls: [
        {
          material: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
          required: Number,
          available: Number,
          shortBy: Number,
        },
      ],
      generatedPR: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequisition", default: null },
    },
    // Filled in on production confirmation
    confirmation: {
      quantityProduced: { type: Number, default: 0 },
      quantityRejected: { type: Number, default: 0 },
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      remarks: { type: String, default: "" },
      confirmedDate: { type: Date, default: null },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);
