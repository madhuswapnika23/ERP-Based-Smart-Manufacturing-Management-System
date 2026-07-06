import { useEffect, useState } from "react";
import api from "../api/axios";

const ProductionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [bom, setBom] = useState("");
  const [quantity, setQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [workCenter, setWorkCenter] = useState("Assembly");
  const [error, setError] = useState("");
  const [mrpMessage, setMrpMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Confirmation modal state
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [confirmForm, setConfirmForm] = useState({ quantityProduced: "", quantityRejected: "0", remarks: "" });
  const [confirmError, setConfirmError] = useState("");

  const load = async () => {
    setLoading(true);
    const [orderRes, bomRes] = await Promise.all([
      api.get("/production-orders"),
      api.get("/boms?status=active"),
    ]);
    setOrders(orderRes.data);
    setBoms(bomRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setBom("");
    setQuantity("");
    setStartDate("");
    setEndDate("");
    setPriority("medium");
    setWorkCenter("Assembly");
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMrpMessage("");
    try {
      const { data } = await api.post("/production-orders", {
        bom,
        quantity: Number(quantity),
        startDate,
        endDate,
        priority,
        workCenter,
      });
      setMrpMessage(data.mrpSummary);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const openConfirm = (order) => {
    setConfirmingOrder(order);
    setConfirmForm({ quantityProduced: order.quantity, quantityRejected: "0", remarks: "" });
    setConfirmError("");
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setConfirmError("");
    try {
      await api.put(`/production-orders/${confirmingOrder._id}/confirm`, {
        quantityProduced: Number(confirmForm.quantityProduced),
        quantityRejected: Number(confirmForm.quantityRejected),
        remarks: confirmForm.remarks,
      });
      setConfirmingOrder(null);
      load();
    } catch (err) {
      setConfirmError(err.response?.data?.message || "Confirmation failed");
    }
  };

  const handleRetryMRP = async (id) => {
    const { data } = await api.put(`/production-orders/${id}/retry-mrp`);
    setMrpMessage(data.mrpSummary);
    load();
  };

  const statusColor = {
    planned: "bg-amber-100 text-amber-700",
    released: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Production Orders</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded">
          + Create Production Order
        </button>
      </div>

      {mrpMessage && (
        <div className="bg-blue-50 text-blue-700 text-sm px-4 py-3 rounded mb-4">
          <strong>MRP Result:</strong> {mrpMessage}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <select value={bom} onChange={(e) => setBom(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">Select BOM / Product</option>
              {boms.map((b) => <option key={b._id} value={b._id}>{b.bomId} - {b.productName}</option>)}
            </select>
            <input type="number" placeholder="Quantity to produce" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input placeholder="Work Center (e.g. Assembly)" value={workCenter} onChange={(e) => setWorkCenter(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-slate-500 mb-4">
            On submit, the system runs an MRP check against current inventory. If materials are short, a Purchase Requisition is auto-generated.
          </p>
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
                <th className="px-4 py-3">Order No</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.productName}</td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">
                    {order.mrpResult?.materialsAvailable ? (
                      <span className="text-green-600 text-xs">Stock reserved</span>
                    ) : (
                      <span className="text-amber-600 text-xs">
                        Shortfall — PR {order.mrpResult?.generatedPR?.prNumber || ""} ({order.mrpResult?.generatedPR?.status})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {order.status === "released" && (
                      <button onClick={() => openConfirm(order)} className="text-primary-600 hover:underline">Confirm Production</button>
                    )}
                    {order.status === "planned" && (
                      <button onClick={() => handleRetryMRP(order._id)} className="text-blue-600 hover:underline">Retry MRP</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No production orders yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {confirmingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Confirm Production — {confirmingOrder.orderNumber}
            </h2>
            {confirmError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{confirmError}</div>}
            <form onSubmit={handleConfirmSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Quantity Produced</label>
                <input type="number" required value={confirmForm.quantityProduced} onChange={(e) => setConfirmForm({ ...confirmForm, quantityProduced: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Quantity Rejected</label>
                <input type="number" value={confirmForm.quantityRejected} onChange={(e) => setConfirmForm({ ...confirmForm, quantityRejected: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Remarks</label>
                <input value={confirmForm.remarks} onChange={(e) => setConfirmForm({ ...confirmForm, remarks: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded flex-1">Confirm</button>
                <button type="button" onClick={() => setConfirmingOrder(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm px-4 py-2 rounded flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrders;