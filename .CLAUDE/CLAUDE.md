# Lab Management System (한신대 DB 기말과제)

## Tech Stack
- Frontend: React (Vite), Material-UI (MUI), Axios, React Router DOM
- Backend: Python (FastAPI), SQLAlchemy, Pydantic, MySQL
- Database: MySQL (Localhost:3306, DB: `lab_system`)

## Build & Run Commands
### Frontend
- Install: `npm install`
- Run Dev Server: `npm run dev` (Runs on http://localhost:5173)

### Backend
- Install: `pip install -r requirements.txt` (FastAPI, SQLAlchemy, pymysql, cryptography, passlib, python-jose, python-dotenv)
- Run Server: `uvicorn main:app --reload` (Runs on http://localhost:8000)

## Code Style & Architecture Guidelines
- **Frontend Design:** Keep the consistent Purple/Indigo gradient tone. Use MUI `Paper` with smooth borders and subtle shadows (`boxShadow: '0 4px 20px rgba(0,0,0,0.02)'`) for containers. Keep maxWidth to `1200px` for main views.
- **Backend Auth:** Always enforce server-side validation via `get_current_user` dependency rather than trusting client-side user IDs.
- **API Formats:** - User Login uses Form Data (`application/x-www-form-urlencoded`).
  - All other POST/PUT requests use standard JSON payloads.
  - Authenticated requests must include `Authorization: Bearer <token>` header.

## Current Status
- UI components for Layout, Login/Signup, Dashboard, Schedule, MyLab, and Finance are fully crafted.
- Backend APIs for User, Lab, App, Schedule, Fee, and Finance are ready and fully implemented with CORS configured for localhost:5173.
- Next Objective: Connect Frontend forms and grids to Backend REST APIs using Axios and handle JWT authentication state globally.

@@ 이해가 안되는 부분이 있으면 반드시 질문하고 진행할 것. @@