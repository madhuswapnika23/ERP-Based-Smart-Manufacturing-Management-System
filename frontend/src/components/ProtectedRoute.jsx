import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600">Access denied</h2>
        <p className="text-gray-500 mt-2">Your role ({user.role}) doesn't have access to this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
