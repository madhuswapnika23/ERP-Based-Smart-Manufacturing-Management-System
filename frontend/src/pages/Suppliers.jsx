import { useEffect, useState } from "react";
import api from "../api/axios";

const emptyForm = {
  supplierId: "",
  name: "",
  gstNumber: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "India",
  paymentTerms: "Net 30",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSuppliers = async () => {
    setLoading(true);
    const { data } = await api.get("/suppliers");
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post("/suppliers", form);
      }
      resetForm();
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (supplier) => {
    setForm({
      supplierId: supplier.supplierId,
      name: supplier.name,
      gstNumber: supplier.gstNumber || "",
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "India",
      paymentTerms: supplier.paymentTerms || "Net 30",
    });
    setEditingId(supplier._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    await api.delete(`/suppliers/${id}`);
    loadSuppliers();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded"
        >
          + Add Supplier
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-5 mb-6">
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <input name="supplierId" placeholder="Supplier ID (e.g. SUP-0002)" value={form.supplierId} onChange={handleChange} required disabled={!!editingId} className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="name" placeholder="Supplier Name" value={form.name} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="gstNumber" placeholder="GST Number" value={form.gstNumber} onChange={handleChange} className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border border-slate-300 rounded px-3 py-2 text-sm" />
            <input name="paymentTerms" placeholder="Payment Terms" value={form.paymentTerms} onChange={handleChange} className="border border-slate-300 rounded px-3 py-2 text-sm" />
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
                <th className="px-4 py-3">Supplier ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Payment Terms</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{s.supplierId}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.paymentTerms}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleEdit(s)} className="text-primary-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No suppliers yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Suppliers;