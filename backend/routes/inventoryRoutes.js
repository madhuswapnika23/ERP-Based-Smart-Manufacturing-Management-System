const express = require("express");
const router = express.Router();
const {
  getInventory,
  getInventoryByMaterial,
  adjustStock,
  getLowStock,
} = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Anyone logged in can view inventory
router.get("/", getInventory);
router.get("/low-stock", getLowStock);
router.get("/:materialId", getInventoryByMaterial);

// Only warehouse_manager and admin can adjust stock manually
router.put("/:materialId/adjust", authorize("admin", "warehouse_manager"), adjustStock);

module.exports = router;