const BOM = require("../models/BOM");
const Material = require("../models/Material");

const getNextBOMId = async () => {
  const count = await BOM.countDocuments();
  return `BOM-${String(count + 1).padStart(4, "0")}`;
};

// POST /api/boms
// Body: { productName, finishedMaterial (optional), components: [{ material, quantityRequired }] }
const createBOM = async (req, res) => {
  try {
    const { productName, finishedMaterial, components } = req.body;

    if (!components || components.length === 0) {
      return res.status(400).json({ message: "At least one component is required" });
    }

    for (const comp of components) {
      const material = await Material.findById(comp.material);
      if (!material) return res.status(400).json({ message: `Material ${comp.material} not found` });
    }

    const bom = await BOM.create({
      bomId: await getNextBOMId(),
      productName,
      finishedMaterial: finishedMaterial || null,
      components,
    });

    res.status(201).json(bom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/boms  (supports ?status=)
const getBOMs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const boms = await BOM.find(filter)
      .populate("components.material", "materialId name unit costPrice")
      .populate("finishedMaterial", "materialId name unit")
      .sort({ createdAt: -1 });
    res.json(boms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/boms/:id
const getBOMById = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate("components.material", "materialId name unit costPrice")
      .populate("finishedMaterial", "materialId name unit");
    if (!bom) return res.status(404).json({ message: "BOM not found" });
    res.json(bom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/boms/:id
const updateBOM = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ message: "BOM not found" });

    // Any component change bumps the version (mirrors SAP's BOM versioning idea)
    if (req.body.components) {
      bom.version += 1;
    }

    Object.assign(bom, req.body);
    await bom.save();
    res.json(bom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/boms/:id  (soft delete - archives instead of removing, since Production Orders may reference it)
const archiveBOM = async (req, res) => {
  try {
    const bom = await BOM.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
    if (!bom) return res.status(404).json({ message: "BOM not found" });
    res.json(bom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBOM, getBOMs, getBOMById, updateBOM, archiveBOM };