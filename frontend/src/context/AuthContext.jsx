import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("erp_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("erp_token", data.token);
    localStorage.setItem("erp_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("erp_token", data.token);
    localStorage.setItem("erp_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
