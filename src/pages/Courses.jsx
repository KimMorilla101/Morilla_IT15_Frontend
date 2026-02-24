import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { coursesData } from '../data/mockData';
import '../styles/Pages.css';

const Courses = () => {
  const [courses] = useState(coursesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const filteredCourses = courses.filter(course => {
    return course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Browse and manage available courses</p>
        </div>
        <button 
          className="primary-btn"
          onClick={() => alert('Add New Course form will open. This will connect to Laravel API POST /api/courses')}
        >
          <BookPlus size={18} />
          Add Course
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            className="course-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="course-header">
              <h3>{course.courseCode}</h3>
              <span className={`availability ${course.available > 0 ? 'available' : 'full'}`}>
                {course.available > 0 ? `${course.available} slots` : 'Full'}
              </span>
            </div>
            <h4>{course.title}</h4>
            
            <div className="course-details">
              <div className="detail-row">
                <span className="label">Units:</span>
                <span className="value">{course.units}</span>
              </div>
              <div className="detail-row">
                <span className="label">Instructor:</span>
                <span className="value">{course.instructor}</span>
              </div>
              <div className="detail-row">
                <span className="label">Schedule:</span>
                <span className="value">{course.schedule}</span>
              </div>
              <div className="detail-row">
                <span className="label">Capacity:</span>
                <span className="value">{course.enrolled}/{course.capacity}</span>
              </div>
            </div>

            <div className="course-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
              ></div>
            </div>

            <div className="course-actions">
              <button 
                className="btn-outline"
                onClick={() => handleViewCourse(course)}
              >
                View Details
              </button>
              <button 
                className="btn-primary" 
                disabled={course.available === 0}
                onClick={() => alert(course.available > 0 ? `Enrolling in ${course.courseCode}. This will connect to Laravel API POST /api/enrollments.` : `${course.courseCode} is full. Adding to waitlist...`)}
              >
                {course.available > 0 ? 'Enroll' : 'Waitlist'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Course Details"
        size="medium"
      >
        {selectedCourse && (
          <>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Course Code</span>
                <span className="modal-info-value">{selectedCourse.courseCode}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Units</span>
                <span className="modal-info-value">{selectedCourse.units} units</span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Course Title</label>
              <input type="text" value={selectedCourse.title} readOnly />
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Instructor</span>
                <span className="modal-info-value">{selectedCourse.instructor}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Schedule</span>
                <span className="modal-info-value">{selectedCourse.schedule}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Enrolled Students</span>
                <span className="modal-info-value">{selectedCourse.enrolled} / {selectedCourse.capacity}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Available Slots</span>
                <span className={`modal-badge ${selectedCourse.available > 0 ? 'active' : 'inactive'}`}>
                  {selectedCourse.available > 0 ? `${selectedCourse.available} slots` : 'Full'}
                </span>
              </div>
            </div>

            <div className="course-progress" style={{ margin: '20px 0' }}>
              <div 
                className="progress-bar" 
                style={{ width: `${(selectedCourse.enrolled / selectedCourse.capacity) * 100}%` }}
              ></div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="modal-btn modal-btn-primary"
                disabled={selectedCourse.available === 0}
                onClick={() => {
                  alert(`Enrolling in ${selectedCourse.courseCode}\nLaravel API: POST /api/enrollments`);
                  setShowViewModal(false);
                }}
              >
                {selectedCourse.available > 0 ? 'Enroll Now' : 'Join Waitlist'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
