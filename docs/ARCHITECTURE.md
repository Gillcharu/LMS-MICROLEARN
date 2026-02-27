# MicroLearn Architecture

## Components
1. Frontend UI (`frontend/`): React SPA for learners and creators.
2. Application Server (`backend/`): Express REST API.
3. Relational Database: SQLite through Sequelize models.
4. External Media Storage: cloud-hosted media URLs via storage abstraction.

## Core Domain Modules
- Authentication: JWT token issuance and middleware validation.
- Lessons + Quizzes: duration and question constraints enforced server-side.
- Learning Paths: path creation, sequencing, publishing, enrollment.
- Progress: status, score, time tracking per lesson.
- Gamification: points, streak calculations, badge unlocking.
- Social: comments, likes, follows, activity feed.
- Creator Tools: lesson/path drafting and publishing workflows.

## Security
- JWT bearer token required for protected endpoints.
- Role checks for creator/admin actions.
- Passwords hashed with bcrypt.

## Scalability Notes
- SQLite is used for local/development simplicity; can migrate to PostgreSQL/MySQL by changing Sequelize configuration.
- Cloud storage integration is abstracted with `mediaService` to support S3-compatible providers.
