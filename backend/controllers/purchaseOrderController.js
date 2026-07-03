const PurchaseOrder = require("../models/PurchaseOrder");
const PurchaseRequisition = require("../models/PurchaseRequisition");
const Material = require("../models/Material");
const Supplier = require("../models/Supplier");

const getNextPONumber = async () => {
  const count = await PurchaseOrder.countDocuments();
  return `PO-${String(count + 1).padStart(4, "0")}`;
};

// POST /api/purchase-orders
// Body: { supplier, sourceRequisition (optional), items: [{ material, quantity, price }], expectedDeliveryDate, gstPercent }
const createPO = async (req, res) => {
  try {
    const { supplier, sourceRequisition, items, expectedDeliveryDate, gstPercent } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) return res.status(400).json({ message: "Supplier not found" });

    // If created from a PR, validate the PR is approved and hasn't already been converted
    let pr = null;
    if (sourceRequisition) {
      pr = await PurchaseRequisition.findById(sourceRequisition);
      if (!pr) return res.status(400).json({ message: "Source requisition not found" });
      if (pr.status !== "approved") {
        return res.status(400).json({ message: "Source requisition must be approved before converting to a PO" });
      }
    }

    // Validate materials and compute total
    let subtotal = 0;
    for (const item of items) {
      const material = await Material.findById(item.material);
      if (!material) return res.status(400).json({ message: `Material ${item.material} not found` });
      if (!item.price || item.price < 0) {
        return res.status(400).json({ message: "Each item needs a valid price" });
      }
      subtotal += item.quantity * item.price;
    }
    const gst = gstPercent ?? 18;
    const totalAmount = Math.round(subtotal * (1 + gst / 100) * 100) / 100;

    const po = await PurchaseOrder.create({
      poNumber: await getNextPONumber(),
      supplier,
      sourceRequisition: sourceRequisition || null,
      items,
      expectedDeliveryDate,
      gstPercent: gst,
      totalAmount,
      status: "ordered",
      createdBy: req.user._id,
    });

    // Mark the source PR as converted so it can't be turned into a second PO
    if (pr) {
      pr.status = "converted";
      await pr.save();
    }

    res.status(201).json(po);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/purchase-orders  (supports ?status=)
const getPOs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const pos = await PurchaseOrder.find(filter)
      .populate("supplier", "supplierId name email")
      .populate("items.material", "materialId name unit")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/purchase-orders/:id
const getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "supplierId name email phone address")
      .populate("items.material", "materialId name unit")
      .populate("createdBy", "name email");
    if (!po) return res.status(404).json({ message: "Purchase Order not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/purchase-orders/:id/cancel
const cancelPO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: "Purchase Order not found" });
    if (["received", "cancelled"].includes(po.status)) {
      return res.status(400).json({ message: `Cannot cancel a PO with status '${po.status}'` });
    }
    po.status = "cancelled";
    await po.save();
    res.json(po);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createPO, getPOs, getPOById, cancelPO };