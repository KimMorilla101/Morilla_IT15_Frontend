import { useMemo, useState } from 'react';
import { BookPlus } from 'lucide-react';
import Modal from './Modal';
import FilterBar from './FilterBar';
import ProgramCard from './ProgramCard';
import ProgramDetails from './ProgramDetails';
import { programsData, subjectsData } from '../data/mockData';
import '../styles/Pages.css';

const ProgramList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [formValues, setFormValues] = useState({
    code: '',
    name: '',
    type: "Bachelor's",
    duration: '4 years',
    totalUnits: '',
    status: 'Active',
    description: ''
  });

  const programTypes = useMemo(() => {
    const types = new Set(programsData.map((program) => program.type));
    return ['All', ...Array.from(types)];
  }, []);

  const statusOptions = ['All Statuses', 'Active', 'Under Review', 'Phased Out'];

  const subjectsByCode = useMemo(() => {
    return subjectsData.reduce((lookup, subject) => {
      lookup[subject.code] = subject;
      return lookup;
    }, {});
  }, []);

  const filteredPrograms = programsData.filter((program) => {
    const matchesSearch =
      program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || program.status === statusFilter;
    const matchesType = typeFilter === 'All' || program.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const filters = [
    {
      id: 'status',
      label: 'Filter by status',
      title: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions.map((status) => ({ label: status, value: status }))
    },
    {
      id: 'type',
      label: 'Filter by type',
      title: 'Program Type',
      value: typeFilter,
      onChange: setTypeFilter,
      options: programTypes.map((type) => ({ label: type, value: type }))
    }
  ];

  const handleViewProgram = (program) => {
    setSelectedProgram(program);
    setShowDetailsModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Program Offerings</h1>
          <p>Review program availability, status, and curriculum structure</p>
        </div>
        <button className="primary-btn" onClick={() => setShowFormModal(true)}>
          <BookPlus size={18} />
          Add Program
        </button>
      </div>

      <h2>Program Listing</h2>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchTitle="Search"
        searchPlaceholder="Search by program code or name..."
        filters={filters}
      />

      <div className="courses-grid">
        {filteredPrograms.map((program) => (
          <ProgramCard key={program.id} program={program} onView={handleViewProgram} />
        ))}
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Program Details"
        size="large"
      >
        <ProgramDetails program={selectedProgram} subjectsByCode={subjectsByCode} />
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
          <button
            className="modal-btn modal-btn-primary"
            onClick={() => alert('Edit program form (design only).')}
          >
            Edit Program
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Add Program"
        size="medium"
      >
        <div className="modal-form-group">
          <label>Program Code</label>
          <input
            type="text"
            placeholder="e.g., BSIT"
            value={formValues.code}
            onChange={(event) => handleFormChange('code', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Program Name</label>
          <input
            type="text"
            placeholder="Program name"
            value={formValues.name}
            onChange={(event) => handleFormChange('name', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Program Type</label>
          <select
            value={formValues.type}
            onChange={(event) => handleFormChange('type', event.target.value)}
          >
            <option value="Bachelor's">Bachelor's</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
          </select>
        </div>
        <div className="modal-form-group">
          <label>Duration</label>
          <input
            type="text"
            placeholder="e.g., 4 years"
            value={formValues.duration}
            onChange={(event) => handleFormChange('duration', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Total Units</label>
          <input
            type="number"
            placeholder="Total units"
            value={formValues.totalUnits}
            onChange={(event) => handleFormChange('totalUnits', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Status</label>
          <select
            value={formValues.status}
            onChange={(event) => handleFormChange('status', event.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Phased Out">Phased Out</option>
          </select>
        </div>
        <div className="modal-form-group">
          <label>Description</label>
          <textarea
            placeholder="Brief program description"
            value={formValues.description}
            onChange={(event) => handleFormChange('description', event.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowFormModal(false)}
          >
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-primary"
            onClick={() => {
              alert('Program form submission is design only.');
              setShowFormModal(false);
            }}
          >
            Save Program
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramList;
