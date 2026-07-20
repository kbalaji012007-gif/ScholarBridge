# CareerBridge AI 🎓💼🤖

> One Platform for Scholarships, Careers, Placements and AI Guidance.

CareerBridge AI is a comprehensive, production-ready AI platform that guides Indian students from admission to placement. It helps students discover scholarships, verify document compliance, analyze resumes, identify skill gaps, build personalized learning roadmaps, and practice mock interviews.

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
cp .env.example .env

# Start server
uvicorn app.main:app --reload --port 8000
```

**Backend runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

### 2. Frontend (React + Vite + Tailwind)

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
cp backend/.env.example .env
# Edit .env with your settings (e.g. AI_PROVIDER=mock or gemini)

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
careerbridge-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/      # Auth, Users, Scholarships, Applications, Documents, Resume, Career, Roadmaps, Interview, Certifications, Chat, Analytics
│   │   ├── core/               # Config, Security, Dependencies
│   │   ├── database/           # SQLAlchemy base
│   │   ├── models/             # SQLAlchemy DB schemas (15 models)
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # AI services (Gemini), Eligibility engine, Document verification
│   │   └── main.py             # FastAPI app entry point
│   ├── data/
│   │   └── scholarships.csv    # 25+ real-world Indian scholarships dataset
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, UI components
│   │   ├── contexts/           # AuthContext, ThemeContext
│   │   ├── layouts/            # Public, Dashboard, Admin layouts
│   │   ├── pages/              # Landing, Auth, Dashboard, Admin pages (Resume, Career, Roadmaps, Mock Prep, etc.)
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
- 🔍 **Scholarship Discovery & Filtering** – instant matching by CGPA, income, category, state, course, gender, etc.
- 📄 **AI Resume Analyzer** – ATS score, skill extraction, strengths, weaknesses, and improvement recommendations.
- 🎯 **Career Match Engine** – finds jobs and internships matching your skills with match percentage heatmaps.
- ⚡ **Skill Gap Analyzer** – paste any job description to compare against your skills and get recommended courses/docs.
- 🗺️ **Personalized Learning Roadmaps** – AI-generated 30/60/90-day roadmaps with YouTube links, docs, and projects.
- 🏆 **Interview Preparation** – practice HR, Technical, behavioral, and coding questions with mock scoring.
- 🤖 **AI Career Assistant** – Perplexity-style chat assistant powered by Gemini AI with student profile context.
- 📁 **Document Wallet** – upload, preview, replace, and track verification status of student credentials.
- 📊 **Application Tracker** – real-time status tracking from draft to approval.

### Admin Portal
- 📈 **Analytics Dashboard** – charts for student registration, document status, and application status.
- 👥 **Student Management** – search, view profiles, and update status.
- 🎓 **Scholarship Management** – create, read, update, delete scholarships with rich eligibility options.
- ✅ **Document Verification** – approve or reject documents with specific remarks.

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend   | FastAPI, SQLAlchemy, Pydantic v2 |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| AI        | Google Gemini API / google-generativeai |
| Parsing   | pdfplumber, python-docx |
| Auth      | JWT (python-jose) + bcrypt |
| Charts    | Recharts |
| Icons     | Lucide React |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/scholarships/` | List eligible scholarships |
| POST | `/api/v1/resume/upload` | Upload & AI analyze resume |
| GET | `/api/v1/resume/analysis` | Get latest resume analysis |
| POST | `/api/v1/career/skill-gap` | Calculate skill gap vs JD |
| GET | `/api/v1/career/jobs` | Get matched jobs |
| POST | `/api/v1/roadmaps/generate` | Generate AI learning roadmap |
| POST | `/api/v1/interview/generate-questions` | Generate AI mock interview questions |
| POST | `/api/v1/chat/message` | Send message to AI Assistant |

Full docs at: http://localhost:8000/docs

---

## 📄 License

MIT License — Free for educational and personal use.

---

Made with ❤️ for Indian students by CareerBridge AI
