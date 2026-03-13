import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookPlus } from 'lucide-react';
import Modal from './Modal';
import { coursesData } from '../data/mockData';
import { createCourse, fetchCourses } from '../services/schoolApi';
import '../styles/Pages.css';

const COURSES_PER_PAGE = 15;

const EMPTY_COURSE_FORM = {
  code: '',
  title: '',
  department: '',
  semester: '1st Semester',
  units: '3',
  capacity: '40',
  instructor: '',
  status: 'active',
  description: '',
};

const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester', 'Summer'];

const formatStatusLabel = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Unknown';

const normalizeStatusValue = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'inactive' || normalized === 'pending') {
    return normalized;
  }

  return 'active';
};

const normalizeSemesterValue = (value = '') => {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }

  const normalized = rawValue
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    normalized === '1' ||
    normalized === '1st' ||
    normalized === 'first' ||
    normalized === 'sem 1' ||
    normalized === 'semester 1' ||
    normalized === '1st sem' ||
    normalized === '1st semester' ||
    normalized === 'first sem' ||
    normalized === 'first semester'
  ) {
    return '1st Semester';
  }

  if (
    normalized === '2' ||
    normalized === '2nd' ||
    normalized === 'second' ||
    normalized === 'sem 2' ||
    normalized === 'semester 2' ||
    normalized === '2nd sem' ||
    normalized === '2nd semester' ||
    normalized === 'second sem' ||
    normalized === 'second semester'
  ) {
    return '2nd Semester';
  }

  if (
    normalized === '3' ||
    normalized === '3rd' ||
    normalized === 'third' ||
    normalized === 'sem 3' ||
    normalized === 'semester 3' ||
    normalized === 'summer' ||
    normalized === 'midyear' ||
    normalized === 'mid year'
  ) {
    return 'Summer';
  }

  return rawValue;
};

const toStatusTone = (value = '') => {
  const normalized = normalizeStatusValue(value);
  if (normalized === 'inactive') {
    return 'inactive';
  }

  if (normalized === 'pending') {
    return 'pending';
  }

  return 'active';
};

const mapCourse = (course) => {
  const resolvedActiveValue =
    course?.active ??
    course?.is_active ??
    course?.isActive ??
    (typeof course?.status === 'string' ? undefined : null);
  const isInactiveFromActiveFlag =
    resolvedActiveValue === false ||
    resolvedActiveValue === 0 ||
    resolvedActiveValue === '0' ||
    resolvedActiveValue === 'false';
  const statusValue = normalizeStatusValue(
    course?.status || (isInactiveFromActiveFlag ? 'inactive' : 'active'),
  );

  return {
    id: course?.id,
    code: course?.code || course?.course_code || 'N/A',
    title: course?.title || course?.name || 'Untitled Course',
    department: course?.department || 'Unassigned',
    semester: normalizeSemesterValue(course?.semester) || 'N/A',
    units: Number(course?.credits ?? course?.units ?? 0),
    capacity: Number(course?.capacity ?? course?.max_students ?? course?.maxStudents ?? 0),
    instructor: course?.instructor || 'TBA',
    enrolledCount: Number(
      course?.enrolled_students ?? course?.enrolled ?? course?.students_count ?? 0,
    ),
    statusValue,
    statusLabel: formatStatusLabel(statusValue),
    statusTone: toStatusTone(statusValue),
    description: course?.description || 'No description provided.',
  };
};

const mapMockCourse = (course) => {
  const statusValue = normalizeStatusValue(course?.status === 'Full' ? 'inactive' : course?.status);

  return {
    id: course?.id,
    code: course?.courseCode || course?.code || 'N/A',
    title: course?.title || course?.name || 'Untitled Course',
    department: course?.department || 'Unassigned',
    semester: normalizeSemesterValue(course?.semester) || 'N/A',
    units: Number(course?.units || 0),
    capacity: Number(course?.capacity || 0),
    instructor: course?.instructor || 'TBA',
    enrolledCount: Number(course?.enrolled || 0),
    statusValue,
    statusLabel: formatStatusLabel(statusValue),
    statusTone: toStatusTone(statusValue),
    description: course?.description || 'No description provided.',
  };
};

const filterCourses = (items, searchTerm, department) => {
  const query = String(searchTerm || '').trim().toLowerCase();

  return items.filter((course) => {
    const matchesSearch =
      !query ||
      [course.title, course.code, course.department, course.instructor, course.semester]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    const matchesDepartment = department === 'All' || course.department === department;
    return matchesSearch && matchesDepartment;
  });
};

const paginateCourses = (items, page) => {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / COURSES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage);
  const start = (currentPage - 1) * COURSES_PER_PAGE;

  return {
    items: items.slice(start, start + COURSES_PER_PAGE),
    pagination: {
      currentPage,
      lastPage,
      perPage: COURSES_PER_PAGE,
      total,
    },
  };
};

