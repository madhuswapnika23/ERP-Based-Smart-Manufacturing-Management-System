import { useEffect, useState } from "react";
import api from "../api/axios";

const PurchaseOrders = () => {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [sourceRequisition, setSourceRequisition] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [gstPercent, setGstPercent] = useState(18);
  const [items, setItems] = useState([{ material: "", quantity: "", price: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [poRes, supRes, prRes, matRes] = await Promise.all([
      api.get("/purchase-orders"),
      api.get("/suppliers"),
      api.get("/purchase-requisitions?status=approved"),
      api.get("/materials"),
    ]);
    setPos(poRes.data);
    setSuppliers(supRes.data);
    setApprovedPRs(prRes.data);
    setMaterials(matRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // When an approved PR is selected, auto-fill items from it
  const handlePRSelect = (prId) => {
    setSourceRequisition(prId);
    const pr = approvedPRs.find((p) => p._id === prId);
    if (pr) {
      setItems(pr.items.map((i) => ({ material: i.material._id, quantity: i.quantity, price: "" })));
    }
  };

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const addItemRow = () => setItems([...items, { material: "", quantity: "", price: "" }]);
  const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));

  const resetForm = () => {
    setSupplier("");
    setSourceRequisition("");
    setExpectedDeliveryDate("");
    setGstPercent(18);
    setItems([{ material: "", quantity: "", price: "" }]);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/purchase-orders", {
        supplier,
        sourceRequisition: sourceRequisition || undefined,
        expectedDeliveryDate,
        gstPercent: Number(gstPercent),
        items: items.map((i) => ({
          material: i.material,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
      });
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this purchase order?")) return;
    await api.put(`/purchase-orders/${id}/cancel`);
    load();
  };

  const statusColor = {
    ordered: "bg-amber-100 text-amber-700",
    partially_received: "bg-blue-100 text-blue-700",
    received: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    draft: "bg-slate-100 text-slate-600",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Purchase Orders</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
          + Create Purchase Order
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">Select supplier</option>
              {suppliers.map((s) => <option key={s._id} value={s._id}>{s.supplierId} - {s.name}</option>)}
            </select>
            <select value={sourceRequisition} onChange={(e) => handlePRSelect(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">No linked PR (manual PO)</option>
              {approvedPRs.map((pr) => <option key={pr._id} value={pr._id}>{pr.prNumber}</option>)}
            </select>
            <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>

          <p className="text-sm font-medium text-slate-700 mb-2">Items</p>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-6 gap-2 mb-2">
              <select
                value={item.material}
                onChange={(e) => updateItem(idx, "material", e.target.value)}
                required
                className="col-span-2 border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select material</option>
                {materials.map((m) => <option key={m._id} value={m._id}>{m.materialId} - {m.name}</option>)}
              </select>
              <input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Price per unit" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItemRow(idx)} className="text-red-600 text-sm">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItemRow} className="text-primary-600 text-sm mb-4">+ Add another item</button>

          <div className="mb-4">
            <label className="text-sm text-slate-600 mr-2">GST %</label>
            <input type="number" value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} className="border border-slate-300 rounded px-3 py-1.5 text-sm w-20" />
          </div>

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
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{po.poNumber}</td>
                  <td className="px-4 py-3">{po.supplier?.name}</td>
                  <td className="px-4 py-3">{po.items.map((i) => `${i.material?.name} x${i.quantity}`).join(", ")}</td>
                  <td className="px-4 py-3">₹{po.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[po.status]}`}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {["ordered", "partially_received"].includes(po.status) && (
                      <button onClick={() => handleCancel(po._id)} className="text-red-600 hover:underline">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No purchase orders yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;