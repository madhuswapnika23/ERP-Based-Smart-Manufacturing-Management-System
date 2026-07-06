import { useEffect, useState } from "react";
import api from "../api/axios";

const PurchaseRequisitions = () => {
  const [prs, setPrs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("medium");
  const [requiredDate, setRequiredDate] = useState("");
  const [items, setItems] = useState([{ material: "", quantity: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [prRes, matRes] = await Promise.all([api.get("/purchase-requisitions"), api.get("/materials")]);
    setPrs(prRes.data);
    setMaterials(matRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const addItemRow = () => setItems([...items, { material: "", quantity: "" }]);
  const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));

  const resetForm = () => {
    setDepartment("");
    setPriority("medium");
    setRequiredDate("");
    setItems([{ material: "", quantity: "" }]);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/purchase-requisitions", {
        department,
        priority,
        requiredDate,
        items: items.map((i) => ({ material: i.material, quantity: Number(i.quantity) })),
      });
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/purchase-requisitions/${id}/approve`);
    load();
  };

  const handleReject = async (id) => {
    await api.put(`/purchase-requisitions/${id}/reject`);
    load();
  };

  const statusColor = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    converted: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Requisitions</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
          + Raise Requisition
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>

          <p className="text-sm font-medium text-slate-700 mb-2">Items</p>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
              <select
                value={item.material}
                onChange={(e) => updateItem(idx, "material", e.target.value)}
                required
                className="col-span-3 border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>{m.materialId} - {m.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                required
                className="border border-slate-300 rounded px-3 py-2 text-sm"
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItemRow(idx)} className="text-red-600 text-sm">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItemRow} className="text-primary-600 text-sm mb-4">+ Add another item</button>

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
                <th className="px-4 py-3">PR Number</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prs.map((pr) => (
                <tr key={pr._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{pr.prNumber}</td>
                  <td className="px-4 py-3">{pr.department}</td>
                  <td className="px-4 py-3">
                    {pr.items.map((i) => `${i.material?.name} x${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 capitalize">{pr.priority}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${pr.source === "mrp" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                      {pr.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[pr.status]}`}>{pr.status}</span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {pr.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(pr._id)} className="text-green-600 hover:underline">Approve</button>
                        <button onClick={() => handleReject(pr._id)} className="text-red-600 hover:underline">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No purchase requisitions yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequisitions;