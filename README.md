<div align="center">

# 💰 ExpenseIQ

### A Full-Stack Personal Finance & Expense Management Web Application

<p>
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel"/>
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black"/>
  <img src="https://img.shields.io/badge/Database-Aiven_MySQL-EE2A4A?style=flat-square"/>
</p>

</div>

---

## 📌 About

ExpenseIQ is a full-stack personal finance web application that helps users track expenses, manage budgets, monitor saving goals, and generate detailed financial reports — all from a responsive, dark-mode-ready interface.

The backend is built with Java 21 and Spring Boot, secured with JWT authentication, and backed by a MySQL database managed through Flyway migrations. The frontend is a React + Vite + Tailwind CSS single-page application, deployed on Vercel. Receipt scanning is supported with browser-based OCR to assist transaction entry.

---

## 🌐 Live Demo

| | Link |
|---|---|
| 🖥️ Frontend | [expense-iq-chi.vercel.app](https://expense-iq-chi.vercel.app) |
| ⚙️ Backend API | [expenseiq-backend-nz82.onrender.com](https://expenseiq-backend-nz82.onrender.com) |
| 🩺 Health Check | [/actuator/health](https://expenseiq-backend-nz82.onrender.com/actuator/health) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Language** | JavaScript (ES2023) |
| **Frontend Framework** | React + Vite |
| **Frontend Styling** | Tailwind CSS |
| **Backend Language** | Java 21 |
| **Backend Framework** | Spring Boot |
| **Security** | Spring Security, JWT (access + refresh tokens), BCrypt |
| **ORM / Data Access** | JPA / Hibernate |
| **Database Migrations** | Flyway |
| **Database** | MySQL |
| **Containerisation** | Docker |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Render (Docker Web Service) |
| **Production Database** | Aiven MySQL |
| **Uptime Monitoring** | UptimeRobot |

---

## ✨ Key Implemented Features

- **JWT authentication** with access tokens, refresh tokens, and logout/session invalidation
- **BCrypt** password hashing with configurable strength
- **Financial accounts** — create, update, archive, and track balances
- **Transactions** — income, expense, and transfer types; linked to accounts and categories
- **Budgets** — per-category and overall; monthly tracking with warning/exceeded status
- **Saving goals** — contributions, progress percentage, pause/resume/archive
- **Analytics** — dashboard charts from live backend data; monthly, category, and account breakdowns
- **Reports & exports** — generate and download reports as CSV, XLSX (multi-sheet), or PDF
- **Receipt upload + OCR** — browser-based OCR extracts merchant, amount, reference, and description to prefill the transaction form
- **Notifications** — budget alerts, goal alerts, large expense alerts; mark read/delete
- **Audit logs** — action tracking for accounts, categories, and transactions
- **Dark mode** — full dark/light theme toggle
- **Responsive layout** — mobile and desktop support
- **No secrets in source code** — all credentials and keys use environment variables

---

## 🖥️ Frontend Pages & Modules

| Page / Module | Description |
|---|---|
| Landing Page | Public marketing/intro page |
| Register | New user sign-up with validation |
| Login | JWT-authenticated login |
| Dashboard | Summary cards, recent transactions, charts |
| Accounts | Create, view, update, and archive financial accounts |
| Transactions | Full transaction list with filters; add/edit/delete |
| Categories | User-specific categories for income/expense; archive support |
| Budgets | Budget cards with spent/remaining/percentage/status |
| Goals | Saving goals with contribution tracking and progress bars |
| Analytics | Monthly, category, and account-level charts from live API data |
| Reports | Date-range report generation; CSV/XLSX/PDF export buttons |
| Settings | Profile update, preferences, timezone, currency, date format |
| Notifications | Bell icon with notification list; mark read/delete |
| Receipt Upload | OCR-assisted transaction form with file upload support |

Additional UI features: loading states, empty states, and error states implemented across all modules.

---

## ⚙️ Backend Modules

### 1. Authentication & Security
- User registration and login
- JWT access token + refresh token issuance
- Logout with session/token invalidation
- Login rate limiting and account lock handling
- BCrypt password hashing (configurable strength via environment variable)
- CORS configured for the deployed frontend URL
- All sensitive config externalized to environment variables

### 2. User Profile & Settings
- Profile fetch and update
- User preferences (timezone, currency, date format)
- Session and device information support

### 3. Financial Accounts
- Create, update, list, and archive accounts
- Balance management per account
- Include/exclude accounts from overall totals
- All data scoped to the authenticated user

### 4. Categories
- Create, list, update, and archive transaction categories
- User-specific category isolation
- Categories linked to transactions and analytics

### 5. Transactions
- Full CRUD for income, expense, and transfer transactions
- Linked to accounts and categories
- Fields: merchant/payee, description, reference number, amount, date
- Filtered transaction history via authenticated APIs

### 6. Receipt Attachments & OCR
- Receipt file upload and storage
- File metadata management (upload, download, delete)
- Browser OCR extracts suggested values for merchant, amount, reference, and description
- Suggestions prefill the transaction entry form

### 7. Analytics
- Dashboard and analytics APIs
- Monthly, category, account, and transaction-based aggregations
- Date range filtering
- Frontend charts consume live API responses

### 8. Budgets
- Create, list, update, and archive budgets
- Overall and category-level budget types
- Monthly budget period tracking
- Spent amount, remaining amount, percentage used
- Warning and exceeded status computed per budget

### 9. Goals
- Create, list, update, pause, resume, and archive saving goals
- Manual contribution support
- Account-funded contribution handling
- Progress percentage, target-date proximity, and completed goal handling

### 10. Notifications & Alerts
- Notification list and unread summary APIs
- Alert generation for budget warnings/exceeded, goal milestones, and large expenses
- Mark individual notifications read / mark all read / delete
- Notification templates and settings stored in database configuration

### 11. Reports & Exports
- Financial report generation by date range
- CSV export
- XLSX export (multiple sheets)
- PDF export
- Report configuration stored in database/config
- All reports generated from real posted transaction records

### 12. Audit Logs
- Audit log table tracking critical actions
- Covers accounts, categories, and transactions
- Records action type, module, and performed-by user

---

## 🗃️ Database & Migrations

- **Database:** MySQL (production on Aiven MySQL)
- **Migration tool:** Flyway — all schema changes are versioned and applied automatically on startup
- No manual schema edits in production; all changes go through migration scripts

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | BCrypt with configurable cost factor |
| Authentication | JWT access tokens + refresh tokens |
| Session invalidation | Logout invalidates the active token |
| Rate limiting | Login attempt protection and account lock handling |
| Authorization | All data APIs are user-scoped — no cross-user data access |
| CORS | Restricted to the configured frontend origin |
| Secrets management | No credentials in source code; all via environment variables |
| Git safety | `.env` files excluded in `.gitignore`; only `.env.example` committed |

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│               USER BROWSER                  │
└────────────────────┬────────────────────────┘
                     │  HTTPS
                     ▼
┌─────────────────────────────────────────────┐
│           VERCEL (Frontend)                 │
│     React + Vite + Tailwind CSS SPA         │
│     expense-iq-chi.vercel.app               │
└────────────────────┬────────────────────────┘
                     │  REST API calls (HTTPS)
                     ▼
┌─────────────────────────────────────────────┐
│        RENDER (Backend Docker Service)      │
│        Spring Boot — Java 21                │
│        expenseiq-backend-nz82.onrender.com  │
└────────────────────┬────────────────────────┘
                     │  JDBC / SSL
                     ▼
┌─────────────────────────────────────────────┐
│         AIVEN MySQL (Production DB)         │
│         Flyway-managed schema               │
└─────────────────────────────────────────────┘

Monitoring: UptimeRobot → /actuator/health (keeps backend warm)
```

---

## 🔧 Environment Variables

### Backend (Render / Railway)

```env
# Server
ET_SERVER_PORT=<port>

# Database
ET_DB_URL=<your_mysql_jdbc_url>
ET_DB_USERNAME=<your_db_username>
ET_DB_PASSWORD=<your_db_password>

# JWT
ET_JWT_SECRET=<minimum_64_character_random_secret>
ET_JWT_ISSUER=ExpenseIQ
ET_JWT_ACCESS_TOKEN_EXPIRATION_MS=900000
ET_JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000

# Security
ET_BCRYPT_STRENGTH=12

# CORS
ET_CORS_ALLOWED_ORIGINS=<your_frontend_url>

# Receipt Storage
EXPENSEIQ_RECEIPT_STORAGE_PATH=<path_to_storage_directory>
EXPENSEIQ_RECEIPT_MAX_FILE_SIZE_BYTES=5242880
EXPENSEIQ_RECEIPT_ALLOWED_CONTENT_TYPES=image/png,image/jpeg,image/webp,application/pdf
```

### Frontend (Vercel)

```env
VITE_APP_NAME=ExpenseIQ
VITE_API_BASE_URL=<your_backend_url>/api/v1
```

> ⚠️ Never commit real secrets, passwords, or JWT values to GitHub. Use `.env.example` with placeholder values for documentation.

---

## 💻 Local Setup

### Prerequisites

- Java 21+
- Maven 3.8+
- Node.js 18+
- MySQL 8.x running locally

### Backend

```bash
cd et-backend

# Copy and fill in your local env values
cp .env.example .env

# Compile
mvn clean compile

# Run (Flyway migrations apply automatically on first start)
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### Frontend

```bash
cd et-frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Production build
npm run build
```

Frontend runs at: `http://localhost:5173`

---

## 🏗️ Build & Test Commands

### Backend

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package as JAR
mvn clean package -DskipTests

# Build Docker image
docker build -t expenseiq-backend .

# Run Docker container locally
docker run -p 8080:8080 --env-file .env expenseiq-backend
```

### Frontend

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Lint check
npm run lint

# Production build (output: dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment Notes

**Frontend (Vercel)**
- Connect the GitHub repository to Vercel
- Set root directory to `et-frontend`
- Set build command: `npm run build`
- Set output directory: `dist`
- Add `VITE_API_BASE_URL` in Vercel environment variables

**Backend (Render — Docker Web Service)**
- Connect the GitHub repository to Render
- Set root directory to `et-backend`
- Render uses the `Dockerfile` in `et-backend/`
- Add all `ET_*` environment variables in Render's service settings
- Health check URL: `/actuator/health`

**Database (Aiven MySQL)**
- Create a MySQL service on Aiven
- Copy the JDBC connection string into `ET_DB_URL`
- Flyway applies all migrations on first backend startup

**Monitoring (UptimeRobot)**
- Configure a monitor pointed at `https://expenseiq-backend-nz82.onrender.com/actuator/health`
- Keeps the Render backend warm and alerts on downtime

---

## 📊 Project Status

| Area | Status |
|---|---|
| Backend APIs | ✅ Implemented and deployed |
| Frontend SPA | ✅ Implemented and deployed |
| JWT Auth (access + refresh) | ✅ Live |
| Flyway migrations | ✅ Applied in production |
| Docker deployment | ✅ Running on Render |
| Aiven MySQL | ✅ Connected |
| Vercel frontend | ✅ Live |
| UptimeRobot monitoring | ✅ Configured |
| Receipt upload + OCR | ✅ Implemented |
| CSV / XLSX / PDF export | ✅ Implemented |

---

## 👨‍💻 Author

**Rakesh Gowda B P**
Final Year B.E. CSE | Dr. SMCE, Nelamangala (VTU) | CGPA: 8.38
Java Full Stack Intern @ Tap Edtech Pvt Ltd

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rakesh-gowda-bp)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/rakeshgowdabp05)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=firefox&logoColor=white)](https://demo-portfolio-theta-ten.vercel.app)
[![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:rakeshgowdabp05@gmail.com)

---

<div align="center">
  <i>Built with Java, Spring Boot, React, and MySQL — production-deployed, real data, no shortcuts.</i>
</div>
