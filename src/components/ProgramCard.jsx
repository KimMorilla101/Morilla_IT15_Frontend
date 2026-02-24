const getStatusClass = (status) => {
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'active';
  if (normalized.includes('phased')) return 'inactive';
  return 'pending';
};

const ProgramCard = ({ program, onView }) => {
  return (
    <div className="course-card">
      <div className="course-header">
        <h3>{program.code}</h3>
        <span className={`status-badge ${getStatusClass(program.status)}`}>
          {program.status}
        </span>
      </div>
      <h4>{program.name}</h4>

      <div className="course-details">
        <div className="detail-row">
          <span className="label">Type:</span>
          <span className="value">{program.type}</span>
        </div>
        <div className="detail-row">
          <span className="label">Duration:</span>
          <span className="value">{program.duration}</span>
        </div>
        <div className="detail-row">
          <span className="label">Total Units:</span>
          <span className="value">{program.totalUnits}</span>
        </div>
      </div>

      <div className="course-actions">
        <button className="btn-outline" onClick={() => onView(program)}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProgramCard;
