const express = require("express");
const router = express.Router();
const { confirmProduction } = require("../controllers/productionConfirmationController");
const {
  createProductionOrder,
  getProductionOrders,
  getProductionOrderById,
  retryMRP,
} = require("../controllers/productionOrderController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getProductionOrders);
router.get("/:id", getProductionOrderById);

// Only admin and production_manager create production orders
router.post("/", authorize("admin", "production_manager"), createProductionOrder);
router.put("/:id/retry-mrp", authorize("admin", "production_manager"), retryMRP);
router.put("/:id/confirm", authorize("admin", "production_manager"), confirmProduction);

module.exports = router;