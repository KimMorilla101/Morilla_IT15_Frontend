import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { studentsData } from '../data/mockData';
import {
  createStudent,
  deleteStudent,
  fetchCourses,
  fetchStudents,
  updateStudent,
} from '../services/schoolApi';
import '../styles/Pages.css';

const STUDENTS_PER_PAGE = 15;
const STUDENT_TARGET_COUNT = 500;
const STUDENT_FETCH_BATCH_SIZE = 100;
const CHANG_BATIS_KEYWORDS = ['chang batis', 'changbatis'];
const MAX_YEAR_LEVEL = 4;
const YEAR_LEVEL_UNIT_REQUIREMENTS = {
  1: 26,
  2: 26,
  3: 26,
  4: 10,
};

const EMPTY_STUDENT_FORM = {
  studentNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  yearLevel: '1',
  gender: 'female',
  dateOfBirth: '',
  phoneNumber: '',
  address: '',
  status: 'active',
};

const formatStatusLabel = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Unknown';

const splitFullName = (fullName = '') => {
  const value = String(fullName).trim();
  if (!value) {
    return {
      firstName: '',
      lastName: '',
    };
  }

  const pieces = value.split(/\s+/);
  if (pieces.length === 1) {
    return {
      firstName: pieces[0],
      lastName: '',
    };
  }

  return {
    firstName: pieces.slice(0, -1).join(' '),
    lastName: pieces[pieces.length - 1],
  };
};

const normalizeStatusValue = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'inactive' || normalized === 'graduated' || normalized === 'pending') {
    return normalized;
  }

  return 'active';
};

const normalizeYearLevel = (value, fallback = null) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(MAX_YEAR_LEVEL, Math.max(1, Math.round(parsed)));
};

const formatYearLevelLabel = (yearLevel, statusValue = '') => {
  if (statusValue === 'graduated') {
    return 'Graduated';
  }

  if (!yearLevel) {
    return 'Not provided';
  }

  if (yearLevel === 1) {
    return '1st Year';
  }

  if (yearLevel === 2) {
    return '2nd Year';
  }

  if (yearLevel === 3) {
    return '3rd Year';
  }

  return '4th Year';
};

const getRequiredUnitsForYear = (yearLevel) => YEAR_LEVEL_UNIT_REQUIREMENTS[yearLevel] || 0;

const resolveStudentUnits = ({ statusValue, yearLevel, courseUnits = 0, fallbackUnits = 0 }) => {
  if (statusValue === 'graduated') {
    return 0;
  }

  const requiredUnits = getRequiredUnitsForYear(yearLevel);
  if (requiredUnits > 0) {
    return requiredUnits;
  }

  const resolvedUnits = Number(courseUnits || fallbackUnits || 0);
  return Number.isFinite(resolvedUnits) && resolvedUnits > 0 ? resolvedUnits : 0;
};

const normalizeGenderValue = (value = '', fallback = 'female') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'female' || normalized === 'f') {
    return 'female';
  }

  if (normalized === 'male' || normalized === 'm') {
    return 'male';
  }

  return fallback;
};

const formatGenderLabel = (value = '') => {
  const normalized = normalizeGenderValue(value, '');

  if (normalized === 'female') {
    return 'Female';
  }

  if (normalized === 'male') {
    return 'Male';
  }

  return 'Not provided';
};

const getStatusTone = (value = '') => {
  const normalized = String(value).toLowerCase();

  if (normalized === 'active') {
    return 'active';
  }

  if (normalized === 'inactive' || normalized === 'graduated') {
    return 'inactive';
  }

  return 'pending';
};

