const termStyles = {
  Semester: { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
  Term: { background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' },
  Both: { background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary-maroon)' }
};

const CourseCard = ({ course, onView }) => {
  const termStyle = termStyles[course.termType] || termStyles.Semester;

  return (
    <div className="course-card">
      <div className="course-header">
        <h3>{course.code}</h3>
        <span style={{ ...termStyle, padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
          {course.termType}
        </span>
      </div>
      <h4>{course.title}</h4>

      <div className="course-details">
        <div className="detail-row">
          <span className="label">Units:</span>
          <span className="value">{course.units}</span>
        </div>
        <div className="detail-row">
          <span className="label">Semester/Term:</span>
          <span className="value">{course.semester}</span>
        </div>
        <div className="detail-row">
          <span className="label">Program:</span>
          <span className="value">{course.programName}</span>
        </div>
      </div>

      <div className="course-actions">
        <button className="btn-outline" onClick={() => onView(course)}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
