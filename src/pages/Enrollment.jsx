import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { enrollmentData } from '../data/mockData';
import '../styles/Pages.css';

const Enrollment = () => {
  const [enrollments] = useState(enrollmentData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.studentId.includes(searchTerm) ||
      enrollment.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subjectName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowViewModal(true);
  };

  const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === 'Enrolled').length;
  const pendingEnrollments = enrollments.filter((enrollment) => enrollment.status === 'Pending').length;
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
          onClick={() =>
            alert('New Enrollment form will open. This will connect to Laravel API POST /api/enrollments')
          }
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
            {filteredEnrollments.map((enrollment, index) => (
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
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${enrollment.status.toLowerCase()}`}>{enrollment.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-sm btn-view" onClick={() => handleViewEnrollment(enrollment)}>
                      View
                    </button>
                    <button
                      className="btn-sm btn-edit"
                      onClick={() =>
                        alert(
                          `Manage enrollment for ${enrollment.studentName} will be connected to Laravel API PUT /api/enrollments/${enrollment.id}`,
                        )
                      }
                    >
                      Manage
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
          Showing {filteredEnrollments.length} of {enrollments.length} enrollments
        </span>
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
                <span className={`modal-badge ${selectedEnrollment.status.toLowerCase()}`}>
                  {selectedEnrollment.status}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() =>
                  alert(
                    `Manage enrollment - Laravel API: PUT /api/enrollments/${selectedEnrollment.id}`,
                  )
                }
              >
                Manage Enrollment
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Enrollment;
