# Student Management System — Phase 1

A web-based student management system built with **Spring Boot** (backend) and **React** (frontend).

## Phase 1 includes
- JWT authentication with roles: ADMIN, TEACHER, ACCOUNTANT, STUDENT
- Students, Teachers, and Classes — full CRUD
- Dashboard with live stat counts
- Clean, modern UI (sidebar layout, card-based dashboard, data tables)

## Requirements
- Java 17+
- Maven
- MySQL running locally
- Node.js 18+ and npm

## Backend setup
1. Create a MySQL database (or let it auto-create — see `application.properties`, `createDatabaseIfNotExist=true`).
2. Edit `backend/src/main/resources/application.properties`:
   - Set your MySQL `username`/`password`.
   - **Replace `app.jwt.secret` with your own long, random string** before running anywhere beyond your own machine.
3. From the `backend/` folder:
   ```bash
   mvn spring-boot:run
   ```
4. On first run, a default admin account is created automatically:
   - Email: `admin@school.com`
   - Password: `admin123`
   - **Change this password immediately in any real deployment** (there's no "change password" endpoint yet in Phase 1 — update it directly in the database or add that endpoint before going live).

Backend runs on `http://localhost:8080`.

## Frontend setup
From the `frontend/` folder:
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Notes
- This is Phase 1 of a multi-phase build. Attendance, Exams, Fees, Reporting/Charts, and Notifications are planned for later phases and are **not** included yet.
- No password-reset flow yet — add one before real-world use.
- CORS is currently configured for `http://localhost:5173` only — update `SecurityConfig.java` if you deploy the frontend elsewhere.
