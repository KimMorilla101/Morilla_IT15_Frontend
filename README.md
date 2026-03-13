# Morilla IT15 Frontend

React + Vite frontend for enrollment, student, course, subject, and dashboard management.

## Frontend Setup
1. Navigate to the frontend folder

```bash
cd Morilla_IT15_Frontend-main
```

2. Install dependencies

```bash
npm install
```
This will install all required packages for the React project.

3. Start the development server

```bash
npm run dev
```

4. Open the application

After running the command, the development server will start.

Open your browser and go to:

http://localhost:5173

Notes

Make sure the Laravel backend server is running before starting the frontend.

The frontend communicates with the Laravel API for login, students, and enrollment data.

## Environment Variables

Create or update `.env` with:

```env
VITE_API_BASE_URL=https://localhost/morilla_backend/api
VITE_USE_REMOTE_DASHBOARD=true
VITE_USE_DEMO_MODE=false
VITE_API_KEY=
```

## API Documentation

### Base URL

All API requests are sent to:

`https://localhost/morilla_backend/api`

### Common Headers

- `Accept: application/json`
- `Content-Type: application/json` (for POST/PATCH/PUT)
- `Authorization: Bearer <token>` (for protected endpoints)
- `X-API-KEY: <key>` (optional if backend requires it)

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Authenticate and return token + user |
| GET | `/profile` | Get authenticated user profile |
| PUT | `/profile` | Update authenticated user profile |
| POST | `/logout` | Invalidate session/token (if backend supports it) |

Login request example:

```json
{
	"email": "admin@morilla.test",
	"password": "password123"
}
```

Login response example:

```json
{
	"token": "eyJhbGciOiJIUzI1NiIs...",
	"user": {
		"id": 1,
		"name": "John Doe",
		"email": "user@example.com",
		"role": "student"
	}
}
```

### Dashboard Endpoint

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Fetch dashboard analytics and summary cards |

Notes:
- Requires a valid bearer token.
- When `VITE_USE_REMOTE_DASHBOARD=false`, frontend uses local mock dashboard data.

### Students Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | List students with filters and pagination |
| GET | `/students/{id}` | Get a single student |
| POST | `/students` | Create student |
| PATCH | `/students/{id}` | Update student |
| DELETE | `/students/{id}` | Delete student |

Supported query params for `GET /students`:
- `search`
- `department`
- `year_level`
- `course_id`
- `page`
- `per_page`

### Courses Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses` | List courses |
| GET | `/courses/{id}` | Get a single course |
| POST | `/courses` | Create course |
| PATCH | `/courses/{id}` | Update course |

Supported query params for `GET /courses`:
- `search`
- `department`
- `semester`
- `active`
- `page`
- `per_page`

Compatibility note:
- The frontend still has some `program`-named functions/routes, but these map to `/courses` in the service layer.

### Subjects Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/subjects` | List subjects |
| GET | `/subjects/{id}` | Get a single subject |
| POST | `/subjects` | Create subject |
| PATCH | `/subjects/{id}` | Update subject |

Fallback behavior:
- If `/subjects` is unavailable (404/405), frontend falls back to `/courses` for subject operations.

### Enrollments Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/enrollments` | List enrollments |
| POST | `/enrollments` | Create enrollment |
| PATCH | `/enrollments/{id}` | Update enrollment |

Fallback behavior:
- If `/enrollments` is unavailable (404/405), frontend tries `/student-enrollments`.
- As a final fallback, enrollment changes are applied through student `course_ids` updates.

Supported query params for `GET /enrollments`:
- `search`
- `status`
- `semester`
- `student_id`
- `course_id`
- `page`
- `per_page`

### Error Response Format

Typical validation error shape from Laravel:

```json
{
	"message": "The given data was invalid.",
	"errors": {
		"email": ["The email field is required."],
		"password": ["The password field is required."]
	}
}
```

### Demo Mode (Optional)

Set this in `.env`:

```env
VITE_USE_DEMO_MODE=true
```

Demo users are defined in `src/services/authApi.js`.
Current behavior: demo login fallback is used when API is unreachable/network fails.
