# API Integration Guide

## Overview
Your React app is now connected to your backend Laravel API with bearer token authentication and profile management.

## Services Created

### `src/services/authApi.js`
Centralized authentication service with the following functions:

#### **login(email, password)**
Calls `POST /api/login` to authenticate user
- **Request**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email, ... } }`
- **Auto-stores**: Bearer token in localStorage
- **Usage**:
```javascript
import { login } from '../services/authApi';

try {
  const response = await login('user@example.com', 'password123');
  console.log('Logged in:', response.user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### **fetchProfile()**
Calls `GET /api/profile` to fetch authenticated user's profile
- **Headers**: `Authorization: Bearer {token}` (auto-added)
- **Response**: `{ user: { id, name, email, role, ... } }` or direct user object
- **Auto-caches**: Profile in localStorage for fallback
- **Usage**:
```javascript
import authApi from '../services/authApi';

try {
  const profile = await authApi.fetchProfile();
  console.log('User profile:', profile);
} catch (error) {
  console.error('Failed to fetch profile:', error.message);
}
```

#### **logout()**
Calls `POST /api/logout` (optional backend support) and clears local session
- **Auto-clears**: token, isAuthenticated, userId, profile from localStorage
- **Usage**:
```javascript
import { logout } from '../services/authApi';

await logout();
// User is now logged out
```

#### **updateProfile(profileData)**
Calls `PUT /api/profile` to update user profile (optional)
- **Request**: `{ name, email, ... }`
- **Response**: Updated user object
- **Usage**:
```javascript
await authApi.updateProfile({ name: 'New Name', email: 'newemail@example.com' });
```

#### **getAuthHeaders()**
Helper function that returns headers with bearer token
- **Returns**: `{ 'Content-Type': 'application/json', 'Authorization': 'Bearer {token}' }`
- **Usage**: For custom fetch calls
```javascript
import { getAuthHeaders } from '../services/authApi';

const headers = getAuthHeaders();
const response = await fetch('/api/custom-endpoint', {
  method: 'GET',
  headers,
});
```

## Components Updated

### `src/components/auth/Login.jsx`
- Now uses `authApi.login()` instead of hardcoded fetch
- Simplified error handling
- Cleaner code flow

### `src/components/ProfilePanel.jsx` (New)
Floating profile dropdown in top-right corner showing:
- User avatar (first letter of name)
- User name
- User email
- User role (if available)
- Refresh button to reload profile
- Logout button

**Features**:
- Auto-fetches profile on mount using `fetchProfile()`
- Graceful fallback to cached profile if API fails
- Click avatar to toggle dropdown
- Click logout to clear session and redirect to login

### `src/components/Topbar.jsx`
- Integrated ProfilePanel component
- Removed basic userId display

### `src/components/Sidebar.jsx`
- Updated logout to use `authApi.logout()`
- Now properly clears all session data including token

## API Endpoints Expected

Your backend should provide these endpoints:

### POST /api/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
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

---

### GET /api/profile
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```
or alternatively:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "student"
}
```

---

### POST /api/logout (Optional)
**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### PUT /api/profile (Optional)
**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "New Name",
    "email": "newemail@example.com"
  }
}
```

## Configuration

### Environment Variables
Set in `.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

If not set, defaults to: `http://127.0.0.1:8000/api`

## Token Storage

### localStorage Keys
- **token** - Bearer token for API requests
- **isAuthenticated** - Boolean flag ('true'/'false')
- **userId** - User ID from server
- **profile** - Cached user profile object

### Security Notes
- ✅ Token automatically cleared on logout
- ✅ Token cleared on back-navigation to prevent cached access
- ✅ Protected routes verify both token and isAuthenticated flag
- ✅ Bearer token auto-added to all authenticated API calls
- ⚠️ localStorage is accessible to XSS - only store non-sensitive data here
- 💡 Consider using httpOnly cookies for production (requires backend support)

## Error Handling

All API calls use consistent error handling:

```javascript
try {
  const profile = await authApi.fetchProfile();
} catch (error) {
  console.error('Status:', error.status);        // HTTP status code
  console.error('Message:', error.message);      // Error message
  console.error('Payload:', error.payload);      // Full API response
}
```

## Next Steps (Optional)

You mentioned these options - let me know which you'd like:

1. **Generate React axios/fetch service for these endpoints** - Already done! Use `authApi.js`
2. **Add API filters/search examples for React dashboard tables** - Would create searchable/filterable tables with API integration examples
3. **Add pagination/sorting docs** - Would add pagination and sorting to dashboard tables with backend support

Choose which feature you'd like next! 🚀
