<div align="center">

# ⚡ HireFlow ATS

### AI-Powered Applicant Tracking System

*Upload resumes. Search talent. Hire smarter.*

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-6366F1?style=for-the-badge&logo=openai&logoColor=white)

</div>

---

## 📖 Overview

**HireFlow ATS** is a full-stack applicant tracking system that brings AI directly into the recruiting workflow. Recruiters can upload candidate resumes as PDFs and instantly search across the entire talent pool using plain natural language — no filters, no keyword juggling, just intent-driven queries like *"Find me a senior React developer with AWS experience"*.

Under the hood, each uploaded resume is parsed and its structured data stored in a MySQL database. When a search is triggered, a Large Language Model (via OpenRouter) analyses the candidate pool, ranks the best matches, and explains exactly why each profile was selected.

---

## ✨ Key Features

- 🤖 **AI-Powered Candidate Matching** — Natural language search powered by `Grok AI` via OpenRouter, with ranked results and per-candidate match reasoning
- 📄 **Automated PDF Parsing** — Extracts name, contact details, skills, experience, education, interests, and a professional summary directly from uploaded resumes
- 🎯 **Precision Skill vs. Interest Discrimination** — The AI is instructed to distinguish verified technical skills from personal hobbies, eliminating false positives
- 🗄️ **Persistent Candidate Database** — All parsed profiles are stored in MySQL for instant retrieval and re-querying
- 🖥️ **Modern Dark-Mode UI** — Sleek, responsive interface built with React and Tailwind CSS v4
- 📂 **CV Preview** — Uploaded PDFs are served statically, allowing recruiters to open the original resume directly from a candidate's card
- ⚡ **Fast & Lightweight** — Vite-powered frontend for near-instant hot reload in development and optimised production builds

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework & build tooling |
| Tailwind CSS v4 | Utility-first styling |
| Axios | HTTP client for API communication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express | REST API server |
| MySQL + mysql2 | Relational database & connection pooling |
| Multer | PDF file upload handling |
| pdf-parse | Text extraction from PDF resumes |

### AI
| Technology | Purpose |
|---|---|
| OpenRouter API | LLM gateway |
| Grok AI | Resume parsing & candidate ranking model |

---

## ✅ Prerequisites

Make sure the following are installed and running on your machine before proceeding:

- **[Node.js](https://nodejs.org/)** v18 or higher
- **[npm](https://www.npmjs.com/)** v9 or higher
- **[MySQL](https://www.mysql.com/)** v8 or higher (server running locally or remotely)
- An **[OpenRouter](https://openrouter.ai/)** account and API key

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/hamoudiayoub891-commits/HireFlow-ATS.git
cd hireflow-ats
```

### 2. Database setup

Log into MySQL and create the database and the required table:

```sql
CREATE DATABASE hireflow;

USE hireflow;

CREATE TABLE candidats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255),
  email       VARCHAR(255),
  phone       VARCHAR(100),
  skills      JSON,
  interests   JSON,
  experience  JSON,
  education   JSON,
  summary     TEXT,
  raw_text    LONGTEXT,
  filename    VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory (see [Environment Variables](#-environment-variables) below), then start the server:

```bash
node server.js
```

The API will be available at `http://localhost:5000`.

### 4. Frontend setup

Open a new terminal tab and run:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

Create a `.env` file inside the `/backend` directory with the following keys:

```env
# OpenRouter AI
OPENROUTER_API_KEY=sk-or-your-openrouter-api-key-here

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-database-password
DB_NAME=hireflow

# Server (optional)
PORT=5000
```

> ⚠️ **Never commit your `.env` file.** Make sure it is listed in your `.gitignore`.

---

## 📁 Project Structure

```
hireflow-ats/
├── backend/
│   ├── uploads/          # Persisted PDF files (served statically)
│   ├── db.js             # MySQL connection pool
│   ├── server.js         # Express API & route handlers
│   ├── package.json
│   └── .env              # Environment variables (not committed)
│
└── frontend/
    ├── src/
    │   └── App.jsx       # Main React application
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🧭 Usage

### 1. Upload a Resume
Navigate to the **Upload CV** tab. Drag and drop a PDF resume onto the dropzone, or click to browse your files. Click **Upload & Analyze** — the AI will parse the document and display the extracted candidate profile.

### 2. Search for Talent
Switch to the **Talent Search** tab. Type a natural language query describing the profile you need, for example:

- *"Find me a senior React developer"*
- *"Who has Python and machine learning experience?"*
- *"Show candidates with AWS and DevOps skills"*

Press **Enter** or click **Search**. HireFlow will rank all matching candidates and display a **Match Reason** for each one, citing the specific skills and experience that qualified them.

### 3. View Original CV
Each candidate card includes a **View CV** button that opens the original uploaded PDF in a new browser tab.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a PDF resume, parse it with AI, and persist to DB |
| `POST` | `/api/search` | Search candidates using a natural language prompt |
| `GET` | `/api/health` | Health check — returns server status and timestamp |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


<div align="center">

Made with ❤️ and a lot of ☕

</div>