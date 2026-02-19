import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    program: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.studentId && formData.password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', formData.studentId);
      navigate('/dashboard');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert(`Registration successful for ${registerData.firstName} ${registerData.lastName}!\nStudent ID: ${registerData.studentId}\n\nIn production, this will call Laravel API: POST /api/auth/register`);
    setShowRegisterModal(false);
    setRegisterData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      program: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <>
      <div className="login-container">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="login-box"
        >
          <div className="phoenix-container">
            <Phoenix eyesClosed={isPasswordFocused} />
          </div>

          <h2>Enrollment <span>Login</span></h2>
          <p className="welcome-text">Welcome Back!</p>
          <p className="sub-text">Sign in to access the enrollment portal</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g. 2024-0001"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login-button">Login to Portal</button>
          </form>

          <p className="footer-text">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowRegisterModal(true); }}>
              Register for Enrollment
            </a>
          </p>
        </motion.div>
      </div>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register for Enrollment"
        size="medium"
      >
        <form onSubmit={handleRegisterSubmit}>
          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={registerData.studentId}
                onChange={handleRegisterChange}
                placeholder="e.g. 2024-0001"
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="student@email.com"
                required
              />
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={registerData.firstName}
                onChange={handleRegisterChange}
                placeholder="Juan"
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={registerData.lastName}
                onChange={handleRegisterChange}
                placeholder="Dela Cruz"
                required
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Program</label>
            <select
              name="program"
              value={registerData.program}
              onChange={handleRegisterChange}
              required
            >
              <option value="">Select Program</option>
              <option value="BS Computer Science">BS Computer Science</option>
              <option value="BS Information Technology">BS Information Technology</option>
              <option value="BS Computer Engineering">BS Computer Engineering</option>
            </select>
          </div>

          <div className="modal-info-grid">
            <div className="modal-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowRegisterModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Register
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const Phoenix = ({ eyesClosed }) => (
  <svg width="80" height="80" viewBox="0 0 100 100" className="phoenix-svg">
    <path d="M50 15 C25 15 10 40 10 65 C10 80 50 95 50 85 C50 95 90 80 90 65 C90 40 75 15 50 15Z" fill="#800000" />
    <motion.ellipse 
      cx="40" cy="45" rx="3" 
      animate={{ ry: eyesClosed ? 0.5 : 3 }} 
      fill="white" 
    />
    <motion.ellipse 
      cx="60" cy="45" rx="3" 
      animate={{ ry: eyesClosed ? 0.5 : 3 }} 
      fill="white" 
    />
    <path d="M48 52 L52 52 L50 60 Z" fill="#FFD700" />
  </svg>
);

export default LoginPage;
