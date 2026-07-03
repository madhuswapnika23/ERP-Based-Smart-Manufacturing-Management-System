const express = require("express");
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, authorize } = require("../middleware/auth");

// All routes require login
router.use(protect);

router.get("/", getMaterials);
router.get("/:id", getMaterialById);

// Only admin and purchase_manager can create/edit/delete materials
router.post("/", authorize("admin", "purchase_manager"), createMaterial);
router.put("/:id", authorize("admin", "purchase_manager"), updateMaterial);
router.delete("/:id", authorize("admin", "purchase_manager"), deleteMaterial);

module.exports = router;
