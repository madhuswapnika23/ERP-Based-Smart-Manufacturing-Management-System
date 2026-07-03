const PurchaseRequisition = require("../models/PurchaseRequisition");
const Material = require("../models/Material");

// Generates the next PR number like PR-0001, PR-0002, ...
const getNextPRNumber = async () => {
  const count = await PurchaseRequisition.countDocuments();
  return `PR-${String(count + 1).padStart(4, "0")}`;
};

// POST /api/purchase-requisitions
// Body: { department, items: [{ material, quantity }], priority, requiredDate }
const createPR = async (req, res) => {
  try {
    const { department, items, priority, requiredDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Validate every material referenced actually exists
    for (const item of items) {
      const material = await Material.findById(item.material);
      if (!material) {
        return res.status(400).json({ message: `Material ${item.material} not found` });
      }
    }

    const pr = await PurchaseRequisition.create({
      prNumber: await getNextPRNumber(),
      department,
      items,
      priority,
      requiredDate,
      requestedBy: req.user._id,
      source: "manual",
      status: "pending",
    });

    res.status(201).json(pr);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/purchase-requisitions  (supports ?status=&priority=)
const getPRs = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const prs = await PurchaseRequisition.find(filter)
      .populate("items.material", "materialId name unit")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(prs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/purchase-requisitions/:id
const getPRById = async (req, res) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id)
      .populate("items.material", "materialId name unit costPrice")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email");
    if (!pr) return res.status(404).json({ message: "Purchase Requisition not found" });
    res.json(pr);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/purchase-requisitions/:id/approve
const approvePR = async (req, res) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);
    if (!pr) return res.status(404).json({ message: "Purchase Requisition not found" });
    if (pr.status !== "pending") {
      return res.status(400).json({ message: `Cannot approve a PR with status '${pr.status}'` });
    }

    pr.status = "approved";
    pr.approvedBy = req.user._id;
    await pr.save();

    res.json(pr);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/purchase-requisitions/:id/reject
const rejectPR = async (req, res) => {
  try {
    const pr = await PurchaseRequisition.findById(req.params.id);
    if (!pr) return res.status(404).json({ message: "Purchase Requisition not found" });
    if (pr.status !== "pending") {
      return res.status(400).json({ message: `Cannot reject a PR with status '${pr.status}'` });
    }

    pr.status = "rejected";
    pr.approvedBy = req.user._id;
    await pr.save();

    res.json(pr);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createPR, getPRs, getPRById, approvePR, rejectPR };