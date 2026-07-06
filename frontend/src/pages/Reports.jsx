import { useState } from "react";
import api from "../api/axios";

// Converts an array of flat objects into a downloadable CSV file
const downloadCSV = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ReportCard = ({ title, description, onGenerate, rows, columns }) => (
  <div className="bg-white rounded-lg shadow-sm p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onGenerate}
        className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap"
      >
        Export CSV
      </button>
    </div>
    {rows && rows.length > 0 && (
      <div className="overflow-x-auto mt-3 border-t border-slate-100 pt-3">
        <table className="w-full text-xs">
          <thead className="text-slate-500 text-left">
            <tr>{columns.map((c) => <th key={c} className="pr-4 pb-2">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((row, idx) => (
              <tr key={idx} className="border-t border-slate-50">
                {columns.map((c) => <td key={c} className="pr-4 py-1.5 text-slate-700">{row[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 5 && (
          <p className="text-xs text-slate-400 mt-2">Showing 5 of {rows.length} rows — export CSV for full data</p>
        )}
      </div>
    )}
  </div>
);

const Reports = () => {
  const [inventoryPreview, setInventoryPreview] = useState([]);
  const [poPreview, setPoPreview] = useState([]);
  const [productionPreview, setProductionPreview] = useState([]);
  const [vendorPreview, setVendorPreview] = useState([]);

  const generateInventoryReport = async () => {
    const { data } = await api.get("/inventory");
    const rows = data.map((item) => ({
      "Material ID": item.material?.materialId,
      "Material Name": item.material?.name,
      Unit: item.material?.unit,
      "Current Stock": item.currentStock,
      "Reserved Stock": item.reservedStock,
      "Available Stock": item.availableStock ?? item.currentStock - item.reservedStock,
      "Reorder Level": item.material?.reorderLevel,
      Warehouse: item.warehouse,
    }));
    setInventoryPreview(rows);
    downloadCSV("inventory-report.csv", rows);
  };

  const generatePurchaseReport = async () => {
    const { data } = await api.get("/purchase-orders");
    const rows = data.map((po) => ({
      "PO Number": po.poNumber,
      Supplier: po.supplier?.name,
      Status: po.status,
      "Total Amount": po.totalAmount,
      "Order Date": new Date(po.orderDate).toLocaleDateString(),
      "Expected Delivery": po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : "",
    }));
    setPoPreview(rows);
    downloadCSV("purchase-order-report.csv", rows);
  };

  const generateProductionReport = async () => {
    const { data } = await api.get("/production-orders");
    const rows = data.map((order) => ({
      "Order Number": order.orderNumber,
      Product: order.productName,
      Quantity: order.quantity,
      Status: order.status,
      "Materials Available": order.mrpResult?.materialsAvailable ? "Yes" : "No",
      "Quantity Produced": order.confirmation?.quantityProduced || 0,
      "Quantity Rejected": order.confirmation?.quantityRejected || 0,
    }));
    setProductionPreview(rows);
    downloadCSV("production-report.csv", rows);
  };

  const generateVendorReport = async () => {
    const [suppliersRes, posRes] = await Promise.all([api.get("/suppliers"), api.get("/purchase-orders")]);
    const rows = suppliersRes.data.map((s) => {
      const supplierPOs = posRes.data.filter((po) => po.supplier?._id === s._id);
      const totalSpend = supplierPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
      return {
        "Supplier ID": s.supplierId,
        Name: s.name,
        "Total POs": supplierPOs.length,
        "Total Spend": totalSpend,
        Status: s.status,
      };
    });
    setVendorPreview(rows);
    downloadCSV("vendor-report.csv", rows);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Reports</h1>
      <p className="text-sm text-slate-500 mb-6">Generate and export business reports as CSV files</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard
          title="Inventory Report"
          description="Current, reserved, and available stock for every material"
          onGenerate={generateInventoryReport}
          rows={inventoryPreview}
          columns={["Material ID", "Material Name", "Current Stock", "Available Stock"]}
        />
        <ReportCard
          title="Purchase Order Report"
          description="All purchase orders with supplier, amount, and status"
          onGenerate={generatePurchaseReport}
          rows={poPreview}
          columns={["PO Number", "Supplier", "Status", "Total Amount"]}
        />
        <ReportCard
          title="Production Report"
          description="Production orders with MRP outcome and confirmation results"
          onGenerate={generateProductionReport}
          rows={productionPreview}
          columns={["Order Number", "Product", "Status", "Quantity Produced"]}
        />
        <ReportCard
          title="Vendor Report"
          description="Supplier-wise purchase order count and total spend"
          onGenerate={generateVendorReport}
          rows={vendorPreview}
          columns={["Supplier ID", "Name", "Total POs", "Total Spend"]}
        />
      </div>
    </div>
  );
};

export default Reports;