import axios from "axios";

// In production (Vercel), use relative /api path (handled by vercel.json rewrites).
// In local dev, set VITE_API_URL=http://localhost:5000/api in frontend/.env.local
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Automatically attach the JWT token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, bounce back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
