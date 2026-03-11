import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Mail } from 'lucide-react';
import Modal from '../components/Modal';
import { studentsData } from '../data/mockData';
import '../styles/Pages.css';

const Students = () => {
  const [students] = useState(studentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const programs = ['All', ...new Set(students.map((student) => student.program))];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm);
    const matchesProgram = filterProgram === 'All' || student.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage student records and information</p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            alert('Add New Student form will open. This will connect to Laravel API POST /api/students')
          }
        >
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterProgram} onChange={(event) => setFilterProgram(event.target.value)}>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Year</th>
              <th>Units</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
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
                <td>{student.program}</td>
                <td>{student.year}</td>
                <td>{student.enrolledUnits}</td>
                <td>
                  <span className={`status-badge ${student.status.toLowerCase()}`}>{student.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-sm btn-view" onClick={() => handleViewStudent(student)}>
                      View
                    </button>
                    <button
                      className="btn-sm btn-edit"
                      onClick={() =>
                        alert(
                          `Edit functionality for ${student.name} will be connected to Laravel API PUT /api/students/${student.id}`,
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
          Showing {filteredStudents.length} of {students.length} students
        </span>
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
                <span className="modal-info-label">Program</span>
                <span className="modal-info-value">{selectedStudent.program}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Year Level</span>
                <span className="modal-info-value">Year {selectedStudent.year}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Units</span>
                <span className="modal-info-value">{selectedStudent.enrolledUnits} units</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Status</span>
                <span className={`modal-badge ${selectedStudent.status.toLowerCase()}`}>
                  {selectedStudent.status}
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
                    `Edit ${selectedStudent.name} - Laravel API: PUT /api/students/${selectedStudent.id}`,
                  )
                }
              >
                Edit Student
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Students;
