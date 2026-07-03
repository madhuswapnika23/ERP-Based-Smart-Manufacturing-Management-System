const express = require("express");
const router = express.Router();
const { createPO, getPOs, getPOById, cancelPO } = require("../controllers/purchaseOrderController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getPOs);
router.get("/:id", getPOById);

// Only admin and purchase_manager can create/cancel POs
router.post("/", authorize("admin", "purchase_manager"), createPO);
router.put("/:id/cancel", authorize("admin", "purchase_manager"), cancelPO);

module.exports = router;