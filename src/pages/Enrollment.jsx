import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import {
  createEnrollmentRecord,
  fetchCourses,
  fetchEnrollments,
  fetchStudents,
  updateEnrollmentRecord,
} from '../services/schoolApi';
import '../styles/Pages.css';

const ENROLLMENTS_PER_PAGE = 15;

const EMPTY_ENROLLMENT_FORM = {
  studentId: '',
  courseId: '',
  semester: '',
  status: 'enrolled',
  enrollmentDate: new Date().toISOString().slice(0, 10),
};

const formatStatusLabel = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Unknown';

const normalizeStatusValue = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'pending' || normalized === 'dropped' || normalized === 'inactive') {
    return normalized;
  }

  return 'enrolled';
};

const statusTone = (value = '') => {
  const normalized = normalizeStatusValue(value);
  if (normalized === 'pending') {
    return 'pending';
  }

  if (normalized === 'dropped' || normalized === 'inactive') {
    return 'inactive';
  }

  return 'active';
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

const toDisplayDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US');
};

const mapEnrollment = (enrollment) => {
  const studentBackendId = Number(
    enrollment?.student_id || enrollment?.studentId || enrollment?.student?.id || 0,
  );
  const courseBackendId = Number(enrollment?.course_id || enrollment?.courseId || enrollment?.course?.id || 0);
  const enrollmentStatus = normalizeStatusValue(enrollment?.status);

  return {
    id: enrollment?.id || `${studentBackendId}-${courseBackendId}`,
    studentBackendId,
    studentId:
      enrollment?.student_number || enrollment?.student_code || enrollment?.studentId || `STU-${studentBackendId}`,
    studentName:
      enrollment?.student_name ||
      enrollment?.studentName ||
      enrollment?.student?.full_name ||
      [enrollment?.student?.first_name, enrollment?.student?.last_name].filter(Boolean).join(' ').trim() ||
      'Unnamed Student',
    courseBackendId,
    subjectCode:
      enrollment?.course_code ||
      enrollment?.subject_code ||
      enrollment?.subjectCode ||
      enrollment?.course?.code ||
      'N/A',
    subjectName:
      enrollment?.course_name ||
      enrollment?.subject_name ||
      enrollment?.subjectName ||
      enrollment?.course?.title ||
      enrollment?.course?.name ||
      'Untitled Subject',
    units: Number(
      enrollment?.credits ||
        enrollment?.units ||
        enrollment?.course?.credits ||
        enrollment?.course?.units ||
        0,
    ),
    semester: enrollment?.semester || enrollment?.course?.semester || 'N/A',
    enrollmentDate: toIsoDate(enrollment?.enrollment_date || enrollment?.enrollmentDate || enrollment?.date),
    statusValue: enrollmentStatus,
    statusLabel: formatStatusLabel(enrollmentStatus),
    statusTone: statusTone(enrollmentStatus),
  };
};

