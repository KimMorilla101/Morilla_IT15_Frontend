const termStyles = {
  Semester: { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
  Term: { background: 'rgba(251, 191, 36, 0.1)', color: '#d97706' },
  Both: { background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary-maroon)' }
};

const formatList = (items) => {
  if (!items || items.length === 0) return 'none';
  return items.join(', ');
};

const CourseDetails = ({ course }) => {
  if (!course) return null;

  const termStyle = termStyles[course.termType] || termStyles.Semester;

  return (
    <>
      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Course Code</span>
          <span className="modal-info-value">{course.code}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Units</span>
          <span className="modal-info-value">{course.units}</span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Course Title</label>
        <input type="text" value={course.title} readOnly />
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Semester/Term</span>
          <span className="modal-info-value">{course.semester}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Offer Type</span>
          <span style={{ ...termStyle, padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
            {course.termType}
          </span>
        </div>
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Pre-requisites</span>
          <span className="modal-info-value">{formatList(course.preReqs)}</span>
        </div>
        <div className="modal-info-item">
          <span className="modal-info-label">Co-requisites</span>
          <span className="modal-info-value">{formatList(course.coReqs)}</span>
        </div>
      </div>

      <div className="modal-form-group">
        <label>Description</label>
        <textarea value={course.description} readOnly />
      </div>

      <div className="modal-info-grid">
        <div className="modal-info-item">
          <span className="modal-info-label">Program Assignment</span>
          <span className="modal-info-value">{course.programName}</span>
        </div>
      </div>
    </>
  );
};

export default CourseDetails;
