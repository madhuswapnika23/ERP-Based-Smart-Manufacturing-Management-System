# ERP Backend — Setup Guide

## What's here

This is the Day 1-2 starter for your ERP-Based Smart Manufacturing Management System.
It includes:

- Express server with MongoDB (Atlas) connection
- User model with 5 roles (admin, purchase_manager, warehouse_manager, production_manager, employee)
- JWT auth (register/login) — fully working, copy this pattern for everything else
- Material Master — full CRUD (controller + routes), fully working, copy this pattern too
- Schemas (not yet wired to routes) for: Supplier, Inventory, PurchaseRequisition,
  PurchaseOrder, GoodsReceipt, BOM, ProductionOrder — these are ready for you to
  build controllers/routes against, following the Material pattern.

## Setup steps

1. **Install Node.js** (v18+) if you don't have it: https://nodejs.org

2. **Create a MongoDB Atlas account** (free): https://www.mongodb.com/cloud/atlas/register
   - Create a free M0 cluster
   - Under "Database Access", create a user with a password
   - Under "Network Access", add `0.0.0.0/0` (allow from anywhere — fine for a student project)
   - Click "Connect" → "Drivers" → copy the connection string

3. **Install dependencies:**
   ```
   cd backend
   npm install
   ```

4. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Paste your MongoDB connection string into `MONGO_URI` (replace `<username>`, `<password>`, `<dbname>`)
   - Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste it into `JWT_SECRET`

5. **Run the server:**
   ```
   npm run dev
   ```
   You should see "MongoDB connected" and "Server running on port 5000"

6. **Test with Postman:**
   - `POST http://localhost:5000/api/auth/register`
     Body (JSON): `{ "name": "Admin User", "email": "admin@test.com", "password": "test123", "role": "admin" }`
   - `POST http://localhost:5000/api/auth/login`
     Body: `{ "email": "admin@test.com", "password": "test123" }`
     → copy the `token` from the response
   - `GET http://localhost:5000/api/materials`
     Headers: `Authorization: Bearer <paste token here>`
   - `POST http://localhost:5000/api/materials` (same auth header)
     Body: `{ "materialId": "MAT-0001", "name": "Steel Rod", "type": "raw", "unit": "kg", "costPrice": 50, "minimumStock": 100, "maximumStock": 1000, "reorderLevel": 200 }`

## Next steps (in order)

1. Build **Supplier** controller/routes — copy `materialController.js` and `materialRoutes.js`, swap the model.
2. Build **Inventory** routes — mostly read + a manual "stock adjustment" endpoint.
3. Build **PurchaseRequisition** routes — create, approve/reject (status change), list.
4. Build **PurchaseOrder** routes — create from an approved PR, update status.
5. Build **GoodsReceipt** route — on creation, increment `Inventory.currentStock` for each
   item and update the linked PurchaseOrder's `receivedQuantity` / status. This is the
   one place where you touch two collections in one request — wrap it carefully.
6. Build **BOM** routes — simple CRUD.
7. Build **ProductionOrder** routes — on creation, run the MRP check:
   - Load the BOM for the product
   - For each component, multiply `quantityRequired` by the production order's `quantity`
   - Compare against `Inventory.availableStock` for that material
   - If enough everywhere: reserve stock (`reservedStock += required`), set `mrpResult.materialsAvailable = true`
   - If short anywhere: record the shortfall, auto-create a PurchaseRequisition with `source: "mrp"`, link it via `mrpResult.generatedPR`
   - This is the feature that makes the project "SAP PP inspired" — spend real time getting this logic right, it's what you'll walk interviewers through.
8. Build a **Production Confirmation** endpoint — updates `confirmation` fields,
   decrements `Inventory.reservedStock`/`currentStock` for consumed raw materials,
   increments stock for the finished good (if you're tracking it as a Material).
9. Then move to the frontend: login page → protected dashboard shell → Material/Supplier
   pages → procurement chain pages → BOM/Production pages → dashboard charts last.

Each numbered module above should take you roughly half a day to a day once you're
warmed up on the pattern from Material.
