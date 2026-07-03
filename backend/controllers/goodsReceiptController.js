const GoodsReceipt = require("../models/GoodsReceipt");
const PurchaseOrder = require("../models/PurchaseOrder");
const Inventory = require("../models/Inventory");

const getNextGRNNumber = async () => {
  const count = await GoodsReceipt.countDocuments();
  return `GRN-${String(count + 1).padStart(4, "0")}`;
};

// POST /api/goods-receipts
// Body: { purchaseOrder, warehouse, items: [{ material, receivedQuantity, acceptedQuantity, rejectedQuantity }] }
const createGoodsReceipt = async (req, res) => {
  try {
    const { purchaseOrder, warehouse, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    const po = await PurchaseOrder.findById(purchaseOrder);
    if (!po) return res.status(400).json({ message: "Purchase Order not found" });
    if (po.status === "cancelled") {
      return res.status(400).json({ message: "Cannot receive goods against a cancelled PO" });
    }
    if (po.status === "received") {
      return res.status(400).json({ message: "This Purchase Order has already been fully received" });
    }

    // Build GRN items with orderedQuantity looked up from the PO, and validate
    const grnItems = [];
    for (const incoming of items) {
      const poItem = po.items.find((i) => i.material.toString() === incoming.material);
      if (!poItem) {
        return res.status(400).json({ message: `Material ${incoming.material} is not on this Purchase Order` });
      }
      const accepted = incoming.acceptedQuantity ?? incoming.receivedQuantity;
      const rejected = incoming.rejectedQuantity ?? 0;
      if (accepted + rejected !== incoming.receivedQuantity) {
        return res.status(400).json({
          message: `For material ${incoming.material}, acceptedQuantity + rejectedQuantity must equal receivedQuantity`,
        });
      }

      grnItems.push({
        material: incoming.material,
        orderedQuantity: poItem.quantity,
        receivedQuantity: incoming.receivedQuantity,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
      });
    }

    // Create the GRN record
    const grn = await GoodsReceipt.create({
      grnNumber: await getNextGRNNumber(),
      purchaseOrder,
      items: grnItems,
      warehouse: warehouse || "Warehouse A",
      receivedBy: req.user._id,
    });

    // Update inventory: only accepted quantity adds to stock
    for (const item of grnItems) {
      let inv = await Inventory.findOne({ material: item.material });
      if (!inv) {
        inv = await Inventory.create({ material: item.material, currentStock: 0 });
      }
      inv.currentStock += item.acceptedQuantity;
      inv.lastMovement = {
        type: "in",
        quantity: item.acceptedQuantity,
        reason: `Goods receipt ${grn.grnNumber}`,
        date: new Date(),
      };
      await inv.save();

      // Update the PO item's receivedQuantity
      const poItem = po.items.find((i) => i.material.toString() === item.material.toString());
      poItem.receivedQuantity = (poItem.receivedQuantity || 0) + item.receivedQuantity;
    }

    // Determine new PO status: fully received if every item's receivedQuantity >= ordered quantity
    const fullyReceived = po.items.every((i) => (i.receivedQuantity || 0) >= i.quantity);
    po.status = fullyReceived ? "received" : "partially_received";
    await po.save();

    res.status(201).json({ grn, updatedPOStatus: po.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/goods-receipts
const getGoodsReceipts = async (req, res) => {
  try {
    const grns = await GoodsReceipt.find()
      .populate("purchaseOrder", "poNumber status")
      .populate("items.material", "materialId name unit")
      .populate("receivedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(grns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/goods-receipts/:id
const getGoodsReceiptById = async (req, res) => {
  try {
    const grn = await GoodsReceipt.findById(req.params.id)
      .populate("purchaseOrder", "poNumber status supplier")
      .populate("items.material", "materialId name unit")
      .populate("receivedBy", "name email");
    if (!grn) return res.status(404).json({ message: "Goods Receipt not found" });
    res.json(grn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createGoodsReceipt, getGoodsReceipts, getGoodsReceiptById };