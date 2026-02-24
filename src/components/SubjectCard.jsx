const termStyles = {
  Semester: { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
  Term: { background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' },
  Both: { background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary-maroon)' }
};

const SubjectCard = ({ subject, onView }) => {
  const termStyle = termStyles[subject.termType] || termStyles.Semester;

  return (
    <div className="course-card">
      <div className="course-header">
        <h3>{subject.code}</h3>
        <span style={{ ...termStyle, padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
          {subject.termType}
        </span>
      </div>
      <h4>{subject.title}</h4>

      <div className="course-details">
        <div className="detail-row">
          <span className="label">Units:</span>
          <span className="value">{subject.units}</span>
        </div>
        <div className="detail-row">
          <span className="label">Semester/Term:</span>
          <span className="value">{subject.semester}</span>
        </div>
        <div className="detail-row">
          <span className="label">Program:</span>
          <span className="value">{subject.programName}</span>
        </div>
      </div>

      <div className="course-actions">
        <button className="btn-outline" onClick={() => onView(subject)}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
