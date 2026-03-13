/**
 * Authentication and Profile Service
 * Handles login, token management, and profile fetching from Laravel API
 * Falls back to demo mode for development
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost/morilla_backend/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === 'true';

// Mock user database for demo mode
const DEMO_USERS = {
  'admin@morilla.test': {
    id: 1,
    name: 'Admin User',
    email: 'admin@morilla.test',
    role: 'admin',
    password: 'password123',
  },
  'student@morilla.test': {
    id: 2,
    name: 'John Student',
    email: 'student@morilla.test',
    role: 'student',
    password: 'password123',
  },
  'teacher@morilla.test': {
    id: 3,
    name: 'Jane Teacher',
    email: 'teacher@morilla.test',
    role: 'teacher',
    password: 'password123',
  },
};

const deriveInitials = (value = 'User') => {
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'U';
  }

  return parts.map((part) => part[0].toUpperCase()).join('');
};

const normalizeProfile = (payload = {}) => {
  const rawUser = payload?.user || {};
  const rawProfile = payload?.profile || payload || {};

  const title =
    rawProfile?.sidebar_card?.title || rawProfile?.name || rawUser?.name || 'User';
  const subtitle =
    rawProfile?.sidebar_card?.subtitle || rawProfile?.email || rawUser?.email || '';

  return {
    ...rawProfile,
    name: rawProfile?.name || rawUser?.name || title,
    email: rawProfile?.email || rawUser?.email || subtitle,
    role: rawProfile?.role || rawUser?.role || '',
    sidebar_card: {
      ...(rawProfile?.sidebar_card || {}),
      title,
      subtitle,
    },
    avatar: {
      ...(rawProfile?.avatar || {}),
      initials: rawProfile?.avatar?.initials || deriveInitials(title),
      background_color: rawProfile?.avatar?.background_color || '#800000',
      text_color: rawProfile?.avatar?.text_color || '#FFFFFF',
    },
  };
};

const cacheProfile = (payload) => {
  const profile = normalizeProfile(payload);
  localStorage.setItem('profile', JSON.stringify(profile));
  return profile;
};

export const getStoredProfile = () => {
  const cached = localStorage.getItem('profile');
  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached);
  } catch {
    localStorage.removeItem('profile');
    return null;
  }
};

const generateMockToken = (email) => {
  // Generate a mock JWT-like token for demo purposes
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ email, iat: Date.now(), exp: Date.now() + 86400000 }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

/**
 * Get authorization headers with bearer token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(API_KEY && { 'X-API-KEY': API_KEY }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Parse API response and handle errors
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  
  let payload = null;
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const errorMessage = payload?.message || payload?.error || 'Request failed';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

/**
 * POST /api/login - Authenticate user and receive bearer token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, user: {id: number, name: string, email: string}}>}
 */
export const login = async (email, password) => {
  // Try real API first
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(API_KEY && { 'X-API-KEY': API_KEY }),
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseResponse(response);

    // Store token and user info
    if (data.token) {
      localStorage.setItem('token', data.token);
      const userId = data?.user?.id || data?.userId || email;
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('isAuthenticated', 'true');

      if (data?.profile || data?.user) {
        const normalizedProfile = cacheProfile(data);
        return {
          ...data,
          profile: normalizedProfile,
        };
      }
    }

    return data;
  } catch (error) {
    // If network error and demo mode enabled, use mock login
    if ((error.status === 0 || error.message.includes('Failed to fetch')) && USE_DEMO_MODE) {
      return demoLogin(email, password);
    }

    // If it's a network error, provide more helpful debugging info
    if (error.message === 'Failed to fetch' || error.status === 0) {
      const err = new Error(`Failed to connect to API at ${API_BASE_URL}/login. Make sure your backend is running.`);
      err.status = 0;
      err.payload = { message: 'Network error - backend not reachable' };
      throw err;
    }
    throw error;
  }
};

/**
 * Demo login for development mode
 */
const demoLogin = async (email, password) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = DEMO_USERS[email];

  if (!user) {
    const err = new Error(`User "${email}" not found in demo mode. Try one of: ${Object.keys(DEMO_USERS).join(', ')}`);
    err.status = 401;
    throw err;
  }

  if (user.password !== password) {
    const err = new Error(`Invalid password. Try: "${user.password}"`);
    err.status = 401;
    throw err;
  }

  // Successful demo login
  const token = generateMockToken(email);
  localStorage.setItem('token', token);
  localStorage.setItem('userId', String(user.id));
  localStorage.setItem('isAuthenticated', 'true');

  console.warn('⚠️ Using DEMO MODE - This is for development only!');

  const demoResponse = {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: {
        initials: deriveInitials(user.name),
        background_color: '#800000',
        text_color: '#FFFFFF',
      },
      sidebar_card: {
        title: user.name,
        subtitle: user.email,
      },
    },
  };

  cacheProfile(demoResponse);

  return demoResponse;
};

/**
 * GET /api/profile - Fetch authenticated user's profile
 * Requires valid bearer token in Authorization header
 * @returns {Promise<{id: number, name: string, email: string, role: string, ...}>}
 */
export const fetchProfile = async () => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const payload = await parseResponse(response);
    const normalizedProfile = cacheProfile(payload);
    return {
      ...payload,
      profile: normalizedProfile,
    };
  } catch (error) {
    // If network error and demo mode, return demo profile
    if ((error.status === 0 || error.message.includes('Failed to fetch')) && USE_DEMO_MODE && token) {
      return demoFetchProfile();
    }

    if (error.message === 'Failed to fetch') {
      const err = new Error(`Failed to connect to API at ${API_BASE_URL}/profile`);
      err.status = 0;
      throw err;
    }
    throw error;
  }
};

/**
 * Demo profile fetch for development mode
 */
const demoFetchProfile = () => {
  const userId = localStorage.getItem('userId');
  const allUsers = Object.values(DEMO_USERS);
  const user = allUsers.find((u) => u.id === parseInt(userId));

  if (!user) {
    throw new Error('Demo user not found');
  }

  const response = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: {
        initials: deriveInitials(user.name),
        background_color: '#800000',
        text_color: '#FFFFFF',
      },
      sidebar_card: {
        title: user.name,
        subtitle: user.email,
      },
    },
  };

  cacheProfile(response);
  return response;
};

/**
 * POST /api/logout - Invalidate token on server (optional, if backend supports it)
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.warn('Logout API call failed, but clearing local storage anyway');
    }
  } catch (error) {
    console.warn('Logout API error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('profile');
  }
};

/**
 * Update profile data (optional endpoint)
 * PUT /api/profile
 */
export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const payload = await parseResponse(response);
  const normalizedProfile = cacheProfile(payload);

  return {
    ...payload,
    profile: normalizedProfile,
  };
};

export default {
  login,
  fetchProfile,
  logout,
  updateProfile,
  getAuthHeaders,
};
