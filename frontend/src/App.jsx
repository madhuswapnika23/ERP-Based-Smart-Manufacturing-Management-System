import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import ComingSoon from "./pages/ComingSoon";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import PurchaseRequisitions from "./pages/PurchaseRequisitions";
import PurchaseOrders from "./pages/PurchaseOrders";
import GoodsReceipts from "./pages/GoodsReceipts";
import BOMs from "./pages/BOMs";
import ProductionOrders from "./pages/ProductionOrders";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="materials" element={<Materials />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchase-requisitions" element={<PurchaseRequisitions />} />
<Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="goods-receipts" element={<GoodsReceipts />} />
<Route path="boms" element={<BOMs />} />
<Route path="production-orders" element={<ProductionOrders />} />
<Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
