const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export class SchoolApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'SchoolApiError';
    this.status = status;
    this.details = details;
  }
}

const toQueryString = (query = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const text = searchParams.toString();
  return text ? `?${text}` : '';
};

const getHeaders = (includeJson = true) => {
  const token = localStorage.getItem('token');

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    Accept: 'application/json',
    ...(API_KEY && { 'X-API-KEY': API_KEY }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' ? payload : null) ||
      'Request failed. Please try again.';

    throw new SchoolApiError(message, response.status, payload?.errors || payload);
  }

  return payload;
};

const request = async (path, { method = 'GET', query, body } = {}) => {
  const url = `${API_BASE_URL}${path}${toQueryString(query)}`;
  const response = await fetch(url, {
    method,
    headers: getHeaders(Boolean(body) || method !== 'GET'),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return parseResponse(response);
};

const mapPagination = (payload) => ({
  currentPage: Number(payload?.current_page || 1),
  lastPage: Number(payload?.last_page || 1),
  perPage: Number(payload?.per_page || 15),
  total: Number(payload?.total || 0),
});

export const fetchStudents = async ({
  search,
  department,
  yearLevel,
  courseId,
  page = 1,
  perPage = 15,
} = {}) => {
  const payload = await request('/students', {
    query: {
      search,
      department,
      year_level: yearLevel,
      course_id: courseId,
      page,
      per_page: perPage,
    },
  });

  return {
    items: payload?.data || [],
    pagination: mapPagination(payload),
  };
};

export const fetchStudent = async (studentId) => {
  const payload = await request(`/students/${studentId}`);
  return payload?.student || null;
};

export const createStudent = async (studentPayload) => {
  const payload = await request('/students', {
    method: 'POST',
    body: studentPayload,
  });

  return payload?.student || null;
};

export const updateStudent = async (studentId, studentPayload, method = 'PATCH') => {
  const payload = await request(`/students/${studentId}`, {
    method,
    body: studentPayload,
  });

  return payload?.student || null;
};

export const fetchCourses = async ({
  search,
  department,
  semester,
  active,
  page = 1,
  perPage = 15,
} = {}) => {
  const payload = await request('/courses', {
    query: {
      search,
      department,
      semester,
      active,
      page,
      per_page: perPage,
    },
  });

  return {
    items: payload?.data || [],
    pagination: mapPagination(payload),
  };
};

export const fetchCourse = async (courseId) => {
  const payload = await request(`/courses/${courseId}`);
  return payload?.course || null;
};

export const createCourse = async (coursePayload) => {
  const payload = await request('/courses', {
    method: 'POST',
    body: coursePayload,
  });

  return payload?.course || null;
};

export const updateCourse = async (courseId, coursePayload, method = 'PATCH') => {
  const payload = await request(`/courses/${courseId}`, {
    method,
    body: coursePayload,
  });

  return payload?.course || null;
};

export const addEnrollment = async ({ studentId, courseId }) => {
  const student = await fetchStudent(studentId);
  const existingCourseIds = (student?.courses || []).map((course) => Number(course.id));
  const nextCourseIds = Array.from(new Set([...existingCourseIds, Number(courseId)]));

  return updateStudent(studentId, { course_ids: nextCourseIds }, 'PATCH');
};

export const updateEnrollmentCourse = async ({ studentId, oldCourseId, newCourseId }) => {
  const student = await fetchStudent(studentId);
  const existingCourseIds = (student?.courses || []).map((course) => Number(course.id));

  const replaced = existingCourseIds.map((courseId) =>
    Number(courseId) === Number(oldCourseId) ? Number(newCourseId) : Number(courseId),
  );

  const nextCourseIds = Array.from(new Set(replaced));

  return updateStudent(studentId, { course_ids: nextCourseIds }, 'PATCH');
};

export const removeEnrollment = async ({ studentId, courseId }) => {
  const student = await fetchStudent(studentId);
  const existingCourseIds = (student?.courses || []).map((course) => Number(course.id));

  const nextCourseIds = existingCourseIds.filter((id) => Number(id) !== Number(courseId));

  return updateStudent(studentId, { course_ids: nextCourseIds }, 'PATCH');
};
