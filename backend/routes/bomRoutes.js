const express = require("express");
const router = express.Router();
const { createBOM, getBOMs, getBOMById, updateBOM, archiveBOM } = require("../controllers/bomController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getBOMs);
router.get("/:id", getBOMById);

// Only admin and production_manager manage BOMs
router.post("/", authorize("admin", "production_manager"), createBOM);
router.put("/:id", authorize("admin", "production_manager"), updateBOM);
router.delete("/:id", authorize("admin", "production_manager"), archiveBOM);

module.exports = router;