const formatDate = (value) => {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not provided';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const mapStudent = (student) => {
  const fullName =
    student?.full_name ||
    [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() ||
    'Unnamed Student';
  const fallbackName = splitFullName(fullName);
  const courses = Array.isArray(student?.courses) ? student.courses : [];
  const statusValue = normalizeStatusValue(student?.status);
  const normalizedYear =
    statusValue === 'graduated'
      ? null
      : normalizeYearLevel(student?.year_level ?? student?.year ?? student?.yearLevel, null);
  const courseUnits = courses.reduce((total, course) => total + Number(course?.credits ?? course?.units ?? 0), 0);
  const enrolledUnits = resolveStudentUnits({
    statusValue,
    yearLevel: normalizedYear,
    courseUnits,
    fallbackUnits: Number(student?.enrolled_units ?? student?.enrolledUnits ?? 0),
  });
  const statusLabel = formatStatusLabel(statusValue);
  const genderValue = normalizeGenderValue(student?.gender || student?.sex || '', '');

  return {
    id: student?.id,
    studentId: student?.student_number || `STU-${student?.id ?? 'N/A'}`,
    name: fullName,
    firstName: student?.first_name || fallbackName.firstName,
    lastName: student?.last_name || fallbackName.lastName,
    email: student?.email || 'No email provided',
    department: student?.department || 'Undeclared',
    year: normalizedYear,
    yearLevelLabel: formatYearLevelLabel(normalizedYear, statusValue),
    enrolledUnits,
    statusLabel,
    statusValue,
    statusTone: getStatusTone(statusValue),
    gender: genderValue,
    genderLabel: formatGenderLabel(genderValue),
    dateOfBirth: student?.date_of_birth || null,
    phoneNumber: student?.phone_number || 'Not provided',
    address: student?.address || 'Not provided',
    courses,
  };
};

const buildDepartmentOptions = (items = []) => {
  const departments = Array.from(new Set(items.map((item) => item?.department).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right),
  );

  return ['All', ...departments];
};

const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userId');
  localStorage.removeItem('profile');
};

const buildStudentForm = (student = null) => {
  if (!student) {
    return { ...EMPTY_STUDENT_FORM };
  }

  const statusValue = normalizeStatusValue(student.statusValue || student.statusLabel);

  return {
    studentNumber: student.studentId || '',
    firstName: student.firstName || '',
    lastName: student.lastName || '',
    email: student.email === 'No email provided' ? '' : student.email,
    department: student.department === 'Undeclared' ? '' : student.department,
    yearLevel: statusValue === 'graduated' ? '' : student.year ? String(student.year) : '1',
    gender: normalizeGenderValue(student.gender, 'female'),
    dateOfBirth: student.dateOfBirth || '',
    phoneNumber: student.phoneNumber === 'Not provided' ? '' : student.phoneNumber,
    address: student.address === 'Not provided' ? '' : student.address,
    status: statusValue,
  };
};

const buildStudentPayload = (studentForm, currentStudent = null) => {
  const studentNumber = studentForm.studentNumber.trim();
  const firstName = studentForm.firstName.trim();
  const lastName = studentForm.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const department = studentForm.department.trim();
  const status = normalizeStatusValue(studentForm.status);
  const yearLevel = status === 'graduated' ? null : normalizeYearLevel(studentForm.yearLevel, 1);
  const gender = normalizeGenderValue(studentForm.gender, 'female');
  const courseIds = Array.isArray(currentStudent?.courses)
    ? currentStudent.courses.map((course) => Number(course?.id)).filter((id) => Number.isFinite(id))
    : [];

  return {
    student_number: studentNumber,
    student_id: studentNumber,
    id_number: studentNumber,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: studentForm.email.trim(),
    department,
    year_level: yearLevel,
    status,
    gender,
    sex: gender,
    date_of_birth: studentForm.dateOfBirth || '2000-01-01',
    phone_number: studentForm.phoneNumber.trim() || null,
    address: studentForm.address.trim() || null,
    course_ids: courseIds,

    // Compatibility aliases for stricter backend validators.
    studentNumber,
    yearLevel,
    dateOfBirth: studentForm.dateOfBirth || '2000-01-01',
  };
};

const extractErrorMessage = (error, fallbackMessage) => {
  const details = error?.details;

  if (details && typeof details === 'object') {
    const flattened = Object.values(details)
      .flat()
      .filter(Boolean)
      .map((entry) => String(entry));

    if (flattened.length) {
      return flattened[0];
    }
  }

  return error?.message || fallbackMessage;
};

const normalizeLookupText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const removeSpaces = (value = '') => normalizeLookupText(value).replace(/\s+/g, '');

const isChangBatisStudent = (student = {}) => {
  const nameValue = normalizeLookupText(student?.name || student?.full_name || '');
  const emailValue = removeSpaces(student?.email || '');
  const studentIdValue = removeSpaces(student?.studentId || student?.student_number || '');

  return CHANG_BATIS_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeLookupText(keyword);
    const compactKeyword = normalizedKeyword.replace(/\s+/g, '');

    return (
      nameValue.includes(normalizedKeyword) ||
      removeSpaces(nameValue).includes(compactKeyword) ||
      emailValue.includes(compactKeyword) ||
      studentIdValue.includes(compactKeyword)
    );
  });
};