const mapStudentOption = (student) => {
  const studentId = Number(student?.id || 0);
  const studentNumber =
    student?.student_number || student?.student_id || student?.id_number || `STU-${studentId || 'N/A'}`;
  const studentName =
    student?.full_name ||
    [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim() ||
    'Unnamed Student';

  return {
    id: studentId,
    label: `${studentNumber} - ${studentName}`,
  };
};

const mapCourseOption = (course) => ({
  id: Number(course?.id || 0),
  code: course?.code || course?.course_code || 'N/A',
  title: course?.title || course?.name || 'Untitled Subject',
  semester: course?.semester || '',
  units: Number(course?.credits || course?.units || 0),
});

const buildEnrollmentForm = (enrollment = null) => {
  if (!enrollment) {
    return { ...EMPTY_ENROLLMENT_FORM };
  }

  return {
    studentId: String(enrollment.studentBackendId || ''),
    courseId: String(enrollment.courseBackendId || ''),
    semester: enrollment.semester === 'N/A' ? '' : enrollment.semester,
    status: normalizeStatusValue(enrollment.statusValue),
    enrollmentDate: enrollment.enrollmentDate,
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

const Enrollment = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ ...EMPTY_ENROLLMENT_FORM });
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: ENROLLMENTS_PER_PAGE,
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
  }, [debouncedSearch]);

  useEffect(() => {
    let isActive = true;

    const loadEnrollmentOptions = async () => {
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          fetchStudents({ page: 1, perPage: 100 }),
          fetchCourses({ page: 1, perPage: 100 }),
        ]);

        if (!isActive) {
          return;
        }

        setStudentOptions(studentsResponse.items.map(mapStudentOption).filter((item) => item.id));
        setCourseOptions(coursesResponse.items.map(mapCourseOption).filter((item) => item.id));
      } catch {
        if (isActive) {
          setStudentOptions([]);
          setCourseOptions([]);
        }
      }
    };

    loadEnrollmentOptions();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isActive = true;

    const loadEnrollments = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { items, pagination: nextPagination } = await fetchEnrollments({
          search: debouncedSearch,
          page,
          perPage: ENROLLMENTS_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setEnrollments(items.map(mapEnrollment));
        setPagination(nextPagination);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setEnrollments([]);
        setPagination({
          currentPage: 1,
          lastPage: 1,
          perPage: ENROLLMENTS_PER_PAGE,
          total: 0,
        });
        setError(requestError?.message || 'Unable to load enrollments from the backend.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadEnrollments();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, page, reloadKey]);

  const courseLookup = useMemo(
    () => new Map(courseOptions.map((course) => [String(course.id), course])),
    [courseOptions],
  );

  const showingFrom = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1;
  const showingTo = pagination.total === 0 ? 0 : showingFrom + enrollments.length - 1;

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setEditingEnrollment(null);
    setEnrollmentForm({ ...EMPTY_ENROLLMENT_FORM });
    setFormError('');
    setShowFormModal(true);
  };

  const openManageModal = (enrollment) => {
    setEditingEnrollment(enrollment);
    setEnrollmentForm(buildEnrollmentForm(enrollment));
    setFormError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingEnrollment(null);
    setEnrollmentForm({ ...EMPTY_ENROLLMENT_FORM });
    setFormError('');
  };

  const handleEnrollmentFormChange = (event) => {
    const { name, value } = event.target;

    setEnrollmentForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === 'courseId') {
        const selectedCourse = courseLookup.get(value);
        if (selectedCourse?.semester) {
          next.semester = selectedCourse.semester;
        }
      }

      return next;
    });
  };

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  const handleSubmitEnrollment = async (event) => {
    event.preventDefault();

    const studentId = Number(enrollmentForm.studentId || 0);
    const courseId = Number(enrollmentForm.courseId || 0);

    if (!studentId || !courseId || !enrollmentForm.enrollmentDate) {
      setFormError('Please select student, subject, and enrollment date.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const status = normalizeStatusValue(enrollmentForm.status);
      const selectedCourse = courseLookup.get(String(courseId));
      const payload = {
        student_id: studentId,
        course_id: courseId,
        semester: enrollmentForm.semester || selectedCourse?.semester || null,
        status,
        enrollment_date: enrollmentForm.enrollmentDate,

        // Compatibility aliases for alternate backend payload formats.
        studentId,
        courseId,
        enrollmentDate: enrollmentForm.enrollmentDate,
      };

      if (editingEnrollment) {
        await updateEnrollmentRecord(editingEnrollment.id, {
          ...payload,
          previous_student_id: editingEnrollment.studentBackendId,
          previous_course_id: editingEnrollment.courseBackendId,
        });
      } else {
        await createEnrollmentRecord(payload);
      }

      closeFormModal();
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setFormError(extractErrorMessage(requestError, 'Unable to save enrollment data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEnrollments = enrollments.filter((enrollment) => enrollment.statusValue === 'enrolled').length;
  const pendingEnrollments = enrollments.filter((enrollment) => enrollment.statusValue === 'pending').length;
  const totalUnits = enrollments.reduce((sum, enrollment) => sum + enrollment.units, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Enrollment</h1>
          <p>Manage student subject enrollments</p>
        </div>
        <button
          className="primary-btn"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          New Enrollment
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
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

      <div className="enrollment-stats">
        <div className="stat-item">
          <h3>{activeEnrollments}</h3>
          <p>Active Enrollments</p>
        </div>
        <div className="stat-item">
          <h3>{pendingEnrollments}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-item">
          <h3>{totalUnits}</h3>
          <p>Total Units</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Units</th>
              <th>Semester</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="table-placeholder">
                  Loading enrollments...
                </td>
              </tr>
            ) : enrollments.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-placeholder">
                  No enrollments found for the current filters.
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment, index) => (
                <motion.tr
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="font-weight-bold">{enrollment.studentId}</td>
                  <td>{enrollment.studentName}</td>
                  <td className="font-weight-bold">{enrollment.subjectCode}</td>
                  <td>{enrollment.subjectName}</td>
                  <td>{enrollment.units}</td>
                  <td>{enrollment.semester}</td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {toDisplayDate(enrollment.enrollmentDate)}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${enrollment.statusTone}`}>{enrollment.statusLabel}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-view" onClick={() => handleViewEnrollment(enrollment)}>
                        View
                      </button>
                      <button className="btn-sm btn-edit" onClick={() => openManageModal(enrollment)}>
                        Manage
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
          Showing {showingFrom}-{showingTo} of {pagination.total} enrollments
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
        title="Enrollment Details"
        size="medium"
      >
        {selectedEnrollment && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Student ID</span>
                <span className="modal-info-value">{selectedEnrollment.studentId}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Student Name</span>
                <span className="modal-info-value">{selectedEnrollment.studentName}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Subject Code</span>
                <span className="modal-info-value">{selectedEnrollment.subjectCode}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Subject Name</span>
                <span className="modal-info-value">{selectedEnrollment.subjectName}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Units</span>
                <span className="modal-info-value">{selectedEnrollment.units} units</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Semester</span>
                <span className="modal-info-value">{selectedEnrollment.semester}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Enrollment Date</span>
                <span className="modal-info-value">
                  {new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Status</span>
                <span className={`modal-badge ${selectedEnrollment.statusTone}`}>
                  {selectedEnrollment.statusLabel}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openManageModal(selectedEnrollment);
                }}
              >
                Manage Enrollment
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingEnrollment ? 'Manage Enrollment' : 'New Enrollment'}
        size="medium"
      >
        <form onSubmit={handleSubmitEnrollment}>
          <div className="modal-form-group">
            <label htmlFor="studentId">Student</label>
            <select
              id="studentId"
              name="studentId"
              value={enrollmentForm.studentId}
              onChange={handleEnrollmentFormChange}
            >
              <option value="">Select student</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="courseId">Subject</label>
            <select
              id="courseId"
              name="courseId"
              value={enrollmentForm.courseId}
              onChange={handleEnrollmentFormChange}
            >
              <option value="">Select subject</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="semester">Semester</label>
              <input
                id="semester"
                name="semester"
                type="text"
                value={enrollmentForm.semester}
                onChange={handleEnrollmentFormChange}
                placeholder="1st Semester"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={enrollmentForm.status}
                onChange={handleEnrollmentFormChange}
              >
                <option value="enrolled">Enrolled</option>
                <option value="pending">Pending</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label htmlFor="enrollmentDate">Enrollment Date</label>
            <input
              id="enrollmentDate"
              name="enrollmentDate"
              type="date"
              value={enrollmentForm.enrollmentDate}
              onChange={handleEnrollmentFormChange}
            />
          </div>

          {formError ? <p className="modal-form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={closeFormModal}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingEnrollment ? 'Save Changes' : 'Create Enrollment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Enrollment;
