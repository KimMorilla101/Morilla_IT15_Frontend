import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookPlus } from 'lucide-react';
import Modal from './Modal';
import { subjectsData } from '../data/mockData';
import { createSubject, fetchSubjects, updateSubject } from '../services/schoolApi';
import '../styles/Pages.css';

const SUBJECTS_PER_PAGE = 15;

const EMPTY_SUBJECT_FORM = {
  code: '',
  name: '',
  department: '',
  units: '3',
  semester: '1st Semester',
  instructor: '',
  status: 'active',
  description: '',
};

const formatStatusLabel = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase()) || 'Unknown';

const toStatusValue = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'inactive' || normalized === 'pending') {
    return normalized;
  }

  return 'active';
};

const toStatusTone = (value = '') => {
  const normalized = toStatusValue(value);
  if (normalized === 'inactive') {
    return 'inactive';
  }

  if (normalized === 'pending') {
    return 'pending';
  }

  return 'active';
};

const mapSubject = (subject) => {
  const statusValue = toStatusValue(subject?.status);
  const units = Number(subject?.credits || subject?.units || 0);
  const enrolledStudents = Number(
    subject?.enrolled_students ||
      subject?.students_count ||
      subject?.enrolledStudents ||
      subject?.student_count ||
      0,
  );

  return {
    id: subject?.id,
    code: subject?.code || subject?.course_code || subject?.subject_code || 'N/A',
    name: subject?.name || subject?.title || subject?.subject_name || 'Untitled Subject',
    department: subject?.department || 'Unassigned',
    units,
    semester: subject?.semester || 'N/A',
    instructor: subject?.instructor || subject?.instructor_name || 'TBA',
    enrolledStudents,
    statusValue,
    statusLabel: formatStatusLabel(statusValue),
    statusTone: toStatusTone(statusValue),
    description: subject?.description || 'No description provided.',
  };
};

const mapMockSubject = (subject) => ({
  id: subject.id,
  code: subject.code,
  name: subject.name,
  department: subject.department,
  units: Number(subject.units || 0),
  semester: subject.semester,
  instructor: subject.instructor,
  enrolledStudents: Number(subject.enrolledStudents || 0),
  statusValue: toStatusValue(subject.status),
  statusLabel: formatStatusLabel(subject.status),
  statusTone: toStatusTone(subject.status),
  description: subject.description || 'No description provided.',
});

const filterSubjects = (items, searchTerm, department) => {
  const query = String(searchTerm || '').trim().toLowerCase();

  return items.filter((subject) => {
    const matchesSearch =
      !query ||
      [subject.name, subject.code, subject.department, subject.instructor]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    const matchesDepartment = department === 'All' || subject.department === department;
    return matchesSearch && matchesDepartment;
  });
};

const paginateSubjects = (items, page) => {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / SUBJECTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), lastPage);
  const start = (currentPage - 1) * SUBJECTS_PER_PAGE;

  return {
    items: items.slice(start, start + SUBJECTS_PER_PAGE),
    pagination: {
      currentPage,
      lastPage,
      perPage: SUBJECTS_PER_PAGE,
      total,
    },
  };
};

const buildSubjectForm = (subject = null) => {
  if (!subject) {
    return { ...EMPTY_SUBJECT_FORM };
  }

  return {
    code: subject.code,
    name: subject.name,
    department: subject.department,
    units: String(subject.units || 0),
    semester: subject.semester,
    instructor: subject.instructor === 'TBA' ? '' : subject.instructor,
    status: subject.statusValue,
    description: subject.description === 'No description provided.' ? '' : subject.description,
  };
};

