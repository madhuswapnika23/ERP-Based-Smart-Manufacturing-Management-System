const Material = require("../models/Material");
const Inventory = require("../models/Inventory");

// POST /api/materials
const createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    // Every new material starts with an inventory record at 0 stock
    await Inventory.create({ material: material._id, currentStock: 0, warehouse: material.warehouse });
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/materials  (supports ?search=&type=&category=)
const getMaterials = async (req, res) => {
  try {
    const { search, type, category } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const materials = await Material.find(filter).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/materials/:id
const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/materials/:id
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });
    await Inventory.findOneAndDelete({ material: req.params.id });
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createMaterial, getMaterials, getMaterialById, updateMaterial, deleteMaterial };
