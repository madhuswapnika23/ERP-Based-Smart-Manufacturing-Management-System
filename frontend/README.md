# ERP Frontend — Setup Guide

## What's here

- Full React + Vite + Tailwind setup
- Working login page connected to your backend's `/api/auth/login`
- Auth context that stores the JWT and auto-attaches it to every API call
- Protected routing — logged-out users get bounced to `/login`
- Sidebar layout with navigation to all 9 modules
- **Dashboard** — fully working, pulls live counts + a stock-level chart from your backend
- **Materials** — fully working CRUD page (list, create, edit, delete) — this is your template
- All other modules (Suppliers, Inventory, PRs, POs, GRNs, BOMs, Production Orders) are
  placeholder pages — build each one by copying `Materials.jsx` and swapping the API endpoint
  and form fields, same pattern you used for the backend controllers.

## Setup steps

1. Make sure your **backend is running** on `http://localhost:5000` (from your earlier setup)

2. Install dependencies:
   ```
   cd frontend
   npm install
   ```

3. Run the dev server:
   ```
   npm run dev
   ```

4. Open the URL it prints (usually `http://localhost:5173`)

5. Log in with the admin account you created earlier via Postman:
   - Email: `admin@test.com`
   - Password: `test123`

You should land on the Dashboard and see your real stats (materials, suppliers, low stock, etc.)
pulled live from MongoDB.

## Building the remaining pages

For each remaining module, copy `src/pages/Materials.jsx` to a new file (e.g. `Suppliers.jsx`) and change:
1. The API endpoint (`/materials` → `/suppliers`)
2. The `emptyForm` fields to match that module's schema
3. The table columns to show relevant fields
4. Then wire it into `App.jsx` — replace the matching `<ComingSoon .../>` line with your new component

Suggested order (matches your backend build order):
1. **Suppliers** — simplest, nearly identical to Materials
2. **Inventory** — mostly read-only table + a stock adjustment button/modal
3. **Purchase Requisitions** — list + create form + Approve/Reject buttons (not Edit/Delete)
4. **Purchase Orders** — list + create form (select supplier + PR + items) + Cancel button
5. **Goods Receipts** — create form (select PO, enter received/accepted/rejected quantities)
6. **BOMs** — create form (product name + list of component materials/quantities)
7. **Production Orders** — create form (select BOM, quantity, dates) + show MRP result +
   Confirm Production button when status is "released"

Each page should take 30-60 minutes once you're warmed up on the Materials pattern.

## Deploying (final step, once all pages work locally)

- Push both `frontend/` and `backend/` folders to GitHub (as separate repos or one monorepo)
- Backend → deploy to **Render** (free tier): connect your GitHub repo, set the same
  environment variables from your `.env` (MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN)
- Frontend → deploy to **Vercel** (free tier): connect your GitHub repo, and update
  `src/api/axios.js`'s `baseURL` to point to your deployed Render backend URL instead of
  `localhost:5000`
