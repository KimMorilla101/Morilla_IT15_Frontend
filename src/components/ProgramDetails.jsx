const getStatusClass = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'active';
  if (normalized.includes('phased')) return 'inactive';
  return 'pending';
};

const ProgramDetails = ({ program, subjectsByCode }) => {
  if (!program) return null;

  return (
    <>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Program Code</span>
          <span className="modal-info-value">{program.code}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Status</span>
          <span className={`modal-badge ${getStatusClass(program.status)}`}>
            {program.status}
          </span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Program Name</label>
        <input type="text" value={program.name} readOnly />
      </div>

      <div className="modal-form-group">
        <label>Description</label>
        <textarea value={program.description} readOnly />
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Type</span>
          <span className="modal-info-value">{program.type}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Duration</span>
          <span className="modal-info-value">{program.duration}</span>
        </div>
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Total Units</span>
          <span className="modal-info-value">{program.totalUnits}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Year Levels</span>
          <span className="modal-info-value">{program.yearLevels.length}</span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Subjects by Year Level</label>
        {program.yearLevels.map((level) => (
          <div key={level.year} style={{ marginBottom: '12px' }}>
            <strong>{level.year}</strong>
            <div style={{ marginTop: '8px' }}>
              {level.subjects.map((subjectCode) => (
                <div key={subjectCode} style={{ fontSize: '14px', marginBottom: '6px' }}>
                  {subjectCode} - {subjectsByCode[subjectCode]?.title || 'TBD'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProgramDetails;
