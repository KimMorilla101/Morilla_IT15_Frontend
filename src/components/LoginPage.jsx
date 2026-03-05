import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);


  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };


  const handleLogin = async(e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try{
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials, please try again.");
      }
    } catch (error) {
      setError("Login failed. Please check your connection and try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

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

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type={passwordShown ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="••••••••"
                required
              />
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={passwordShown}
                  onChange={togglePassword}
                />
                <label htmlFor="showPassword">
                  Show Password
                </label>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login to Portal'}
            </button>

            {error && (
              <p style={{ color: '#800000', marginTop: '12px', fontSize: '14px' }}>
                {error}
              </p>
            )}
          </form>
        </motion.div>
      </div>
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