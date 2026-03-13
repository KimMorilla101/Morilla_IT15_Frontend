const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost/morilla_backend/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

const FALLBACK_STATUSES = new Set([404, 405]);
const MAX_ENROLLMENT_FALLBACK_PAGES = 20;

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

const toNumericId = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toIsoDate = (value) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
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

const requestWithFallback = async (paths, options = {}) => {
  let lastError = null;

  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (error) {
      lastError = error;

      if (!FALLBACK_STATUSES.has(error?.status)) {
        throw error;
      }
    }
  }

  throw lastError || new SchoolApiError('Request failed. Please try again.');
};

const extractCollection = (payload, preferredKeys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const keys = [
    ...preferredKeys,
    'data',
    'items',
    'results',
    'programs',
    'subjects',
    'enrollments',
    'students',
    'courses',
  ];

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  return [];
};

const extractEntity = (payload, preferredKeys = []) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  for (const key of preferredKeys) {
    const candidate = payload[key];
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload;
};

const mapPagination = (payload, fallbackPerPage = 15, fallbackTotal = 0) => {
  const source = payload?.meta || payload || {};
  const perPage = Number(source?.per_page || source?.perPage || fallbackPerPage || 15);
  const total = Number(source?.total || fallbackTotal || 0);

  return {
    currentPage: Number(source?.current_page || source?.currentPage || 1),
    lastPage: Number(source?.last_page || source?.lastPage || Math.max(1, Math.ceil(total / perPage))),
    perPage,
    total,
  };
};

const paginateItems = (items, page = 1, perPage = 15) => {
  const safePerPage = Math.max(1, Number(perPage) || 15);
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / safePerPage));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage);
  const start = (currentPage - 1) * safePerPage;

  return {
    items: items.slice(start, start + safePerPage),
    pagination: {
      currentPage,
      lastPage,
      perPage: safePerPage,
      total,
    },
  };
};

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

  const items = extractCollection(payload, ['students']);

  return {
    items,
    pagination: mapPagination(payload, perPage, items.length),
  };
};

export const fetchStudent = async (studentId) => {
  const payload = await request(`/students/${studentId}`);
  return extractEntity(payload, ['student']);
};

export const createStudent = async (studentPayload) => {
  const payload = await request('/students', {
    method: 'POST',
    body: studentPayload,
  });

  return extractEntity(payload, ['student']);
};

export const updateStudent = async (studentId, studentPayload, method = 'PATCH') => {
  const payload = await request(`/students/${studentId}`, {
    method,
    body: studentPayload,
  });

  return extractEntity(payload, ['student']);
};

export const deleteStudent = async (studentId) => {
  const payload = await request(`/students/${studentId}`, {
    method: 'DELETE',
  });

  return payload;
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

  const items = extractCollection(payload, ['courses']);

  return {
    items,
    pagination: mapPagination(payload, perPage, items.length),
  };
};

export const fetchCourse = async (courseId) => {
  const payload = await request(`/courses/${courseId}`);
  return extractEntity(payload, ['course']);
};

export const createCourse = async (coursePayload) => {
  const payload = await request('/courses', {
    method: 'POST',
    body: coursePayload,
  });

  return extractEntity(payload, ['course']);
};

export const updateCourse = async (courseId, coursePayload, method = 'PATCH') => {
  const payload = await request(`/courses/${courseId}`, {
    method,
    body: coursePayload,
  });

  return extractEntity(payload, ['course']);
};

const SUBJECT_PATHS = ['/subjects', '/courses'];
const ENROLLMENT_PATHS = ['/enrollments', '/student-enrollments'];

const mapProgramPayloadToCoursePayload = (programPayload = {}) => {
  const code = String(programPayload?.code || programPayload?.course_code || '').trim();
  const title = String(
    programPayload?.title || programPayload?.name || programPayload?.program_name || '',
  ).trim();
  const credits = Number(
    programPayload?.credits ??
      programPayload?.units ??
      programPayload?.total_units ??
      programPayload?.totalUnits ??
      0,
  );
  const status = String(programPayload?.status || '').trim().toLowerCase();
  const active =
    typeof programPayload?.active === 'boolean'
      ? programPayload.active
      : status
      ? status !== 'inactive'
      : undefined;

  return {
    ...programPayload,
    course_code: code || undefined,
    code: code || undefined,
    title: title || undefined,
    name: title || undefined,
    credits,
    units: credits,
    active,
  };
};

