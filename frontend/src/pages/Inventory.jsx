import { useEffect, useState } from "react";
import api from "../api/axios";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingItem, setAdjustingItem] = useState(null); // the inventory record being adjusted
  const [adjustForm, setAdjustForm] = useState({ type: "in", quantity: "", reason: "" });
  const [error, setError] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    const { data } = await api.get("/inventory");
    setInventory(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjust = (item) => {
    setAdjustingItem(item);
    setAdjustForm({ type: "in", quantity: "", reason: "" });
    setError("");
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/inventory/${adjustingItem.material._id}/adjust`, {
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });
      setAdjustingItem(null);
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Adjustment failed");
    }
  };

  const isLowStock = (item) =>
    item.material && item.currentStock <= item.material.reorderLevel;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inventory</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-5 text-slate-500 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Reserved</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Reorder Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{item.material?.name} ({item.material?.materialId})</td>
                  <td className="px-4 py-3">{item.material?.unit}</td>
                  <td className="px-4 py-3 font-medium">{item.currentStock}</td>
                  <td className="px-4 py-3 text-slate-500">{item.reservedStock}</td>
                  <td className="px-4 py-3">{item.availableStock ?? item.currentStock - item.reservedStock}</td>
                  <td className="px-4 py-3">{item.material?.reorderLevel}</td>
                  <td className="px-4 py-3">
                    {isLowStock(item) ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Low Stock</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openAdjust(item)} className="text-primary-600 hover:underline">
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">No inventory records yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {adjustingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Adjust Stock — {adjustingItem.material?.name}
            </h2>
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <select
                value={adjustForm.type}
                onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Set Exact Value (stock-take)</option>
              </select>
              <input
                type="number"
                placeholder="Quantity"
                required
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded flex-1">
                  Submit
                </button>
                <button type="button" onClick={() => setAdjustingItem(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm px-4 py-2 rounded flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;