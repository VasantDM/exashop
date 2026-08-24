# Production E-Commerce Platform

A production-ready, full-stack E-commerce web application built with Python Django REST Framework, PostgreSQL, and React.js.

## 🏗️ Architecture

```
ecommerce-project/
├── backend/                  # Django REST Framework Backend
│   ├── apps/                 # Modular Django apps (users, products, categories, cart, orders, payments, reviews)
│   ├── config/               # Project settings, URL routing, ASGI/WSGI
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── frontend/                 # React.js (Vite) Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # View pages (Home, Products, Cart, Checkout, etc.)
│   │   ├── layouts/          # Layout wrappers (Header, Footer, MainLayout)
│   │   ├── services/         # API client & HTTP service layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Global state & Auth context
│   │   ├── utils/            # Utilities and formatters
│   │   ├── assets/           # Static assets
│   │   ├── App.jsx           # App routing
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend will start on `http://127.0.0.1:8000/`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173/`.

### 4. Health Check
- Backend API: `http://127.0.0.1:8000/api/v1/health/`
- Frontend UI: `http://localhost:5173/` displays the live database and API connectivity status.

## 📄 Project Status & Full Audit
For the full architectural status, endpoint manifest, diagnostic results, and roadmap, see [PROJECT_STATUS.md](file:///c:/shopigo/PROJECT_STATUS.md).

