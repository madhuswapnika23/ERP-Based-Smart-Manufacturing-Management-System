import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = {
  materialId: "",
  name: "",
  type: "raw",
  unit: "",
  costPrice: "",
  minimumStock: "",
  maximumStock: "",
  reorderLevel: "",
};

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadMaterials = async () => {
    setLoading(true);
    const { data } = await api.get("/materials");
    setMaterials(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice),
        minimumStock: Number(form.minimumStock),
        maximumStock: Number(form.maximumStock),
        reorderLevel: Number(form.reorderLevel),
      };
      if (editingId) {
        await api.put(`/materials/${editingId}`, payload);
      } else {
        await api.post("/materials", payload);
      }
      resetForm();
      loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (material) => {
    setForm({
      materialId: material.materialId,
      name: material.name,
      type: material.type,
      unit: material.unit,
      costPrice: material.costPrice,
      minimumStock: material.minimumStock,
      maximumStock: material.maximumStock,
      reorderLevel: material.reorderLevel,
    });
    setEditingId(material._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    await api.delete(`/materials/${id}`);
    loadMaterials();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Materials</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded"
        >
          + Add Material
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <input name="materialId" placeholder="Material ID (e.g. MAT-0003)" value={form.materialId} onChange={handleChange} required disabled={!!editingId} className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <select name="type" value={form.type} onChange={handleChange} className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="raw">Raw</option>
              <option value="semi-finished">Semi-finished</option>
              <option value="finished">Finished</option>
            </select>
            <input name="unit" placeholder="Unit (kg, pcs...)" value={form.unit} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="minimumStock" type="number" placeholder="Minimum Stock" value={form.minimumStock} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="maximumStock" type="number" placeholder="Maximum Stock" value={form.maximumStock} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="reorderLevel" type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-5 text-slate-500 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3">Material ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Cost Price</th>
                <th className="px-4 py-3">Reorder Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{m.materialId}</td>
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3 capitalize">{m.type}</td>
                  <td className="px-4 py-3">{m.unit}</td>
                  <td className="px-4 py-3">₹{m.costPrice}</td>
                  <td className="px-4 py-3">{m.reorderLevel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${m.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleEdit(m)} className="text-primary-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400">No materials yet</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Materials;
