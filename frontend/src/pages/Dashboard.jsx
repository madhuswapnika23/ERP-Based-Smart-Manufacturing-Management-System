import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";

const Card = ({ label, value, accent }) => (
  <div className="bg-white rounded-lg shadow-sm p-5 border-l-4" style={{ borderColor: accent }}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    materials: 0,
    suppliers: 0,
    pendingPOs: 0,
    activeProductionOrders: 0,
    lowStockCount: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [materials, suppliers, pos, orders, lowStock] = await Promise.all([
          api.get("/materials"),
          api.get("/suppliers"),
          api.get("/purchase-orders?status=ordered"),
          api.get("/production-orders?status=released"),
          api.get("/inventory/low-stock"),
        ]);

        setStats({
          materials: materials.data.length,
          suppliers: suppliers.data.length,
          pendingPOs: pos.data.length,
          activeProductionOrders: orders.data.length,
          lowStockCount: lowStock.data.length,
        });

        // Simple chart: stock levels per material
        const inv = await api.get("/inventory");
        setChartData(
          inv.data.map((item) => ({
            name: item.material?.name || "Unknown",
            stock: item.currentStock,
          }))
        );
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card label="Total Materials" value={stats.materials} accent="#3b82f6" />
        <Card label="Total Suppliers" value={stats.suppliers} accent="#10b981" />
        <Card label="Pending Purchase Orders" value={stats.pendingPOs} accent="#f59e0b" />
        <Card label="Active Production Orders" value={stats.activeProductionOrders} accent="#8b5cf6" />
        <Card label="Low Stock Items" value={stats.lowStockCount} accent="#ef4444" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Inventory Levels</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
