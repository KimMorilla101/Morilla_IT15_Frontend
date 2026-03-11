import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookPlus } from 'lucide-react';
import Modal from './Modal';
import { subjectsData } from '../data/mockData';
import '../styles/Pages.css';

const SubjectList = () => {
  const [subjects] = useState(subjectsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const departments = ['All', ...new Set(subjects.map((subject) => subject.department))];

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || subject.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Manage subject offerings and course catalog</p>
        </div>
        <button className="primary-btn" onClick={() => alert('Add Subject functionality will be connected to Laravel API')}>
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
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

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
            {filteredSubjects.map((subject, index) => (
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
                  <span className={`status-badge ${subject.status.toLowerCase()}`}>{subject.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-sm btn-view" onClick={() => handleViewSubject(subject)}>
                      View
                    </button>
                    <button
                      className="btn-sm btn-edit"
                      onClick={() =>
                        alert(
                          `Edit functionality for ${subject.name} will be connected to Laravel API PUT /api/subjects/${subject.id}`,
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </span>
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
              <button
                className="modal-btn modal-btn-primary"
                onClick={() =>
                  alert(
                    `Edit ${selectedSubject.name} - Laravel API: PUT /api/subjects/${selectedSubject.id}`,
                  )
                }
              >
                Edit Subject
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SubjectList;
