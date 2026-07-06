import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  Boxes,
  FileText,
  ShoppingCart,
  PackageCheck,
  Layers,
  Factory,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Master Data",
    items: [
      { to: "/materials", label: "Materials", icon: Package },
      { to: "/suppliers", label: "Suppliers", icon: Truck },
      { to: "/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Procurement (MM)",
    items: [
      { to: "/purchase-requisitions", label: "Purchase Requisitions", icon: FileText },
      { to: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
      { to: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck },
    ],
  },
  {
    label: "Production (PP)",
    items: [
      { to: "/boms", label: "Bill of Materials", icon: Layers },
      { to: "/production-orders", label: "Production Orders", icon: Factory },
    ],
  },
  {
    label: "Analytics",
    items: [{ to: "/reports", label: "Reports", icon: BarChart3 }],
  },
];

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-base font-bold tracking-tight">ERP Manufacturing</h1>
          <p className="text-xs text-slate-400 mt-0.5">SAP MM/PP Inspired</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-primary-600 text-white border-r-2 border-primary-300"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded w-full transition-colors"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;