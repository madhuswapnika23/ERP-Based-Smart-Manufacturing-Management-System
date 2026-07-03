const Inventory = require("../models/Inventory");
const Material = require("../models/Material");

// GET /api/inventory  (supports ?warehouse=)
const getInventory = async (req, res) => {
  try {
    const { warehouse } = req.query;
    const filter = {};
    if (warehouse) filter.warehouse = warehouse;

    const inventory = await Inventory.find(filter)
      .populate("material", "materialId name unit minimumStock maximumStock reorderLevel")
      .sort({ updatedAt: -1 });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/inventory/:materialId  (materialId = Material's MongoDB _id)
const getInventoryByMaterial = async (req, res) => {
  try {
    const record = await Inventory.findOne({ material: req.params.materialId }).populate(
      "material",
      "materialId name unit minimumStock maximumStock reorderLevel"
    );
    if (!record) return res.status(404).json({ message: "Inventory record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/inventory/:materialId/adjust
// Body: { type: "in" | "out" | "adjustment", quantity: Number, reason: String }
const adjustStock = async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;
    if (!["in", "out", "adjustment"].includes(type)) {
      return res.status(400).json({ message: "type must be 'in', 'out', or 'adjustment'" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "quantity must be a positive number" });
    }

    const record = await Inventory.findOne({ material: req.params.materialId });
    if (!record) return res.status(404).json({ message: "Inventory record not found" });

    if (type === "in") {
      record.currentStock += quantity;
    } else if (type === "out") {
      if (record.currentStock - record.reservedStock < quantity) {
        return res.status(400).json({ message: "Not enough available stock for this deduction" });
      }
      record.currentStock -= quantity;
    } else {
      // adjustment: set stock to an exact value (used for stock-take corrections)
      record.currentStock = quantity;
    }

    record.lastMovement = { type, quantity, reason: reason || "", date: new Date() };
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/inventory/low-stock
const getLowStock = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate(
      "material",
      "materialId name unit minimumStock reorderLevel"
    );
    const lowStock = inventory.filter(
      (record) => record.material && record.currentStock <= record.material.reorderLevel
    );
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInventory, getInventoryByMaterial, adjustStock, getLowStock };