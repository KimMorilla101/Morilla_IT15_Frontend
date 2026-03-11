import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookPlus } from 'lucide-react';
import Modal from './Modal';
import { programsData } from '../data/mockData';
import '../styles/Pages.css';

const ProgramList = () => {
  const [programs] = useState(programsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const departments = ['All', ...new Set(programs.map((program) => program.department))];

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || program.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleViewProgram = (program) => {
    setSelectedProgram(program);
    setShowViewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Programs</h1>
          <p>Manage academic programs and curriculum structure</p>
        </div>
        <button className="primary-btn" onClick={() => alert('Add Program functionality will be connected to Laravel API')}>
          <BookPlus size={18} />
          Add Program
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by program name or code..."
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
              <th>Program Name</th>
              <th>Department</th>
              <th>Duration</th>
              <th>Total Units</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((program, index) => (
              <motion.tr
                key={program.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="font-weight-bold">{program.code}</td>
                <td>{program.name}</td>
                <td>{program.department}</td>
                <td>{program.duration}</td>
                <td>{program.totalUnits}</td>
                <td>{program.studentCount}</td>
                <td>
                  <span className={`status-badge ${program.status.toLowerCase()}`}>{program.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-sm btn-view" onClick={() => handleViewProgram(program)}>
                      View
                    </button>
                    <button
                      className="btn-sm btn-edit"
                      onClick={() =>
                        alert(
                          `Edit functionality for ${program.name} will be connected to Laravel API PUT /api/programs/${program.id}`,
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
          Showing {filteredPrograms.length} of {programs.length} programs
        </span>
      </div>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Program Details"
        size="medium"
      >
        {selectedProgram && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Program Code</span>
                <span className="modal-info-value">{selectedProgram.code}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Program Name</span>
                <span className="modal-info-value">{selectedProgram.name}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Department</span>
                <span className="modal-info-value">{selectedProgram.department}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Duration</span>
                <span className="modal-info-value">{selectedProgram.duration}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Total Units</span>
                <span className="modal-info-value">{selectedProgram.totalUnits} units</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Students</span>
                <span className="modal-info-value">{selectedProgram.studentCount}</span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Description</label>
              <textarea readOnly value={selectedProgram.description} />
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() =>
                  alert(
                    `Edit ${selectedProgram.name} - Laravel API: PUT /api/programs/${selectedProgram.id}`,
                  )
                }
              >
                Edit Program
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProgramList;
