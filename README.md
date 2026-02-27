# MicroLearn LMS

MicroLearn is a standalone web-based LMS built on a microlearning model.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (relational via Sequelize ORM)
- Auth: JWT
- External media: cloud URL abstraction (`MEDIA_BASE_URL`)
- License/tooling: free/open-source

## Features Implemented
- User authentication and role-based access (`learner`, `creator`, `parent`, `admin`)
- Micro-lesson delivery with enforced constraints:
  - Duration: 5-15 minutes
  - Quiz questions: 3-5
- Quiz-based assessment with pass/fail logic and score persistence
- Custom learning path creation and enrollment
- Progress tracking (completion %, score, time spent)
- Gamification (points, streaks, badges)
- Social interactions (likes, comments, follow, feed)
- Study groups (create group, join group, post updates with optional images)
- Parent tracking (link parent-child accounts and monitor child progress)
- AI tutor hints and recommendation API
- Certificates for completed lessons
- Live classes / office-hour scheduling and learner enrollment
- Assignment workspace with submission + grading
- Parent alert preferences and digest preview
- Creator monetization marketplace (simulation)
- Creator and admin analytics endpoints
- Admin control center (flags + moderation actions)
- Integrations hub (Google Calendar, Zoom, Slack/Discord, S3, Stripe connections)
- Creator tools for lesson/path management
- On-screen instructions, tooltips, FAQs, and first-time tutorial
- User documentation in markdown and PDF (`docs/USER_GUIDE.pdf`)

## Project Structure
- `backend/` Express API server
- `frontend/` React web app
- `docs/` user documentation and FAQ

## Setup
1. Install dependencies:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```
2. Configure env files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
3. Seed sample data:
```bash
npm run seed
```
Optional DB operations:
```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:backup
npm --prefix backend run db:restore -- backend/backups/<backup-file>.sqlite
```
4. Start backend:
```bash
npm run dev:backend
```
5. Start frontend:
```bash
npm run dev:frontend
```

## Seed Accounts
- Creator: `creator@microlearn.app` / `password123`
- Learner: `learner@microlearn.app` / `password123`
- Parent: `parent@microlearn.app` / `password123`
- Admin: `admin@microlearn.app` / `password123`

## Key API Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Lessons: `/api/lessons`
- Progress/quiz: `/api/progress/lessons/:lessonId`, `/api/progress/lessons/:lessonId/quiz`
- Paths: `/api/paths`, `/api/paths/:pathId/enroll`
- Social: `/api/social/feed`, `/api/lessons/:lessonId/comments`
- Groups: `/api/groups`, `/api/groups/:groupId/join`, `/api/groups/:groupId/posts`
- Parent tracking: `/api/parents/link`, `/api/parents/children`, `/api/parents/children/:childId/progress`
- Dashboard: `/api/dashboard`
- Creator: `/api/creator/summary`

## Architecture Notes
MicroLearn follows a client-server model:
- Frontend renders learner/creator experiences.
- Backend handles auth, business rules, and persistence.
- Relational DB stores users, lessons, quizzes, paths, progress, and social entities.
- External media service is abstracted via URL provider for cloud integration.
