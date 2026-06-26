# 🧠 NeuralPath

> **Automated Employee Onboarding & Adaptive Upskilling Platform**

NeuralPath is a modern B2B SaaS platform designed to automate trainee and intern onboarding for engineering teams. By parsing candidates' PDF resumes with LLM analysis, the platform identifies critical skill gaps against customizable role benchmarks and constructs adaptive, step-by-step learning pathways with curated video resources.

---

## 🚀 Key Features

*   **AI-Driven Skill Gap Analysis**: Extracts technical competencies and qualifications from uploaded PDF resume buffers using the Gemini API.
*   **Dynamic Role Benchmarking**: Administrators can define and customize required skills, priority weightings, and resource mappings for specific target roles.
*   **Adaptive Learning Pathways**: Generates custom roadmaps focusing only on identified skill gaps, complete with pre-mapped video segments and resource links.
*   **Progress Tracking & Analytics**: Allows trainees to mark milestones as completed, visualizing progress and hourly study velocity graphs via interactive Recharts.
*   **HR Cohort Dashboard**: Provides team leads with direct visibility into cohort readiness, skill strengths, deficiencies, and audit trails.
*   **Secure Object Storage**: Keeps trainee credentials securely hosted on Supabase Storage bucket infrastructure.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide React, Recharts |
| **Backend** | Node.js, Express, Multer, PDF-Parse, JSON Web Tokens (JWT), Bcrypt |
| **Database** | MongoDB (via Mongoose ODM) |
| **Services & Storage** | Supabase Storage (for resume PDFs), Gemini API (for LLM skill analysis) |

---

## 📁 Directory Structure

```text
neuralpath/
├── backend/
│   ├── controllers/      # Route handler controllers (auth, admin, resumes, gaps)
│   ├── data/             # Seeding scripts (seedVideos.js)
│   ├── middleware/       # Authentication guards & file uploading
│   ├── models/           # Mongoose schemas (User, Role, SkillVideo, Resume)
│   ├── routes/           # Express API endpoints
│   ├── services/         # Integrations (aiService, supabaseService, pdfService)
│   ├── app.js            # Express app configuration
│   └── server.js         # Entry point & DB connector
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI widgets & Auth gates
│   │   ├── context/      # React contexts (AppContext, ThemeContext)
│   │   ├── pages/        # View screens (HomePage, LoginPage, UploadPage, DashboardPage)
│   │   ├── App.jsx       # Routing & main container
│   │   └── main.jsx      # Entry point
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or MongoDB Atlas Cluster)
*   Supabase Account & Bucket Setup
*   Gemini API Key

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Raj0-0dev/neuralpath.git
cd neuralpath

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/neuralpath
JWT_SECRET=your_jwt_signing_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_BUCKET_NAME=resumes
```

---

## 🏃 Running the Application

### Start Backend Development Server
From the `backend/` folder:
```bash
npm run dev
```
*Note: The server will automatically initialize/seed database roles, admin credentials, and default video paths on the first startup if they do not exist.*

### Start Frontend Client
From the `frontend/` folder:
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

---

## 🔐 Default Credentials (Seeded)
*   **Role**: HR Administrator View
*   **Email**: `admin@neuralpath.com`
*   **Password**: `adminpassword`

---

## 📡 API Reference

### Authentication
*   `POST /api/auth/register` - Create user profile.
*   `POST /api/auth/login` - Authenticate credentials and return JWT token.
*   `GET /api/auth/me` - Retrieve current user profile.

### Resume & Assessment
*   `POST /api/resumes/upload` - Upload PDF resume, extract text, and run skill gap analyzer.
*   `GET /api/resumes/active` - Fetch current active resume path details.
*   `GET /api/gap-analysis/my-profile` - Retrieve current user's match details and gaps.
*   `GET /api/learning-path` - Fetch personalized learning pathway modules and progress.
*   `POST /api/learning-path/complete` - Mark a study module segment as completed.

### Administration
*   `GET /api/admin/employees` - List all trainees and their readiness scores.
*   `POST /api/admin/roles` - Create new target role competency profiles.
*   `POST /api/admin/resources` - Add video study assets mapped to specific skills.

---

## 👥 Contributors

*   **Harsh Rajput** ([Raj0-0dev](https://github.com/Raj0-0dev))
*   **Harshit Maurya**
*   **Himanshu Ranjan**

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
