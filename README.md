# ⚡ upVolt

> **Powering Ideas. Connecting Possibilities.**  
> India's premier student-focused technology e-commerce & hardware innovation platform. Microcontrollers, sensors, IoT kits, robotics, and hands-on project guidance.

---

## 🚀 Overview

**upVolt** is a full-stack platform designed to empower students, makers, and innovators with high-quality electronics components, curated DIY kits, mentor support, and a modern shopping experience.

### Key Features
- 🛒 **Hardware Catalog**: Microcontrollers, sensors, communication modules, and robotics kits with real-time stock tracking.
- 💳 **Seamless Payments**: Integrated Razorpay checkout with secure server-side signature verification.
- ⚡ **Hono High-Performance Backend**: Ultra-fast RESTful API powered by Hono on Node.js.
- 🔐 **Authentication & Security**: Role-based access control (Admin & Customer), secure JWTs, and bcrypt password hashing.
- 📊 **Real-time Admin Analytics**: Live traffic telemetry, visitor metrics, order tracking, and inventory management.
- 🧑‍🏫 **Mentor Directory**: Direct mentor booking and connect links for project guidance.
- 🔄 **24/7 Keep-Alive Workflow**: GitHub Actions keep-alive pinger for free-tier Render deployments to prevent cold starts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router v7
- **Styling**: Vanilla CSS with modern design tokens & micro-animations
- **Icons**: Lucide React
- **Effects**: Canvas Confetti

### Backend
- **Framework**: [Hono](https://hono.dev/) on Node.js (`@hono/node-server`)
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, CORS middleware
- **Payment Gateway**: Razorpay Node SDK

---

## 📁 Project Structure

```text
upVolt/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── pages/              # Views (Home, Shop, ProductDetails, Cart, AdminDashboard, etc.)
│   │   ├── services/           # API fetch services
│   │   └── index.css           # Global stylesheet & design tokens
│   ├── index.html              # Entry HTML
│   ├── package.json
│   └── vite.config.js          # Vite config with /api reverse proxy
│
├── server/                     # Hono + Node.js Backend API
│   ├── src/
│   │   ├── config/             # DB & cloud configurations
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Mongoose schemas (Product, Order, User, etc.)
│   │   ├── routes/             # Hono router modules
│   │   ├── middlewares/        # Auth & validation middlewares
│   │   ├── utils/              # Helper utilities & keepAlive pinger
│   │   └── server.js           # API entry point
│   ├── .env.example            # Sample environment variables
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── render-keep-alive.yml # Automated cron to prevent Render spin-down
│
├── .gitignore                  # Root Git ignore (protects .env and node_modules)
└── README.md                   # Project documentation
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance
- [Razorpay Account](https://razorpay.com/) (Test mode keys)

---

### 2. Backend Setup (`server`)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your `MONGO_URI`, `JWT_SECRET`, and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.

4. (Optional) Seed initial products & admin:
   ```bash
   npm run seed
   ```

5. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   > Server will run at `http://localhost:5001`.

---

### 3. Frontend Setup (`client`)

1. In a separate terminal, navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   > Client will run at `http://localhost:5173`.  
   > Requests to `/api/*` are automatically proxied to `http://localhost:5001`.

---

## 📡 API Endpoints

| Resource | Route | Description |
| :--- | :--- | :--- |
| **Health** | `GET /health` | Service uptime and status check |
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register` | Authentication & token issuance |
| **Products**| `GET /api/products`, `POST /api/products` | Browse & manage hardware products |
| **Orders** | `GET /api/orders`, `POST /api/orders` | Customer orders & processing |
| **Payments**| `POST /api/payments/create-order`, `POST /api/payments/verify` | Razorpay order creation & signature verification |
| **Analytics**| `GET /api/analytics/live`, `POST /api/analytics/ping` | Live traffic telemetry and stats |
| **Admin** | `GET /api/admin/*` | Full administrative control & metrics |

---

## 🛡️ Environment Variables Guide

| Variable | Description |
| :--- | :--- |
| `PORT` | Backend port (default `5001`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |
| `FRONTEND_URL` | Allowed origin for CORS in production |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key |
| `ADMIN_MASTER_PASSWORD` | Fallback master password for admin seeding |

---

## 🌐 Deployment Notes

- **Backend (Render / Railway / VPS)**: Set the root directory to `server` or configure start command `node src/server.js`. Make sure all environment variables are added in the deployment dashboard.
- **Frontend (Vercel / Netlify / Cloudflare Pages)**: Set root directory to `client`, build command `npm run build`, and publish directory `dist`.
- **Render Keep-Alive**: The `.github/workflows/render-keep-alive.yml` workflow pings your live API every 10 minutes to prevent Render free-tier instances from spinning down. Add `RENDER_BACKEND_URL` to your GitHub repository secrets.

---

## 📄 License
This project is for educational and proprietary hardware commerce purposes under **upVolt**.