const buildSubjectPayload = (subjectForm) => {
  const code = subjectForm.code.trim();
  const title = subjectForm.name.trim();
  const department = subjectForm.department.trim();
  const credits = Math.max(0, Number(subjectForm.units || 0));
  const semester = subjectForm.semester.trim();
  const instructor = subjectForm.instructor.trim();
  const status = toStatusValue(subjectForm.status);

  return {
    course_code: code,
    subject_code: code,
    code,
    title,
    name: title,
    department,
    credits,
    units: credits,
    semester,
    instructor: instructor || null,
    instructor_name: instructor || null,
    status,
    description: subjectForm.description.trim() || null,
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

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [localSubjects, setLocalSubjects] = useState(() => subjectsData.map(mapMockSubject));
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ ...EMPTY_SUBJECT_FORM });
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: SUBJECTS_PER_PAGE,
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

    const loadSubjects = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { items, pagination: nextPagination } = await fetchSubjects({
          search: debouncedSearch,
          department: filterDepartment === 'All' ? undefined : filterDepartment,
          page,
          perPage: SUBJECTS_PER_PAGE,
        });

        if (!isActive) {
          return;
        }

        setSubjects(items.map(mapSubject));
        setPagination(nextPagination);
        setIsBackendAvailable(true);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const filteredLocalSubjects = filterSubjects(localSubjects, debouncedSearch, filterDepartment);
        const localPage = paginateSubjects(filteredLocalSubjects, page);

        setSubjects(localPage.items);
        setPagination(localPage.pagination);
        setIsBackendAvailable(false);
        setError(
          `${requestError?.message || 'Unable to load subjects from the backend.'} Showing local subject data.`,
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSubjects();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch, filterDepartment, page, reloadKey, localSubjects]);

  const departments = useMemo(
    () => [
      'All',
      ...new Set([...localSubjects, ...subjects].map((subject) => subject.department).filter(Boolean)),
    ],
    [localSubjects, subjects],
  );

  const showingFrom = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.perPage + 1;
  const showingTo = pagination.total === 0 ? 0 : showingFrom + subjects.length - 1;

  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setSubjectForm({ ...EMPTY_SUBJECT_FORM });
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (subject) => {
    setShowViewModal(false);
    setEditingSubject(subject);
    setSubjectForm(buildSubjectForm(subject));
    setFormError('');
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingSubject(null);
    setSubjectForm({ ...EMPTY_SUBJECT_FORM });
    setFormError('');
  };

  const handleSubjectFormChange = (event) => {
    const { name, value } = event.target;
    setSubjectForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  const handleSubmitSubject = async (event) => {
    event.preventDefault();

    const code = subjectForm.code.trim();
    const name = subjectForm.name.trim();
    const department = subjectForm.department.trim();

    if (!code || !name || !department) {
      setFormError('Please complete subject code, subject name, and department.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = buildSubjectPayload(subjectForm);

      if (isBackendAvailable) {
        if (editingSubject?.id) {
          await updateSubject(editingSubject.id, payload, 'PATCH');
        } else {
          await createSubject(payload);
        }
      } else {
        const mappedSubject = mapSubject(payload);
        const nextSubject = {
          ...mappedSubject,
          id: editingSubject?.id || Date.now(),
          enrolledStudents: editingSubject?.enrolledStudents || 0,
        };

        setLocalSubjects((current) => {
          if (editingSubject?.id) {
            return current.map((subject) =>
              subject.id === editingSubject.id
                ? {
                    ...subject,
                    ...nextSubject,
                  }
                : subject,
            );
          }

          return [nextSubject, ...current];
        });
      }

      closeFormModal();
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setFormError(extractErrorMessage(requestError, 'Unable to save subject data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Manage subject offerings and course catalog</p>
        </div>
        <button className="primary-btn" onClick={openCreateModal}>
          <BookPlus size={18} />
          Add Subject
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by subject name or code..."
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
              <th>Subject Name</th>
              <th>Department</th>
              <th>Units</th>
              <th>Semester</th>
              <th>Instructor</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="table-placeholder">
                  Loading subjects...
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-placeholder">
                  No subjects found for the current filters.
                </td>
              </tr>
            ) : (
              subjects.map((subject, index) => (
                <motion.tr
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="font-weight-bold">{subject.code}</td>
                  <td>{subject.name}</td>
                  <td>{subject.department}</td>
                  <td>{subject.units}</td>
                  <td>{subject.semester}</td>
                  <td>{subject.instructor}</td>
                  <td>{subject.enrolledStudents}</td>
                  <td>
                    <span className={`status-badge ${subject.statusTone}`}>{subject.statusLabel}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-view" onClick={() => handleViewSubject(subject)}>
                        View
                      </button>
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(subject)}>
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
          Showing {showingFrom}-{showingTo} of {pagination.total} subjects
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
        title="Subject Details"
        size="medium"
      >
        {selectedSubject && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Subject Code</span>
                <span className="modal-info-value">{selectedSubject.code}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Subject Name</span>
                <span className="modal-info-value">{selectedSubject.name}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Department</span>
                <span className="modal-info-value">{selectedSubject.department}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Units</span>
                <span className="modal-info-value">{selectedSubject.units} units</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Instructor</span>
                <span className="modal-info-value">{selectedSubject.instructor}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Students</span>
                <span className="modal-info-value">{selectedSubject.enrolledStudents}</span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Description</label>
              <textarea readOnly value={selectedSubject.description} />
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button className="modal-btn modal-btn-primary" onClick={() => openEditModal(selectedSubject)}>
                Edit Subject
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        size="medium"
      >
        <form onSubmit={handleSubmitSubject}>
          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="code">Subject Code</label>
              <input
                id="code"
                name="code"
                type="text"
                value={subjectForm.code}
                onChange={handleSubjectFormChange}
                placeholder="CS101"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="name">Subject Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={subjectForm.name}
                onChange={handleSubjectFormChange}
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
                value={subjectForm.department}
                onChange={handleSubjectFormChange}
                placeholder="Computer Science"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="units">Units</label>
              <input
                id="units"
                name="units"
                type="number"
                min="0"
                value={subjectForm.units}
                onChange={handleSubjectFormChange}
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label htmlFor="semester">Semester</label>
              <input
                id="semester"
                name="semester"
                type="text"
                value={subjectForm.semester}
                onChange={handleSubjectFormChange}
                placeholder="1st Semester"
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={subjectForm.status}
                onChange={handleSubjectFormChange}
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
              value={subjectForm.instructor}
              onChange={handleSubjectFormChange}
              placeholder="Prof. Juan Dela Cruz"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={subjectForm.description}
              onChange={handleSubjectFormChange}
              placeholder="Subject overview"
            />
          </div>

          {formError ? <p className="modal-form-error">{formError}</p> : null}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-secondary" onClick={closeFormModal}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectList;
