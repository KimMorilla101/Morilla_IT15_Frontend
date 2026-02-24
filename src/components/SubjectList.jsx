import { useMemo, useState } from 'react';
import { BookPlus } from 'lucide-react';
import Modal from './Modal';
import FilterBar from './FilterBar';
import SubjectCard from './SubjectCard';
import SubjectDetails from './SubjectDetails';
import { subjectsData } from '../data/mockData';
import '../styles/Pages.css';

const SubjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All Semesters');
  const [offeringFilter, setOfferingFilter] = useState('All Offerings');
  const [unitsFilter, setUnitsFilter] = useState('All Units');
  const [prereqFilter, setPrereqFilter] = useState('All Options');
  const [programFilter, setProgramFilter] = useState('All Programs');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [formValues, setFormValues] = useState({
    code: '',
    title: '',
    units: '',
    termType: 'Semester',
    semester: '',
    programName: '',
    description: '',
    preReqs: '',
    coReqs: ''
  });

  const programOptions = useMemo(() => {
    const programs = new Set(subjectsData.map((subject) => subject.programName));
    return ['All Programs', ...Array.from(programs)];
  }, []);

  const unitsOptions = useMemo(() => {
    const units = new Set(subjectsData.map((subject) => subject.units));
    return ['All Units', ...Array.from(units).sort((a, b) => a - b).map(String)];
  }, []);

  const filteredSubjects = subjectsData.filter((subject) => {
    const matchesSearch =
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      semesterFilter === 'All Semesters' || subject.semester === semesterFilter;
    const matchesOffering =
      offeringFilter === 'All Offerings' || subject.termType === offeringFilter;
    const matchesUnits = unitsFilter === 'All Units' || String(subject.units) === unitsFilter;
    const hasPrereq = subject.preReqs.length > 0;
    const matchesPrereq =
      prereqFilter === 'All Options' ||
      (prereqFilter === 'With' && hasPrereq) ||
      (prereqFilter === 'Without' && !hasPrereq);
    const matchesProgram = programFilter === 'All Programs' || subject.programName === programFilter;

    return (
      matchesSearch &&
      matchesSemester &&
      matchesOffering &&
      matchesUnits &&
      matchesPrereq &&
      matchesProgram
    );
  });

  const filters = [
    {
      id: 'semester',
      label: 'Filter by semester',
      title: 'Semester',
      value: semesterFilter,
      onChange: setSemesterFilter,
      options: [
        { label: 'All Semesters', value: 'All Semesters' },
        { label: '1st Semester', value: '1st Semester' },
        { label: '2nd Semester', value: '2nd Semester' },
        { label: 'Midyear Term', value: 'Midyear Term' }
      ]
    },
    {
      id: 'offering',
      label: 'Filter by offering',
      title: 'Offering',
      value: offeringFilter,
      onChange: setOfferingFilter,
      options: [
        { label: 'All Offerings', value: 'All Offerings' },
        { label: 'Semester', value: 'Semester' },
        { label: 'Term', value: 'Term' },
        { label: 'Both', value: 'Both' }
      ]
    },
    {
      id: 'units',
      label: 'Filter by units',
      title: 'Units',
      value: unitsFilter,
      onChange: setUnitsFilter,
      options: unitsOptions.map((units) => ({ label: units, value: units }))
    },
    {
      id: 'prereq',
      label: 'Filter by prerequisites',
      title: 'Pre-requisites',
      value: prereqFilter,
      onChange: setPrereqFilter,
      options: [
        { label: 'All Options', value: 'All Options' },
        { label: 'With prerequisites', value: 'With' },
        { label: 'Without prerequisites', value: 'Without' }
      ]
    }
  ];

  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setShowDetailsModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Subject Offerings</h1>
          <p>Track subject availability across semesters and terms</p>
        </div>
        <button className="primary-btn" onClick={() => setShowFormModal(true)}>
          <BookPlus size={18} />
          Add Subject
        </button>
      </div>

      <h2>Subject Listing</h2>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchTitle="Search"
        searchPlaceholder="Search by subject code or title..."
        filters={filters}
      />

      <div className="courses-grid">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} onView={handleViewSubject} />
        ))}
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Subject Details"
        size="medium"
      >
        <SubjectDetails subject={selectedSubject} />
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
          <button
            className="modal-btn modal-btn-primary"
            onClick={() => alert('Subject edit form (design only).')}
          >
            Edit Subject
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title="Add Subject"
        size="medium"
      >
        <div className="modal-form-group">
          <label>Subject Code</label>
          <input
            type="text"
            placeholder="e.g., IT101"
            value={formValues.code}
            onChange={(event) => handleFormChange('code', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Subject Title</label>
          <input
            type="text"
            placeholder="Subject title"
            value={formValues.title}
            onChange={(event) => handleFormChange('title', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Units</label>
          <input
            type="number"
            placeholder="Units"
            value={formValues.units}
            onChange={(event) => handleFormChange('units', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Offer Type</label>
          <select
            value={formValues.termType}
            onChange={(event) => handleFormChange('termType', event.target.value)}
          >
            <option value="Semester">Semester</option>
            <option value="Term">Term</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div className="modal-form-group">
          <label>Semester/Term</label>
          <input
            type="text"
            placeholder="e.g., 1st Semester"
            value={formValues.semester}
            onChange={(event) => handleFormChange('semester', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Program</label>
          <input
            type="text"
            placeholder="Assigned program"
            value={formValues.programName}
            onChange={(event) => handleFormChange('programName', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Description</label>
          <textarea
            placeholder="Brief subject description"
            value={formValues.description}
            onChange={(event) => handleFormChange('description', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Pre-requisites</label>
          <input
            type="text"
            placeholder="e.g., IT101"
            value={formValues.preReqs}
            onChange={(event) => handleFormChange('preReqs', event.target.value)}
          />
        </div>
        <div className="modal-form-group">
          <label>Co-requisites</label>
          <input
            type="text"
            placeholder="e.g., CS201"
            value={formValues.coReqs}
            onChange={(event) => handleFormChange('coReqs', event.target.value)}
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
              alert('Subject form submission is design only.');
              setShowFormModal(false);
            }}
          >
            Save Subject
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectList;
