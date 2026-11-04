# Lumina E-Commerce Platform (Full-Stack Cloudflare Edge)

A modern full-stack e-commerce application built to run **100% on Cloudflare's Free Tier** with **Zero Dedicated Backend Servers** and **Zero PostgreSQL hosting costs**:

- **Frontend & Static Hosting:** React 18, TypeScript, Tailwind CSS, Vite on **Cloudflare Pages**
- **Database:** **Cloudflare D1** (Serverless SQLite distributed SQL database)
- **API & Business Logic:** **Cloudflare Pages Functions** (`functions/api/`) powered by **Hono**
- **Authentication:** JWT with Web Crypto & bcryptjs
- **Payments:** Razorpay Edge integration with HMAC SHA-256 signature verification

---

## ⚡ Free Tier Cloudflare Usage
This setup is architected strictly within Cloudflare's generous Free Tier:
- **Cloudflare Pages:** Unlimited free static requests & global bandwidth
- **Cloudflare Pages Functions:** 100,000 free requests/day
- **Cloudflare D1 Database:** 5,000,000 free reads/day, 100,000 free writes/day, 10GB storage

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Local Cloudflare D1 Database & Seed Data
```bash
npm run d1:init
```
*(This creates all tables and populates demo products, categories, and accounts)*

### 3. Start Local Development Server
```bash
npm run dev
```
Open **http://localhost:8788** in your browser to experience the full app with Edge API and D1 SQL database simulated locally via Miniflare!

---

## 🔑 Dynamic Admin Access (Cloudflare D1)

Admin access is **100% dynamic** directly from the Cloudflare D1 database (`users.role = 'ADMIN'`). No static admin accounts or roles are hardcoded in application code.

To grant Admin access to any account:
```bash
# Grant Admin access dynamically in D1:
npx wrangler d1 execute ecommerce-db --remote --command="UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';"
```
Admin users can also promote or demote user roles dynamically within the Admin Portal under **Manage Users & Roles**.

---

## 🌐 Deploy to Cloudflare Pages (Free)

### 1. Create your Cloudflare D1 Database (Remote)
```bash
npx wrangler d1 create ecommerce-db
```
Copy the generated `database_id` into your [wrangler.toml](file:///Users/uitglobalsolutions/Downloads/ecommerce/wrangler.toml).

### 2. Run Database Migrations on Cloudflare
```bash
npm run d1:init:remote
```

### 3. Deploy
```bash
npm run deploy
```
Or simply connect your GitHub repository to **Cloudflare Pages** in the Cloudflare Dashboard:
- **Framework Preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **D1 Database Binding:** Variable Name: `DB`, Database: `ecommerce-db`

---

## 📁 Architecture Overview

```
ecommerce/
├── functions/api/[[route]].ts   # Cloudflare Pages Functions Edge API (Hono)
│                                # Auth, Products, Categories, Orders, Razorpay verification
├── migrations/
│   ├── 0001_initial_schema.sql  # D1 SQL tables (users, products, categories, orders, order_items)
│   └── 0002_seed_data.sql       # Seed demo users & curated products
├── src/
│   ├── components/              # Layout (Navbar, Footer, AdminSidebar) & Product widgets
│   ├── context/                 # AuthContext & CartContext (with localStorage persistence)
│   ├── pages/
│   │   ├── public/              # Home, ProductDetail, Cart, Checkout, OrderSuccess, Login, Register
│   │   ├── user/                # Profile, OrderHistory, Addresses
│   │   └── admin/               # Dashboard, ProductsList, ProductForm, Categories, Orders, Users
│   ├── routes/                  # React Router with PrivateRoute and AdminRoute guards
│   ├── services/                # Axios API services pointing to /api
│   └── types/                   # TypeScript interfaces
├── wrangler.toml                # Cloudflare Pages & D1 binding configuration
├── vite.config.ts               # Vite bundler & local API proxy configuration
└── package.json                 # Consolidated root package scripts & dependencies
```
