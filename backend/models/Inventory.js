const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true, unique: true },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 }, // reserved for production orders
    warehouse: { type: String, default: "Warehouse A" },
    lastMovement: {
      type: { type: String, enum: ["in", "out", "adjustment"], default: "in" },
      quantity: Number,
      reason: String,
      date: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Virtual: available stock = current - reserved
inventorySchema.virtual("availableStock").get(function () {
  return this.currentStock - this.reservedStock;
});
inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);
