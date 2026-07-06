import { useEffect, useState } from "react";
import api from "../api/axios";

const GoodsReceipts = () => {
  const [grns, setGrns] = useState([]);
  const [openPOs, setOpenPOs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [warehouse, setWarehouse] = useState("Warehouse A");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [grnRes, poRes] = await Promise.all([
      api.get("/goods-receipts"),
      api.get("/purchase-orders"),
    ]);
    setGrns(grnRes.data);
    setOpenPOs(poRes.data.filter((po) => ["ordered", "partially_received"].includes(po.status)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePOSelect = (poId) => {
    setPurchaseOrder(poId);
    const po = openPOs.find((p) => p._id === poId);
    if (po) {
      setItems(
        po.items.map((i) => ({
          material: i.material._id,
          materialName: i.material.name,
          orderedQuantity: i.quantity,
          receivedQuantity: "",
          acceptedQuantity: "",
          rejectedQuantity: "0",
        }))
      );
    } else {
      setItems([]);
    }
  };

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };

  const resetForm = () => {
    setPurchaseOrder("");
    setWarehouse("Warehouse A");
    setItems([]);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/goods-receipts", {
        purchaseOrder,
        warehouse,
        items: items.map((i) => ({
          material: i.material,
          receivedQuantity: Number(i.receivedQuantity),
          acceptedQuantity: Number(i.acceptedQuantity),
          rejectedQuantity: Number(i.rejectedQuantity || 0),
        })),
      });
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const statusColor = {
    ordered: "bg-amber-100 text-amber-700",
    partially_received: "bg-blue-100 text-blue-700",
    received: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Goods Receipts</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
          + Record Goods Receipt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select value={purchaseOrder} onChange={(e) => handlePOSelect(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">Select Purchase Order</option>
              {openPOs.map((po) => (
                <option key={po._id} value={po._id}>{po.poNumber} - {po.supplier?.name}</option>
              ))}
            </select>
            <input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} placeholder="Warehouse" className="border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>

          {items.length > 0 && (
            <>
              <p className="text-sm font-medium text-slate-700 mb-2">Items (ordered quantity shown for reference)</p>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 mb-2 items-center">
                  <span className="text-sm text-slate-600">{item.materialName} (ordered {item.orderedQuantity})</span>
                  <input type="number" placeholder="Received" value={item.receivedQuantity} onChange={(e) => updateItem(idx, "receivedQuantity", e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="number" placeholder="Accepted" value={item.acceptedQuantity} onChange={(e) => updateItem(idx, "acceptedQuantity", e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
                  <input type="number" placeholder="Rejected" value={item.rejectedQuantity} onChange={(e) => updateItem(idx, "rejectedQuantity", e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm" />
                </div>
              ))}
            </>
          )}

          <div className="flex gap-2 mt-4">
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
                <th className="px-4 py-3">GRN Number</th>
                <th className="px-4 py-3">Purchase Order</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Received Date</th>
              </tr>
            </thead>
            <tbody>
              {grns.map((grn) => (
                <tr key={grn._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{grn.grnNumber}</td>
                  <td className="px-4 py-3">
                    {grn.purchaseOrder?.poNumber}{" "}
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${statusColor[grn.purchaseOrder?.status]}`}>
                      {grn.purchaseOrder?.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {grn.items.map((i) => `${i.material?.name}: accepted ${i.acceptedQuantity}, rejected ${i.rejectedQuantity}`).join(" | ")}
                  </td>
                  <td className="px-4 py-3">{grn.warehouse}</td>
                  <td className="px-4 py-3">{new Date(grn.receivedDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {grns.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No goods receipts yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GoodsReceipts;