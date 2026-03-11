import { Component } from 'react';
import '../../styles/Common.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-boundary" role="alert">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || 'An unexpected application error occurred.'}</p>
          <button type="button" onClick={this.handleReset} className="error-boundary-retry">
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