const buildCoursePayload = (courseForm) => {
  const code = courseForm.code.trim();
  const title = courseForm.title.trim();
  const department = courseForm.department.trim();
  const semester = normalizeSemesterValue(courseForm.semester);
  const units = Math.max(0, Number(courseForm.units || 0));
  const capacity = Math.max(1, Math.round(Number(courseForm.capacity || 0)));
  const instructor = courseForm.instructor.trim();
  const status = normalizeStatusValue(courseForm.status);
  const isActive = status !== 'inactive';

  return {
    course_code: code,
    code,
    title,
    name: title,
    department,
    semester: semester || null,
    credits: units,
    units,
    capacity,
    max_students: capacity,
    maxStudents: capacity,
    instructor: instructor || null,
    status,
    active: isActive,
    is_active: isActive ? 1 : 0,
    isActive,
    description: courseForm.description.trim() || null,
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

const ProgramList = () => {
  const [courses, setCourses] = useState([]);
  const [localCourses] = useState(() => coursesData.map(mapMockCourse));
  const [, setIsBackendAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ ...EMPTY_COURSE_FORM });
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: COURSES_PER_PAGE,
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

    const loadCourses = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { items, pagination: nextPagination } = await fetchCourses({
          search: debouncedSearch,
          department: filterDepartment === 'All' ? undefined : filterDepartment,
          page,
          perPage: COURSES_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setCourses(items.map(mapCourse));
        setPagination(nextPagination);
        setIsBackendAvailable(true);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const filteredLocalCourses = filterCourses(localCourses, debouncedSearch, filterDepartment);
        const localPage = paginateCourses(filteredLocalCourses, page);

        setCourses(localPage.items);
        setPagination(localPage.pagination);
        setIsBackendAvailable(false);
        setError(
          `${requestError?.message || 'Unable to load courses from the backend.'} Showing local course data.`,
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, filterDepartment, page, reloadKey, localCourses]);

  const departments = useMemo(
    () => [
      'All',
      ...new Set([...localCourses, ...courses].map((course) => course.department).filter(Boolean)),
    ],
    [localCourses, courses],
  );

  const showingFrom = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1;
  const showingTo = pagination.total === 0 ? 0 : showingFrom + courses.length - 1;

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setCourseForm({ ...EMPTY_COURSE_FORM });
    setFormError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCourseForm({ ...EMPTY_COURSE_FORM });
    setFormError('');
  };

  const handleCourseFormChange = (event) => {
    const { name, value } = event.target;
    setCourseForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  const handleSubmitCourse = async (event) => {
    event.preventDefault();

    const code = courseForm.code.trim();
    const title = courseForm.title.trim();
    const department = courseForm.department.trim();
    const capacity = Number(courseForm.capacity);

    if (!code || !title || !department) {
      setFormError('Please complete course code, title, and department.');
      return;
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      setFormError('Please provide a valid capacity (at least 1).');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = buildCoursePayload(courseForm);
      await createCourse(payload);

      closeFormModal();
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setFormError(extractErrorMessage(requestError, 'Unable to save course data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage course offerings and curriculum structure</p>
        </div>
        <button className="primary-btn" onClick={openCreateModal}>
          <BookPlus size={18} />
          Add Course
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by course title or code..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}>
            {departments.map((department) => (
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
              <th>Code</th>
              <th>Course Title</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Units</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-placeholder">
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-placeholder">
                  No courses found for the current filters.
                </td>
              </tr>
            ) : (
              courses.map((course, index) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="font-weight-bold">{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.department}</td>
                  <td>{course.semester}</td>
                  <td>{course.units}</td>
                  <td>{course.enrolledCount}</td>
                  <td>
                    <span className={`status-badge ${course.statusTone}`}>{course.statusLabel}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-view" onClick={() => handleViewCourse(course)}>
                        View
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
          Showing {showingFrom}-{showingTo} of {pagination.total} courses
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
        title="Course Details"
        size="medium"
      >
        {selectedCourse && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Course Code</span>
                <span className="modal-info-value">{selectedCourse.code}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Course Title</span>
                <span className="modal-info-value">{selectedCourse.title}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Department</span>
                <span className="modal-info-value">{selectedCourse.department}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Semester</span>
                <span className="modal-info-value">{selectedCourse.semester}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Units</span>
                <span className="modal-info-value">{selectedCourse.units} units</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Students</span>
                <span className="modal-info-value">{selectedCourse.enrolledCount}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Instructor</span>
                <span className="modal-info-value">{selectedCourse.instructor}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Status</span>
                <span className={`modal-badge ${selectedCourse.statusTone}`}>
                  {selectedCourse.statusLabel}
                </span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Description</label>
              <textarea readOnly value={selectedCourse.description} />
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title="Add Course"
        size="medium"
      >
        <form onSubmit={handleSubmitCourse}>
          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="code">Course Code</label>
              <input
                id="code"
                name="code"
                type="text"
                value={courseForm.code}
                onChange={handleCourseFormChange}
                placeholder="CS101"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="title">Course Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={courseForm.title}
                onChange={handleCourseFormChange}
                placeholder="Introduction to Programming"
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                value={courseForm.department}
                onChange={handleCourseFormChange}
                placeholder="Computer Science"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                value={courseForm.semester}
                onChange={handleCourseFormChange}
              >
                {SEMESTER_OPTIONS.map((semesterOption) => (
                  <option key={semesterOption} value={semesterOption}>
                    {semesterOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="units">Units</label>
              <input
                id="units"
                name="units"
                type="number"
                min="0"
                value={courseForm.units}
                onChange={handleCourseFormChange}
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={courseForm.capacity}
                onChange={handleCourseFormChange}
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={courseForm.status}
                onChange={handleCourseFormChange}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label htmlFor="instructor">Instructor</label>
            <input
              id="instructor"
              name="instructor"
              type="text"
              value={courseForm.instructor}
              onChange={handleCourseFormChange}
              placeholder="Prof. Juan Dela Cruz"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={courseForm.description}
              onChange={handleCourseFormChange}
              placeholder="Course overview"
            />
          </div>

          {formError ? <p className="modal-form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={closeFormModal}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgramList;