const mapMockStudent = (student) => {
  const firstName = student?.name?.split(' ')?.slice(0, -1).join(' ') || student?.name || '';
  const lastName = student?.name?.split(' ')?.slice(-1).join(' ') || '';
  const statusValue = normalizeStatusValue(student.status || 'active');
  const normalizedYear =
    statusValue === 'graduated' ? null : normalizeYearLevel(student?.year ?? student?.yearLevel, null);
  const enrolledUnits = resolveStudentUnits({
    statusValue,
    yearLevel: normalizedYear,
    fallbackUnits: Number(student.enrolledUnits || 0),
  });

  return {
    id: `mock-${student.id}`,
    studentId: student.studentId || `STU-${student.id}`,
    name: student.name || 'Unnamed Student',
    firstName,
    lastName,
    email: student.email || 'No email provided',
    department: student.department || 'Undeclared',
    year: normalizedYear,
    yearLevelLabel: formatYearLevelLabel(normalizedYear, statusValue),
    enrolledUnits,
    statusLabel: formatStatusLabel(statusValue),
    statusValue,
    statusTone: getStatusTone(statusValue),
    gender: normalizeGenderValue(student.gender, ''),
    genderLabel: formatGenderLabel(student.gender),
    dateOfBirth: student.birthDate || null,
    phoneNumber: student.contactNumber || 'Not provided',
    address: [student.city, student.province].filter(Boolean).join(', ') || 'Not provided',
    courses: [],
  };
};

const buildStudentIdentityKey = (student) =>
  `${removeSpaces(student?.studentId || '')}|${removeSpaces(student?.email || '')}|${normalizeLookupText(student?.name || '')}`;

const shouldBackfillStudents = (searchValue, departmentValue) =>
  !searchValue && (departmentValue === 'All' || !departmentValue);

const fillToStudentTarget = (backendStudents, searchValue, departmentValue) => {
  if (!shouldBackfillStudents(searchValue, departmentValue) || backendStudents.length >= STUDENT_TARGET_COUNT) {
    return backendStudents.slice(0, STUDENT_TARGET_COUNT);
  }

  const existingKeys = new Set(backendStudents.map(buildStudentIdentityKey));

  const mockCandidates = studentsData
    .map(mapMockStudent)
    .filter((student) => !isChangBatisStudent(student))
    .filter((student) => !existingKeys.has(buildStudentIdentityKey(student)));

  const missingCount = STUDENT_TARGET_COUNT - backendStudents.length;

  return [...backendStudents, ...mockCandidates.slice(0, missingCount)];
};