export const fetchPrograms = async ({
  search,
  department,
  status,
  semester,
  active,
  page = 1,
  perPage = 15,
} = {}) => {
  const activeFilter =
    active !== undefined
      ? active
      : status
      ? String(status).trim().toLowerCase() !== 'inactive'
      : undefined;

  return fetchCourses({
    search,
    department,
    semester,
    active: activeFilter,
    page,
    perPage,
  });
};

export const fetchProgram = async (programId) => {
  return fetchCourse(programId);
};

export const createProgram = async (programPayload) => {
  return createCourse(mapProgramPayloadToCoursePayload(programPayload));
};

export const updateProgram = async (programId, programPayload, method = 'PATCH') => {
  return updateCourse(programId, mapProgramPayloadToCoursePayload(programPayload), method);
};

export const fetchSubjects = async ({
  search,
  department,
  semester,
  status,
  page = 1,
  perPage = 15,
} = {}) => {
  const payload = await requestWithFallback(SUBJECT_PATHS, {
    query: {
      search,
      department,
      semester,
      status,
      page,
      per_page: perPage,
    },
  });

  const items = extractCollection(payload, ['subjects', 'courses']);

  return {
    items,
    pagination: mapPagination(payload, perPage, items.length),
  };
};

export const fetchSubject = async (subjectId) => {
  const payload = await requestWithFallback(SUBJECT_PATHS.map((path) => `${path}/${subjectId}`));
  return extractEntity(payload, ['subject', 'course']);
};

export const createSubject = async (subjectPayload) => {
  const payload = await requestWithFallback(SUBJECT_PATHS, {
    method: 'POST',
    body: subjectPayload,
  });

  return extractEntity(payload, ['subject', 'course']);
};

export const updateSubject = async (subjectId, subjectPayload, method = 'PATCH') => {
  const payload = await requestWithFallback(SUBJECT_PATHS.map((path) => `${path}/${subjectId}`), {
    method,
    body: subjectPayload,
  });

  return extractEntity(payload, ['subject', 'course']);
};

const fetchAllStudentsForEnrollmentFallback = async () => {
  let page = 1;
  let lastPage = 1;
  const items = [];

  while (page <= lastPage && page <= MAX_ENROLLMENT_FALLBACK_PAGES) {
    const response = await fetchStudents({ page, perPage: 100 });
    items.push(...response.items);
    lastPage = response.pagination.lastPage || 1;
    page += 1;
  }

  return items;
};

