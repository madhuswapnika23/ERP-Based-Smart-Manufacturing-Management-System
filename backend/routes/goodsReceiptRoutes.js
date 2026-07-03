const express = require("express");
const router = express.Router();
const {
  createGoodsReceipt,
  getGoodsReceipts,
  getGoodsReceiptById,
} = require("../controllers/goodsReceiptController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getGoodsReceipts);
router.get("/:id", getGoodsReceiptById);

// Only warehouse_manager and admin record goods receipts
router.post("/", authorize("admin", "warehouse_manager"), createGoodsReceipt);

module.exports = router;