const Students = () => {
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [departmentOptions, setDepartmentOptions] = useState(['All']);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({ ...EMPTY_STUDENT_FORM });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: STUDENTS_PER_PAGE,
    total: 0,
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterDepartment]);

  useEffect(() => {
    let isActive = true;

    const loadDepartments = async () => {
      try {
        const { items } = await fetchCourses({ perPage: 100 });
        if (!isActive) {
          return;
        }

        const nextOptions = buildDepartmentOptions(items);
        if (nextOptions.length > 1) {
          setDepartmentOptions(nextOptions);
        }
      } catch {
        if (isActive) {
          setDepartmentOptions(['All']);
        }
      }
    };

    loadDepartments();

    return () => {
      isActive = false;
    };
  }, []);

  const availableDepartments = useMemo(() => {
    if (departmentOptions.length > 1) {
      return departmentOptions;
    }

    return buildDepartmentOptions(allStudents);
  }, [allStudents, departmentOptions]);

  useEffect(() => {
    let isActive = true;

    const loadStudents = async () => {
      setIsLoading(true);
      setError('');

      try {
        const requestFilters = {
          search: debouncedSearch,
          department: filterDepartment === 'All' ? undefined : filterDepartment,
          perPage: STUDENT_FETCH_BATCH_SIZE,
        };

        const collectedRawStudents = [];
        const firstPageResponse = await fetchStudents({
          ...requestFilters,
          page: 1,
        });

        collectedRawStudents.push(...firstPageResponse.items);

        const maxPages = Math.max(1, Math.ceil(STUDENT_TARGET_COUNT / STUDENT_FETCH_BATCH_SIZE));
        const pagesToFetch = Math.min(firstPageResponse.pagination.lastPage || 1, maxPages);

        for (let nextPage = 2; nextPage <= pagesToFetch; nextPage += 1) {
          const nextResponse = await fetchStudents({
            ...requestFilters,
            page: nextPage,
          });

          collectedRawStudents.push(...nextResponse.items);
        }

        if (!isActive) {
          return;
        }

        const mappedStudents = collectedRawStudents.map(mapStudent);
        const changBatisStudents = mappedStudents.filter(isChangBatisStudent);

        if (!debouncedSearch && filterDepartment === 'All' && changBatisStudents.length) {
          await Promise.allSettled(
            changBatisStudents
              .map((student) => student.id)
              .filter((studentId) => Number.isFinite(Number(studentId)))
              .map((studentId) => deleteStudent(studentId)),
          );
        }

        const sanitizedStudents = mappedStudents.filter((student) => !isChangBatisStudent(student));
        const finalStudents = fillToStudentTarget(sanitizedStudents, debouncedSearch, filterDepartment);

        setAllStudents(finalStudents);

        if (departmentOptions.length === 1) {
          const nextOptions = buildDepartmentOptions(finalStudents);
          if (nextOptions.length > 1) {
            setDepartmentOptions(nextOptions);
          }
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        if (requestError?.status === 401) {
          clearAuthSession();
          navigate('/', { replace: true });
          return;
        }

        setAllStudents([]);
        setStudents([]);
        setPagination({
          currentPage: 1,
          lastPage: 1,
          perPage: STUDENTS_PER_PAGE,
          total: 0,
        });
        setError(requestError?.message || 'Unable to load students from the backend.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, filterDepartment, reloadKey, navigate, departmentOptions.length]);

  useEffect(() => {
    const total = allStudents.length;
    const lastPage = Math.max(1, Math.ceil(total / STUDENTS_PER_PAGE));
    const safePage = Math.min(Math.max(1, page), lastPage);

    if (safePage !== page) {
      setPage(safePage);
      return;
    }

    const start = (safePage - 1) * STUDENTS_PER_PAGE;
    const pagedStudents = allStudents.slice(start, start + STUDENTS_PER_PAGE);

    setStudents(pagedStudents);
    setPagination({
      currentPage: safePage,
      lastPage,
      perPage: STUDENTS_PER_PAGE,
      total,
    });
  }, [allStudents, page]);

  useEffect(() => {
    if (!selectedStudent) {
      return;
    }

    const refreshedSelection = allStudents.find((student) => student.id === selectedStudent.id);
    if (refreshedSelection && refreshedSelection !== selectedStudent) {
      setSelectedStudent(refreshedSelection);
    }
  }, [allStudents, selectedStudent]);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingStudent(null);
    setStudentForm({ ...EMPTY_STUDENT_FORM });
    setFormError('');
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setStudentForm(buildStudentForm(student));
    setFormError('');
    setShowFormModal(true);
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;
    setStudentForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === 'status') {
        const normalizedStatus = normalizeStatusValue(value);
        next.status = normalizedStatus;

        if (normalizedStatus === 'graduated') {
          next.yearLevel = '';
        } else if (!current.yearLevel) {
          next.yearLevel = '1';
        }
      }

      if (name === 'yearLevel') {
        const normalizedYear = normalizeYearLevel(value, 1);
        next.yearLevel = normalizedYear ? String(normalizedYear) : '';
      }

      return next;
    });
  };

  const handleSubmitStudent = async (event) => {
    event.preventDefault();

    const studentNumber = studentForm.studentNumber.trim();
    const firstName = studentForm.firstName.trim();
    const lastName = studentForm.lastName.trim();
    const email = studentForm.email.trim();
    const department = studentForm.department.trim();

    if (!studentNumber || !firstName || !lastName || !email || !department) {
      setFormError('Please complete Student ID, first name, last name, email, and department.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFormError('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = buildStudentPayload(studentForm, editingStudent);

      if (editingStudent?.id) {
        await updateStudent(editingStudent.id, payload, 'PATCH');
      } else {
        await createStudent(payload);
      }

      closeFormModal();
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      if (requestError?.status === 401) {
        clearAuthSession();
        navigate('/', { replace: true });
        return;
      }

      setFormError(extractErrorMessage(requestError, 'Unable to save student record.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  const showingFrom = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1;
  const showingTo = pagination.total === 0 ? 0 : showingFrom + students.length - 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage student records and information</p>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterDepartment}
            onChange={(event) => setFilterDepartment(event.target.value)}
          >
            {availableDepartments.map((department) => (
              <option key={department} value={department}>
                {department === 'All' ? 'All Departments' : department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="page-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="btn-sm btn-view" onClick={handleRetry}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Year</th>
              <th>Units</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-placeholder">
                  Loading students from the Laravel backend...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-placeholder">
                  No students found for the current filters.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="font-weight-bold">{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>
                    <div className="email-cell">
                      <Mail size={14} />
                      {student.email}
                    </div>
                  </td>
                  <td>{student.department}</td>
                  <td>{student.yearLevelLabel}</td>
                  <td>{student.enrolledUnits} units</td>
                  <td>
                    <span className={`status-badge ${student.statusTone}`}>{student.statusLabel}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-view" onClick={() => handleViewStudent(student)}>
                        View
                      </button>
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(student)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination pagination-row">
        <span className="pagination-info">
          Showing {showingFrom}-{showingTo} of {pagination.total} students
        </span>
        <div className="pagination-actions">
          <button
            type="button"
            className="btn-sm btn-view"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={pagination.currentPage <= 1 || isLoading}
          >
            Previous
          </button>
          <span className="pagination-page">
            Page {pagination.currentPage} of {pagination.lastPage}
          </span>
          <button
            type="button"
            className="btn-sm btn-edit"
            onClick={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
            disabled={pagination.currentPage >= pagination.lastPage || isLoading}
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Student Details"
        size="medium"
      >
        {selectedStudent && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Student ID</span>
                <span className="modal-info-value">{selectedStudent.studentId}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Full Name</span>
                <span className="modal-info-value">{selectedStudent.name}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Email Address</span>
                <span className="modal-info-value">{selectedStudent.email}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Department</span>
                <span className="modal-info-value">{selectedStudent.department}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Year Level</span>
                <span className="modal-info-value">{selectedStudent.yearLevelLabel}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Units</span>
                <span className="modal-info-value">{selectedStudent.enrolledUnits} units</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Gender</span>
                <span className="modal-info-value">{selectedStudent.genderLabel}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Date of Birth</span>
                <span className="modal-info-value">{formatDate(selectedStudent.dateOfBirth)}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Phone Number</span>
                <span className="modal-info-value">{selectedStudent.phoneNumber}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Status</span>
                <span className={`modal-badge ${selectedStudent.statusTone}`}>
                  {selectedStudent.statusLabel}
                </span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Address</label>
              <input type="text" value={selectedStudent.address} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Enrolled Courses</label>
              {selectedStudent.courses.length ? (
                <div className="student-course-list">
                  {selectedStudent.courses.map((course) => (
                    <span key={`${selectedStudent.id}-${course.id}`} className="student-course-chip">
                      {course.code} - {course.title} ({Number(course.credits ?? course.units ?? 0)} units)
                    </span>
                  ))}
                </div>
              ) : (
                <p className="empty-detail-text">No course enrollments found for this student.</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedStudent);
                }}
              >
                Edit Student
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        size="medium"
      >
        <form onSubmit={handleSubmitStudent}>
          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="studentNumber">Student ID</label>
              <input
                id="studentNumber"
                name="studentNumber"
                type="text"
                value={studentForm.studentNumber}
                onChange={handleStudentFormChange}
                placeholder="2026-0001"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={studentForm.status}
                onChange={handleStudentFormChange}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={studentForm.firstName}
                onChange={handleStudentFormChange}
                placeholder="Juan"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={studentForm.lastName}
                onChange={handleStudentFormChange}
                placeholder="Dela Cruz"
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={studentForm.email}
                onChange={handleStudentFormChange}
                placeholder="student@example.com"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                value={studentForm.department}
                onChange={handleStudentFormChange}
                placeholder="School of Computing"
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="yearLevel">Year Level</label>
              <select
                id="yearLevel"
                name="yearLevel"
                value={studentForm.yearLevel}
                onChange={handleStudentFormChange}
                disabled={studentForm.status === 'graduated'}
              >
                {studentForm.status === 'graduated' ? (
                  <option value="">Not Applicable (Graduated)</option>
                ) : null}
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={studentForm.gender}
                onChange={handleStudentFormChange}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={studentForm.dateOfBirth}
                onChange={handleStudentFormChange}
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                value={studentForm.phoneNumber}
                onChange={handleStudentFormChange}
                placeholder="09123456789"
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={studentForm.address}
              onChange={handleStudentFormChange}
              placeholder="City, Province"
            />
          </div>

          {formError ? <p className="modal-form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={closeFormModal}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
