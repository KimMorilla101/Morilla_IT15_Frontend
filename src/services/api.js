import {
  coursesData,
  dashboardStats,
  enrollmentData,
  schoolDaysData,
  studentsData,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost/morilla_backend/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const DASHBOARD_TIMEOUT_MS = 12000;
const REMOTE_DASHBOARD_ENABLED = import.meta.env.VITE_USE_REMOTE_DASHBOARD !== 'false';
const CHART_COLORS = ['#800000', '#9d1d1d', '#b53d3d', '#cf5f5f', '#d97d7d', '#e6a4a4'];

export class ApiError extends Error {
  constructor(message, status = 500, code = 'api_error') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async (promise, timeoutMs) => {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new ApiError('Request timed out. Please try again.', 408, 'timeout'));
    }, timeoutMs);

    promise.finally(() => clearTimeout(timeoutId));
  });

  return Promise.race([promise, timeoutPromise]);
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  let payload = null;
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const responseMessage =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' ? payload : null) ||
      'Request failed. Please try again.';

    if (response.status === 429) {
      throw new ApiError(
        'Too many requests to dashboard API. Please wait a moment before retrying.',
        429,
        'rate_limited',
      );
    }

    throw new ApiError(responseMessage, response.status, 'request_failed');
  }

  return payload;
};

const getAuthorizedHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Accept: 'application/json',
    ...(API_KEY && { 'X-API-KEY': API_KEY }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const formatRelativeDate = (value) => {
  if (!value) {
    return 'Recent';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const defaultMonthlyEnrollment = () =>
  dashboardStats.enrollmentTrends.map((item) => ({
    month: item.month,
    enrollments: item.enrollments,
  }));

const mapDepartmentDistribution = (items = []) =>
  items
    .map((item, index) => ({
      name: item?.label || item?.name || `Group ${index + 1}`,
      value: toNumber(item?.value, 0),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .filter((item) => item.value > 0);

const mapAttendanceFromRecentCalendar = (items = []) => {
  if (!items.length) {
    return [];
  }

  const grouped = items.reduce((accumulator, item) => {
    if (!item?.date) {
      return accumulator;
    }

    const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
    const rate = toNumber(item?.attendance_rate, NaN);

    if (Number.isNaN(rate)) {
      return accumulator;
    }

    const current = accumulator.get(day) || { sum: 0, count: 0 };
    accumulator.set(day, {
      sum: current.sum + rate,
      count: current.count + 1,
    });

    return accumulator;
  }, new Map());

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    .map((day) => {
      const item = grouped.get(day);
      if (!item) {
        return null;
      }

      return {
        day,
        attendanceRate: Math.round((item.sum / item.count) * 10) / 10,
      };
    })
    .filter(Boolean);
};

const mapRecentCalendarActivities = (items = []) =>
  items.slice(0, 8).map((item) => ({
    id: item?.id || `${item?.date || ''}-${item?.title || ''}`,
    type: item?.type || 'report',
    message: item?.title || 'Calendar event',
    time: formatRelativeDate(item?.date),
  }));

const normalizeOverview = (overview = {}) => {
  const studentsEnrolled = toNumber(
    overview?.students_enrolled ?? overview?.totalStudents ?? overview?.total_students,
    studentsData.length,
  );
  const coursesOffered = toNumber(
    overview?.courses_offered ?? overview?.totalCourses ?? overview?.total_courses,
    coursesData.length,
  );
  const schoolDays = toNumber(
    overview?.school_days_total ?? overview?.schoolDays ?? overview?.total_school_days,
    124,
  );
  const averageAttendance = toNumber(
    overview?.average_attendance ?? overview?.averageAttendance,
    0,
  );

  return {
    studentsEnrolled,
    coursesOffered,
    schoolDays,
    averageAttendance,
    // Backward compatible aliases for existing UI pieces
    totalStudents: studentsEnrolled,
    totalCourses: coursesOffered,
    activeEnrollments: studentsEnrolled,
    pendingApprovals: 0,
  };
};

const buildCourseDistribution = () => {
  const distribution = enrollmentData.reduce((accumulator, item) => {
    const courseCode = item.courseCode || 'N/A';
    const courseName = item.courseName || 'Unassigned Course';
    const previous = accumulator.get(courseCode) || { name: courseCode, fullName: courseName, value: 0 };

    accumulator.set(courseCode, {
      ...previous,
      value: previous.value + 1,
    });

    return accumulator;
  }, new Map());

  return Array.from(distribution.values())
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
};

const buildAttendancePattern = () => {
  const groupedAttendance = schoolDaysData.reduce((accumulator, item) => {
    const attendanceRate = toNumber(item.attendance_rate ?? item.attendanceRate, NaN);
    if (Number.isNaN(attendanceRate) || !item?.date) {
      return accumulator;
    }

    const weekday = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
    const previous = accumulator.get(weekday) || { sum: 0, count: 0 };

    accumulator.set(weekday, {
      sum: previous.sum + attendanceRate,
      count: previous.count + 1,
    });

    return accumulator;
  }, new Map());

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
    const value = groupedAttendance.get(day);
    const attendanceRate = value ? Math.round((value.sum / value.count) * 10) / 10 : 0;

    return {
      day,
      attendanceRate,
    };
  });
};

const buildOverview = () => {
  const studentsEnrolled = studentsData.length;
  const coursesOffered = coursesData.length;
  const schoolDays = schoolDaysData.filter((item) => item.type !== 'holiday').length;
  const attendanceSamples = schoolDaysData
    .map((item) => toNumber(item.attendance_rate ?? item.attendanceRate, NaN))
    .filter((value) => !Number.isNaN(value));
  const averageAttendance = attendanceSamples.length
    ? Math.round((attendanceSamples.reduce((sum, value) => sum + value, 0) / attendanceSamples.length) * 10) / 10
    : 0;
  const activeEnrollments = enrollmentData.filter((item) => item.status === 'Enrolled').length;
  const pendingApprovals = enrollmentData.filter((item) => item.status !== 'Enrolled').length;

  return {
    studentsEnrolled,
    coursesOffered,
    schoolDays,
    averageAttendance,
    totalStudents: studentsEnrolled,
    totalCourses: coursesOffered,
    activeEnrollments,
    pendingApprovals,
  };
};

const buildMockDashboardData = () => ({
  overview: buildOverview(),
  monthlyEnrollment: dashboardStats.enrollmentTrends.map((item) => ({
    month: item.month,
    enrollments: item.enrollments,
  })),
  courseDistribution: buildCourseDistribution(),
  attendancePattern: buildAttendancePattern(),
  recentActivities: dashboardStats.recentActivities,
});

const normalizeRemoteDashboard = (payload) => {
  const safePayload = payload || {};
  const remoteOverview = normalizeOverview(safePayload.overview || safePayload);
  const remoteCourseDistribution = mapDepartmentDistribution(
    safePayload.courseDistribution ||
      safePayload.courses_by_department ||
      safePayload.students_by_department ||
      [],
  );
  const remoteAttendancePattern = mapAttendanceFromRecentCalendar(
    safePayload.recent_calendar || safePayload.calendar || [],
  );
  const remoteActivities = mapRecentCalendarActivities(
    safePayload.recentActivities || safePayload.recent_calendar || [],
  );

  return {
    overview: remoteOverview,
    monthlyEnrollment:
      safePayload.monthlyEnrollment ||
      safePayload.enrollmentTrends ||
      defaultMonthlyEnrollment(),
    courseDistribution: remoteCourseDistribution.length
      ? remoteCourseDistribution
      : buildCourseDistribution(),
    attendancePattern: remoteAttendancePattern.length
      ? remoteAttendancePattern
      : buildAttendancePattern(),
    recentActivities: remoteActivities.length ? remoteActivities : dashboardStats.recentActivities,
  };
};

export const fetchDashboardData = async () => {
  await wait(650);

  if (!REMOTE_DASHBOARD_ENABLED) {
    return buildMockDashboardData();
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new ApiError('Authentication required. Please log in again.', 401, 'unauthenticated');
  }

  const request = fetch(`${API_BASE_URL}/dashboard`, {
    method: 'GET',
    headers: getAuthorizedHeaders(),
  });

  try {
    const response = await withTimeout(request, DASHBOARD_TIMEOUT_MS);
    const payload = await parseResponse(response);
    return normalizeRemoteDashboard(payload?.data || payload);
  } catch (error) {
    if (error?.status === 401) {
      throw new ApiError('Your session expired. Please log in again.', 401, 'unauthenticated');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error?.message || 'Unable to load dashboard data. Please try again later.',
      500,
      'unexpected',
    );
  }
};
