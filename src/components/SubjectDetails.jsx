const termStyles = {
  Semester: { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
  Term: { background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' },
  Both: { background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary-maroon)' }
};

const formatList = (items) => {
  if (!items || items.length === 0) return 'none';
  return items.join(', ');
};

const SubjectDetails = ({ subject }) => {
  if (!subject) return null;

  const termStyle = termStyles[subject.termType] || termStyles.Semester;

  return (
    <>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Subject Code</span>
          <span className="modal-info-value">{subject.code}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Units</span>
          <span className="modal-info-value">{subject.units}</span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Subject Title</label>
        <input type="text" value={subject.title} readOnly />
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Semester/Term</span>
          <span className="modal-info-value">{subject.semester}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Offer Type</span>
          <span style={{ ...termStyle, padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
            {subject.termType}
          </span>
        </div>
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Pre-requisites</span>
          <span className="modal-info-value">{formatList(subject.preReqs)}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Co-requisites</span>
          <span className="modal-info-value">{formatList(subject.coReqs)}</span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Description</label>
        <textarea value={subject.description} readOnly />
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Program Assignment</span>
          <span className="modal-info-value">{subject.programName}</span>
        </div>
      </div>
    </>
  );
};

export default SubjectDetails;