const buildEnrollmentFallbackRows = async () => {
  const students = await fetchAllStudentsForEnrollmentFallback();

  return students.flatMap((student) => {
    const studentId = toNumericId(student?.id);
    const studentNumber =
      student?.student_number || student?.student_id || student?.id_number || `STU-${studentId ?? 'N/A'}`;
    const studentName =
      student?.full_name ||
      [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() ||
      'Unnamed Student';

    const courses = Array.isArray(student?.courses) ? student.courses : [];

    return courses.map((course) => ({
      id: `${studentId}-${course?.id}`,
      student_id: studentId,
      student_number: studentNumber,
      student_name: studentName,
      course_id: toNumericId(course?.id),
      course_code: course?.code || course?.course_code || 'N/A',
      course_name: course?.title || course?.name || 'Untitled Course',
      credits: Number(course?.credits || course?.units || 0),
      semester: course?.semester || 'N/A',
      status: student?.status || 'enrolled',
      enrollment_date: toIsoDate(
        course?.pivot?.created_at || course?.pivot?.createdAt || student?.updated_at || student?.created_at,
      ),
    }));
  });
};

const filterEnrollmentFallbackRows = (
  rows,
  { search, status, semester, studentId, courseId } = {},
) => {
  const query = String(search || '').trim().toLowerCase();
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const normalizedSemester = String(semester || '').trim().toLowerCase();
  const numericStudentId = toNumericId(studentId);
  const numericCourseId = toNumericId(courseId);

  return rows.filter((row) => {
    if (query) {
      const haystack = [
        row.student_number,
        row.student_name,
        row.course_code,
        row.course_name,
        row.semester,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (normalizedStatus && String(row.status || '').toLowerCase() !== normalizedStatus) {
      return false;
    }

    if (normalizedSemester && String(row.semester || '').toLowerCase() !== normalizedSemester) {
      return false;
    }

    if (numericStudentId && toNumericId(row.student_id) !== numericStudentId) {
      return false;
    }

    if (numericCourseId && toNumericId(row.course_id) !== numericCourseId) {
      return false;
    }

    return true;
  });
};

export const fetchEnrollments = async ({
  search,
  status,
  semester,
  studentId,
  courseId,
  page = 1,
  perPage = 15,
} = {}) => {
  try {
    const payload = await requestWithFallback(ENROLLMENT_PATHS, {
      query: {
        search,
        status,
        semester,
        student_id: studentId,
        course_id: courseId,
        page,
        per_page: perPage,
      },
    });

    const items = extractCollection(payload, ['enrollments']);

    return {
      items,
      pagination: mapPagination(payload, perPage, items.length),
    };
  } catch (error) {
    if (!FALLBACK_STATUSES.has(error?.status)) {
      throw error;
    }

    const fallbackRows = await buildEnrollmentFallbackRows();
    const filteredRows = filterEnrollmentFallbackRows(fallbackRows, {
      search,
      status,
      semester,
      studentId,
      courseId,
    });

    return paginateItems(filteredRows, page, perPage);
  }
};

export const createEnrollmentRecord = async (enrollmentPayload) => {
  try {
    const payload = await requestWithFallback(ENROLLMENT_PATHS, {
      method: 'POST',
      body: enrollmentPayload,
    });

    return extractEntity(payload, ['enrollment']) || enrollmentPayload;
  } catch (error) {
    if (!FALLBACK_STATUSES.has(error?.status)) {
      throw error;
    }

    const studentId = toNumericId(enrollmentPayload?.student_id ?? enrollmentPayload?.studentId);
    const courseId = toNumericId(enrollmentPayload?.course_id ?? enrollmentPayload?.courseId);

    if (!studentId || !courseId) {
      throw error;
    }

    await addEnrollment({ studentId, courseId });

    return {
      id: `${studentId}-${courseId}`,
      ...enrollmentPayload,
    };
  }
};

export const updateEnrollmentRecord = async (
  enrollmentId,
  enrollmentPayload,
  method = 'PATCH',
) => {
  try {
    const payload = await requestWithFallback(ENROLLMENT_PATHS.map((path) => `${path}/${enrollmentId}`), {
      method,
      body: enrollmentPayload,
    });

    return extractEntity(payload, ['enrollment']) || enrollmentPayload;
  } catch (error) {
    if (!FALLBACK_STATUSES.has(error?.status)) {
      throw error;
    }

    const previousStudentId =
      toNumericId(enrollmentPayload?.previous_student_id ?? enrollmentPayload?.previousStudentId) ||
      toNumericId(enrollmentPayload?.student_id ?? enrollmentPayload?.studentId);
    const previousCourseId =
      toNumericId(enrollmentPayload?.previous_course_id ?? enrollmentPayload?.previousCourseId) ||
      toNumericId(enrollmentPayload?.course_id ?? enrollmentPayload?.courseId);
    const nextStudentId =
      toNumericId(enrollmentPayload?.student_id ?? enrollmentPayload?.studentId) ||
      previousStudentId;
    const nextCourseId =
      toNumericId(enrollmentPayload?.course_id ?? enrollmentPayload?.courseId) ||
      previousCourseId;
    const nextStatus = String(enrollmentPayload?.status || '').toLowerCase();

    if (!previousStudentId || !previousCourseId) {
      throw error;
    }

    if (nextStatus === 'dropped' || nextStatus === 'inactive') {
      await removeEnrollment({ studentId: previousStudentId, courseId: previousCourseId });
      return {
        id: enrollmentId,
        ...enrollmentPayload,
      };
    }

    if (nextStudentId !== previousStudentId) {
      await removeEnrollment({ studentId: previousStudentId, courseId: previousCourseId });
      await addEnrollment({ studentId: nextStudentId, courseId: nextCourseId });
      return {
        id: enrollmentId,
        ...enrollmentPayload,
      };
    }

    if (nextCourseId !== previousCourseId) {
      await updateEnrollmentCourse({
        studentId: previousStudentId,
        oldCourseId: previousCourseId,
        newCourseId: nextCourseId,
      });
    }

    return {
      id: enrollmentId,
      ...enrollmentPayload,
    };
  }
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
