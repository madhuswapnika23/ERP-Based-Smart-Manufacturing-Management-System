const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getSuppliers);
router.get("/:id", getSupplierById);

router.post("/", authorize("admin", "purchase_manager"), createSupplier);
router.put("/:id", authorize("admin", "purchase_manager"), updateSupplier);
router.delete("/:id", authorize("admin", "purchase_manager"), deleteSupplier);

module.exports = router;