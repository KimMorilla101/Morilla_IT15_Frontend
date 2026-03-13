# API Integration Guide

## Overview
This document describes the backend API contract expected by the current frontend.

Base URL is read from environment variable `VITE_API_BASE_URL`.
If not set, frontend defaults to:

`https://localhost/morilla_backend/api`

## Common Headers

- `Accept: application/json`
- `Content-Type: application/json` for POST/PATCH/PUT
- `Authorization: Bearer <token>` for protected endpoints
- Optional: `X-API-KEY: <key>` when `VITE_API_KEY` is configured

## Response Shape Compatibility

Frontend accepts flexible response shapes.

Collection responses can be any of:

- An array directly
- Object containing `data`, `items`, `results`, `programs`, `students`, `courses`, or `enrollments` arrays
- Nested array at `data.data` or `data.items`

Single-entity responses can be any of:

- Entity object directly
- Object containing `data`
- Object containing typed key such as `student`, `course`, `enrollment`

Pagination metadata is read from `meta` or root object fields:

- `current_page` or `currentPage`
- `last_page` or `lastPage`
- `per_page` or `perPage`
- `total`

## Authentication Endpoints

### POST /login

Request body:

```json
{
  "email": "admin@morilla.test",
  "password": "password123"
}
```

Expected success response:

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@morilla.test",
    "role": "admin"
  },
  "profile": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@morilla.test"
  }
}
```

Minimum required by frontend: `token` and user identity (`user.id` preferred).

### GET /profile

Expected success response can be either:

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@morilla.test",
    "role": "admin"
  }
}
```

or direct profile object:

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@morilla.test",
  "role": "admin"
}
```

### PUT /profile

Request body:

```json
{
  "name": "New Name",
  "email": "new@example.com"
}
```

Expected success response: updated profile/user object in any compatible shape.

### POST /logout

Optional backend endpoint.
Any successful JSON response is accepted.

## Dashboard Endpoint

### GET /dashboard

Expected success response (root or `data`):

```json
{
  "overview": {
    "students_enrolled": 1200,
    "courses_offered": 58,
    "school_days_total": 124,
    "average_attendance": 91.2
  },
  "monthlyEnrollment": [
    { "month": "Aug", "enrollments": 230 }
  ],
  "courseDistribution": [
    { "name": "Computer Science", "value": 320 }
  ],
  "recent_calendar": [
    { "id": 1, "title": "Midterm Exam", "date": "2026-03-15", "type": "event" }
  ]
}
```

Alternative keys also supported by frontend:

- `courses_by_department`
- `students_by_department`
- `enrollmentTrends`
- `recentActivities`
- `calendar`

## Students Endpoints

### GET /students

Query params supported by frontend:

- `search`
- `department`
- `year_level`
- `course_id`
- `page`
- `per_page`

Expected response: students collection + optional pagination metadata.

### GET /students/{id}

Expected response: student object (direct or wrapped).

### POST /students

Frontend payload (typical):

```json
{
  "student_number": "2026-0001",
  "student_id": "2026-0001",
  "id_number": "2026-0001",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "full_name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "department": "Computer Science",
  "year_level": 1,
  "status": "active",
  "gender": "male",
  "sex": "male",
  "date_of_birth": "2000-01-01",
  "phone_number": "09123456789",
  "address": "Tagum City",
  "course_ids": [1, 2]
}
```

Compatibility aliases may also be present:

- `studentNumber`
- `yearLevel`
- `dateOfBirth`

Expected response: created student object.

### PATCH /students/{id}

Expected response: updated student object.

### DELETE /students/{id}

Expected response: any success JSON payload.

## Courses Endpoints

### GET /courses

Query params supported by frontend:

- `search`
- `department`
- `semester`
- `active`
- `page`
- `per_page`

Expected response: courses collection + optional pagination metadata.

### GET /courses/{id}

Expected response: course object (direct or wrapped).

### POST /courses

Frontend payload (typical):

```json
{
  "course_code": "CS101",
  "code": "CS101",
  "title": "Intro to Programming",
  "name": "Intro to Programming",
  "department": "Computer Science",
  "semester": "1st Semester",
  "credits": 3,
  "units": 3,
  "capacity": 40,
  "max_students": 40,
  "maxStudents": 40,
  "instructor": "Prof. Juan Dela Cruz",
  "status": "active",
  "active": true,
  "is_active": 1,
  "isActive": true,
  "description": "Course overview"
}
```

Expected response: created course object.

### PATCH /courses/{id}

Payload and response shape follow POST /courses.

### Semester validation compatibility

Frontend retries course requests with alternate semester formats if backend returns an invalid semester error.
Examples retried include:

- `1st Semester`, `First Semester`, `first_semester`, `1`
- `2nd Semester`, `Second Semester`, `second_semester`, `2`
- `Summer`, `summer_term`, `3`

## Program Endpoints (Frontend Alias)

Frontend program APIs are mapped to courses:

- `fetchPrograms` -> GET `/courses`
- `fetchProgram` -> GET `/courses/{id}`
- `createProgram` -> POST `/courses`
- `updateProgram` -> PATCH `/courses/{id}`

## Enrollment Endpoints

Primary paths used by frontend:

1. `/enrollments`
2. Fallback to `/student-enrollments` when status is 404 or 405

### GET /enrollments

Query params:

- `search`
- `status`
- `semester`
- `student_id`
- `course_id`
- `page`
- `per_page`

Expected response: enrollments collection + optional pagination metadata.

### POST /enrollments

Request body:

```json
{
  "student_id": 1,
  "course_id": 10,
  "semester": "1st Semester",
  "status": "enrolled",
  "enrollment_date": "2026-03-13"
}
```

Compatibility aliases may also be present:

- `studentId`
- `courseId`
- `enrollmentDate`

Expected response: enrollment object (direct or wrapped in `enrollment`).

### PATCH /enrollments/{id}

Request body uses the same base fields as POST and can include:

- `previous_student_id`
- `previous_course_id`

Expected response: enrollment object (direct or wrapped).

### Enrollment fallback behavior

If both enrollment endpoints are unavailable (404/405), frontend falls back by editing student course assignments via:

- GET `/students/{id}`
- PATCH `/students/{id}` with `course_ids`

## Error Response Format

Frontend expects one of these top-level fields for message display:

- `message`
- `error`

Validation details are read from `errors` object when present.

Typical Laravel validation response:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

## Environment Variables

```env
VITE_API_BASE_URL=https://localhost/morilla_backend/api
VITE_API_KEY=
VITE_USE_DEMO_MODE=false
VITE_USE_REMOTE_DASHBOARD=true
```
