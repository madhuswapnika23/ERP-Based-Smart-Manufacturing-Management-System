const express = require("express");
const router = express.Router();
const {
  createPR,
  getPRs,
  getPRById,
  approvePR,
  rejectPR,
} = require("../controllers/purchaseRequisitionController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Any logged-in user can raise a PR and view PRs
router.post("/", createPR);
router.get("/", getPRs);
router.get("/:id", getPRById);

// Only admin and purchase_manager can approve/reject
router.put("/:id/approve", authorize("admin", "purchase_manager"), approvePR);
router.put("/:id/reject", authorize("admin", "purchase_manager"), rejectPR);

module.exports = router;