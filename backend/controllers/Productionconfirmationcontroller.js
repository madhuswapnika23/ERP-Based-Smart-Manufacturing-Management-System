const ProductionOrder = require("../models/ProductionOrder");
const BOM = require("../models/BOM");
const Inventory = require("../models/Inventory");

// PUT /api/production-orders/:id/confirm
// Body: { quantityProduced, quantityRejected, remarks }
// Only allowed on orders that are "released" (i.e. MRP already reserved the raw materials)
const confirmProduction = async (req, res) => {
  try {
    const { quantityProduced, quantityRejected, remarks } = req.body;

    if (quantityProduced == null || quantityProduced < 0) {
      return res.status(400).json({ message: "quantityProduced is required and must be >= 0" });
    }

    const order = await ProductionOrder.findById(req.params.id).populate("bom");
    if (!order) return res.status(404).json({ message: "Production Order not found" });
    if (order.status !== "released") {
      return res.status(400).json({
        message: `Only 'released' orders can be confirmed (this order is '${order.status}'). Materials must be reserved via MRP first.`,
      });
    }

    const rejected = quantityRejected || 0;
    const totalAttempted = quantityProduced + rejected;
    if (totalAttempted > order.quantity) {
      return res.status(400).json({
        message: `quantityProduced + quantityRejected (${totalAttempted}) cannot exceed the ordered quantity (${order.quantity})`,
      });
    }

    // Consume raw materials proportional to what was actually attempted (produced + rejected),
    // since rejected units still consumed raw material. Release any leftover reservation
    // if fewer units were attempted than originally ordered.
    for (const component of order.bom.components) {
      const consumedQty = component.quantityRequired * totalAttempted;
      const originallyReserved = component.quantityRequired * order.quantity;
      const leftoverReservation = originallyReserved - consumedQty;

      const inv = await Inventory.findOne({ material: component.material });
      if (inv) {
        inv.currentStock -= consumedQty;
        inv.reservedStock -= originallyReserved; // clear the full original reservation
        if (leftoverReservation > 0) {
          // leftover simply becomes available again (already handled by clearing reservedStock above)
        }
        inv.lastMovement = {
          type: "out",
          quantity: consumedQty,
          reason: `Consumed by production order ${order.orderNumber}`,
          date: new Date(),
        };
        await inv.save();
      }
    }

    // Add finished goods to inventory if the BOM's product is tracked as a Material
    if (order.bom.finishedMaterial) {
      let finishedInv = await Inventory.findOne({ material: order.bom.finishedMaterial });
      if (!finishedInv) {
        finishedInv = await Inventory.create({ material: order.bom.finishedMaterial, currentStock: 0 });
      }
      finishedInv.currentStock += quantityProduced;
      finishedInv.lastMovement = {
        type: "in",
        quantity: quantityProduced,
        reason: `Produced by production order ${order.orderNumber}`,
        date: new Date(),
      };
      await finishedInv.save();
    }

    order.confirmation = {
      quantityProduced,
      quantityRejected: rejected,
      confirmedBy: req.user._id,
      remarks: remarks || "",
      confirmedDate: new Date(),
    };
    order.status = "completed";
    await order.save();

    res.json({
      order,
      message: "Production confirmed. Raw materials consumed and finished goods updated.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { confirmProduction };