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

  const filteredEnrollments = enrollments.filter(enrollment => {
    return enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           enrollment.studentId.includes(searchTerm) ||
           enrollment.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Enrolled': return 'active';
      case 'Pending': return 'pending';
      case 'Dropped': return 'inactive';
      default: return '';
    }
  };

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowViewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Enrollment</h1>
          <p>Manage student course enrollments</p>
        </div>
        <button 
          className="primary-btn"
          onClick={() => alert('Create New Enrollment form will open. This will connect to Laravel API POST /api/enrollments')}
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="enrollment-stats">
        <div className="stat-item">
          <h3>{enrollments.filter(e => e.status === 'Enrolled').length}</h3>
          <p>Active Enrollments</p>
        </div>
        <div className="stat-item">
          <h3>{enrollments.filter(e => e.status === 'Pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-item">
          <h3>{enrollments.reduce((sum, e) => sum + e.units, 0)}</h3>
          <p>Total Units</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course Code</th>
              <th>Course Name</th>
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
                <td className="font-weight-bold">{enrollment.courseCode}</td>
                <td>{enrollment.courseName}</td>
                <td>{enrollment.units}</td>
                <td>{enrollment.semester}</td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    {new Date(enrollment.date).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => handleViewEnrollment(enrollment)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-sm btn-edit"
                      onClick={() => alert(`Managing enrollment for ${enrollment.studentName}. Options: Approve, Drop, or Modify\nLaravel API: PUT /api/enrollments/${enrollment.id}`)}
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
                <span className="modal-info-label">Course Code</span>
                <span className="modal-info-value">{selectedEnrollment.courseCode}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Units</span>
                <span className="modal-info-value">{selectedEnrollment.units} units</span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Course Name</label>
              <input type="text" value={selectedEnrollment.courseName} readOnly />
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Semester</span>
                <span className="modal-info-value">{selectedEnrollment.semester}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrollment Date</span>
                <span className="modal-info-value">
                  {new Date(selectedEnrollment.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Status</span>
                <span className={`modal-badge ${getStatusColor(selectedEnrollment.status)}`}>
                  {selectedEnrollment.status}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              {selectedEnrollment.status === 'Pending' && (
                <button
                  className="modal-btn modal-btn-primary"
                  onClick={() => {
                    alert(`Approving enrollment for ${selectedEnrollment.studentName}\nLaravel API: PUT /api/enrollments/${selectedEnrollment.id}`);
                    setShowViewModal(false);
                  }}
                >
                  Approve Enrollment
                </button>
              )}
              {selectedEnrollment.status === 'Enrolled' && (
                <button
                  className="modal-btn modal-btn-primary"
                  onClick={() => {
                    alert(`Managing enrollment: ${selectedEnrollment.courseCode}\nOptions: Drop, Modify Schedule\nLaravel API: PUT/DELETE /api/enrollments/${selectedEnrollment.id}`);
                  }}
                >
                  Manage
                </button>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Enrollment;
