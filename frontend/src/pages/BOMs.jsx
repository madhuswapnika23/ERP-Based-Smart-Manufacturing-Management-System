import { useEffect, useState } from "react";
import api from "../api/axios";

const BOMs = () => {
  const [boms, setBoms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [components, setComponents] = useState([{ material: "", quantityRequired: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [bomRes, matRes] = await Promise.all([api.get("/boms"), api.get("/materials")]);
    setBoms(bomRes.data);
    setMaterials(matRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateComponent = (index, field, value) => {
    const next = [...components];
    next[index][field] = value;
    setComponents(next);
  };

  const addComponentRow = () => setComponents([...components, { material: "", quantityRequired: "" }]);
  const removeComponentRow = (index) => setComponents(components.filter((_, i) => i !== index));

  const resetForm = () => {
    setProductName("");
    setComponents([{ material: "", quantityRequired: "" }]);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/boms", {
        productName,
        components: components.map((c) => ({
          material: c.material,
          quantityRequired: Number(c.quantityRequired),
        })),
      });
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this BOM? It won't be usable for new Production Orders.")) return;
    await api.delete(`/boms/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bill of Materials</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
          + Create BOM
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <input
            placeholder="Product Name (e.g. Hand Tool)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-4"
          />

          <p className="text-sm font-medium text-slate-700 mb-2">Components (materials needed per 1 finished unit)</p>
          {components.map((comp, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
              <select
                value={comp.material}
                onChange={(e) => updateComponent(idx, "material", e.target.value)}
                required
                className="col-span-3 border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select material</option>
                {materials.map((m) => <option key={m._id} value={m._id}>{m.materialId} - {m.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Qty per unit"
                value={comp.quantityRequired}
                onChange={(e) => updateComponent(idx, "quantityRequired", e.target.value)}
                required
                className="border border-slate-300 rounded px-3 py-2 text-sm"
              />
              {components.length > 1 && (
                <button type="button" onClick={() => removeComponentRow(idx)} className="text-red-600 text-sm">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addComponentRow} className="text-primary-600 text-sm mb-4">+ Add another component</button>

          <div className="flex gap-2">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">Submit</button>
            <button type="button" onClick={resetForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm px-4 py-2 rounded">Cancel</button>
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
                <th className="px-4 py-3">BOM ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Components</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boms.map((bom) => (
                <tr key={bom._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{bom.bomId}</td>
                  <td className="px-4 py-3">{bom.productName}</td>
                  <td className="px-4 py-3">
                    {bom.components.map((c) => `${c.material?.name} x${c.quantityRequired}`).join(", ")}
                  </td>
                  <td className="px-4 py-3">v{bom.version}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${bom.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {bom.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {bom.status === "active" && (
                      <button onClick={() => handleArchive(bom._id)} className="text-red-600 hover:underline">Archive</button>
                    )}
                  </td>
                </tr>
              ))}
              {boms.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No BOMs yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BOMs;