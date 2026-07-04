# ScholarBridge 🎓

> AI-Powered Scholarship Eligibility & Document Verification Portal

A full-stack production-ready web application that helps Indian students discover scholarships, verify documents, track applications, and receive deadline reminders.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (Backend)
- **Node.js 18+** (Frontend)
- **Docker** (optional, for containerized deployment)

---

## 🖥️ Running Locally

### 1. Backend (FastAPI)

```bash
cd backend

# Create virtual environment
py -m venv .venv
.\.venv\Scripts\activate       # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp ../.env.example .env

# Start server
uvicorn app.main:app --reload --port 8000
```

**Backend runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

## 🐳 Docker Deployment

```bash
# From project root
cp .env.example .env
# Edit .env with your settings

docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

---

## 🔐 Demo Credentials

| Role    | Email                          | Password     |
|---------|--------------------------------|--------------|
| Student | student@example.com            | Student@123  |
| Admin   | admin@scholarbridge.com        | Admin@123    |

---

## 📁 Project Structure

```
scholarbridge/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/      # Auth, Users, Scholarships, Applications, Documents, Analytics
│   │   ├── core/               # Config, Security, Dependencies
│   │   ├── database/           # SQLAlchemy base
│   │   ├── models/             # User, Scholarship, Application, Document, Notification, SavedScholarship
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Eligibility engine, Document verification
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, UI components
│   │   ├── contexts/           # AuthContext, ThemeContext
│   │   ├── layouts/            # Public, Dashboard, Admin layouts
│   │   ├── pages/              # Landing, Auth, Dashboard, Admin pages
│   │   ├── router/             # React Router with protected routes
│   │   ├── services/           # Axios API services
│   │   └── types/              # TypeScript interfaces
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ✨ Features

### Student Portal
- 🔍 **Smart Scholarship Discovery** with search, filters, sorting
- 🤖 **AI Eligibility Engine** – instant matching by CGPA, income, category, state, course, gender
- 📁 **Document Wallet** – upload, preview, replace, track verification status
- 📊 **Application Tracker** – real-time status from Draft → Approved
- 🔔 **Notifications** – deadlines, document updates, application changes
- 🌙 **Dark Mode** toggle

### Admin Portal
- 📈 **Analytics Dashboard** with charts (Recharts)
- 👥 **Student Management** table
- 🎓 **Scholarship CRUD** with rich eligibility criteria editor
- ✅ **Document Verification** – approve/reject with reasons

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend   | FastAPI, SQLAlchemy, Pydantic v2 |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| Auth      | JWT (python-jose) + bcrypt |
| Charts    | Recharts |
| Icons     | Lucide React |
| Animations| Framer Motion |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/scholarships/` | List with eligibility |
| POST | `/api/v1/scholarships/{id}/save` | Toggle save |
| POST | `/api/v1/applications/` | Apply |
| POST | `/api/v1/documents/upload` | Upload document |
| GET | `/api/v1/analytics/stats` | Admin analytics |

Full docs at: http://localhost:8000/docs

---

## 📄 License

MIT License — Free for educational and personal use.

---

Made with ❤️ for Indian students by ScholarBridge
