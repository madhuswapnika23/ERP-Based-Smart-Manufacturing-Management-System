# ERP-Based Smart Manufacturing Management System

> An enterprise-grade, SAP MM (Materials Management) & SAP PP (Production Planning) inspired Smart Manufacturing Management System built with Node.js, Express, React (Vite), TailwindCSS, and MongoDB.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://erp-smart-manufacturing-system.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

---

## 🌐 Live Application URL

- **Vercel Production Deployment:** [https://erp-smart-manufacturing-system.vercel.app](https://erp-smart-manufacturing-system.vercel.app)
- **GitHub Repository:** [https://github.com/madhuswapnika23/ERP-Based-Smart-Manufacturing-Management-System](https://github.com/madhuswapnika23/ERP-Based-Smart-Manufacturing-Management-System)

---

## ✨ Key Features & Modules

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Sign In & Sign Up Pages**: Complete authentication flow with JWT tokens.
- **5 System Roles**:
  - `Administrator`: Full system control & management.
  - `Purchase Manager`: Procurement, PRs, POs, and Supplier management.
  - `Warehouse Manager`: Inventory adjustments and Goods Receipts.
  - `Production Manager`: BOMs, Production Orders, and MRP execution.
  - `Employee`: Access to relevant operational workflows.

### 📦 Materials Master & Supplier Management
- Full CRUD operations for raw materials, semi-finished goods, and finished products.
- Vendor profiles, lead times, contact details, and supplier ratings.

### 🏭 Inventory & Warehouse Management
- Real-time stock level monitoring (Current Stock, Available Stock, Reserved Stock).
- Minimum & Maximum stock thresholds with reorder alerts.
- Stock adjustments log.

### 🛒 Procurement Chain (SAP MM Inspired)
- **Purchase Requisitions (PR)**: Internal material requests with approval workflows.
- **Purchase Orders (PO)**: Vendor order generation linked to approved PRs.
- **Goods Receipt (GR)**: Real-time stock increments upon receiving physical inventory.

### ⚙️ Production Planning & MRP Check (SAP PP Inspired)
- **Bill of Materials (BOM)**: Multi-component product structures.
- **Production Orders**: Automated Material Requirements Planning (MRP) checks:
  - Validates required raw materials against current stock.
  - Automatically reserves available stock.
  - Auto-generates Purchase Requisitions for raw material shortfalls.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite), React Router v6 |
| **Styling & UI** | TailwindCSS, Lucide Icons, Recharts |
| **Backend Server** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas, Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js |
| **Database Fallback** | In-Memory MongoDB Server for offline/restricted DNS environments |
| **Deployment** | Vercel (Serverless / SPA), Render, Docker |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/madhuswapnika23/ERP-Based-Smart-Manufacturing-Management-System.git
cd ERP-Based-Smart-Manufacturing-Management-System
```

### 2. Install Dependencies
```bash
npm run postinstall
```

### 3. Environment Setup
Create a `.env` file in the project root (or inside `backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.ce9t9cg.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 4. Run the Development Server
```bash
# Start backend and frontend static server on port 5000
npm start
```
Access the application locally at `http://localhost:5000`.

Default Demo Credentials:
- **Email:** `admin@test.com`
- **Password:** `test123`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new system user |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` / `POST` | `/api/materials` | List / Create materials |
| `GET` / `POST` | `/api/suppliers` | List / Create suppliers |
| `GET` | `/api/inventory` | Fetch inventory status & stock alerts |
| `GET` / `POST` | `/api/purchase-requisitions` | Requisition management & approvals |
| `GET` / `POST` | `/api/purchase-orders` | Purchase order tracking |
| `POST` | `/api/goods-receipts` | Record goods receipt & update stock |
| `GET` / `POST` | `/api/boms` | Bill of Materials management |
| `GET` / `POST` | `/api/production-orders` | Production orders & MRP logic execution |

---

## ☁️ Cloud Deployment

### Deploy to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `./` or `frontend`.
3. Add Environment Variables: `MONGO_URI` and `JWT_SECRET`.
4. Deploy!

### Deploy to Render
1. Create a new Web Service on [Render](https://render.com).
2. Connect `madhuswapnika23/ERP-Based-Smart-Manufacturing-Management-System`.
3. Set Build Command: `npm run postinstall && npm run build`
4. Set Start Command: `npm start`
5. Add `MONGO_URI` and `JWT_SECRET` environment variables.

---

## 📜 License

This project is open-source under the [ISC License](LICENSE).
