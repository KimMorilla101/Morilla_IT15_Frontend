import { useEffect, useState } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { login } from '../../services/authApi';
import '../../styles/LoginPage.css';

const validateFields = (email, password) => {
  const errors = {
    email: '',
    password: '',
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
};

const Login = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordShown, setPasswordShown] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    // If user arrives at login via browser back/forward navigation,
    // force a fresh auth cycle before protected pages can be opened again.
    if (navigationType === 'POP') {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userId');
    }
  }, [navigationType]);

  const updateFieldErrors = (nextEmail, nextPassword) => {
    const validationResult = validateFields(nextEmail, nextPassword);
    setFieldErrors(validationResult);
    return validationResult;
  };

  const handleBlur = (field) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    updateFieldErrors(email, password);
  };

  const togglePassword = () => {
    setPasswordShown((previous) => !previous);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const validationResult = updateFieldErrors(email, password);
    setTouched({ email: true, password: true });

    if (validationResult.email || validationResult.password) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      let errorMessage = requestError.message;
      
      // If it's a network error, provide more helpful debugging info
      if (!errorMessage || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Backend server not responding. Make sure your Laravel server is running on http://127.0.0.1:8000';
      }
      
      setError(errorMessage);
      console.error('Login error:', requestError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />

      <div className="login-box">
        <div className="phoenix-container">
          <Phoenix eyesClosed={isPasswordFocused} />
        </div>

        <h2>
          Enrollment <span>Login</span>
        </h2>
        <p className="welcome-text">Welcome Back!</p>
        <p className="sub-text">Sign in to access the enrollment portal</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                updateFieldErrors(event.target.value, password);
              }}
              onBlur={() => handleBlur('email')}
              placeholder="student@gmail.com"
              aria-invalid={Boolean(touched.email && fieldErrors.email)}
              className={touched.email && fieldErrors.email ? 'input-error' : ''}
              required
            />
            {touched.email && fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={passwordShown ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                updateFieldErrors(email, event.target.value);
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => {
                setIsPasswordFocused(false);
                handleBlur('password');
              }}
              placeholder="••••••••"
              aria-invalid={Boolean(touched.password && fieldErrors.password)}
              className={touched.password && fieldErrors.password ? 'input-error' : ''}
              required
            />

            <div className="checkbox-container">
              <input
                type="checkbox"
                id="showPassword"
                checked={passwordShown}
                onChange={togglePassword}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>

            {touched.password && fieldErrors.password ? (
              <p className="field-error">{fieldErrors.password}</p>
            ) : null}
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login to Portal'}
          </button>

          {error ? <p className="form-error-message">{error}</p> : null}
        </form>
      </div>
    </div>
  );
};

const Phoenix = ({ eyesClosed }) => (
  <svg width="80" height="80" viewBox="0 0 100 100" className="phoenix-svg" aria-hidden="true">
    <path
      d="M50 15 C25 15 10 40 10 65 C10 80 50 95 50 85 C50 95 90 80 90 65 C90 40 75 15 50 15Z"
      fill="#800000"
    />
    <ellipse cx="40" cy="45" rx="3" ry={eyesClosed ? 0.5 : 3} fill="white" />
    <ellipse cx="60" cy="45" rx="3" ry={eyesClosed ? 0.5 : 3} fill="white" />
    <path d="M48 52 L52 52 L50 60 Z" fill="#FFD700" />
  </svg>
);

export default Login;
