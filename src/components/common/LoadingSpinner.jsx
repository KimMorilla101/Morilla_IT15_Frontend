import '../../styles/Common.css';

const LoadingSpinner = ({ label = 'Loading...', compact = false }) => {
  return (
    <div className={`loading-spinner ${compact ? 'compact' : ''}`} role="status" aria-live="polite">
      <span className="loading-spinner-circle" />
      <span className="loading-spinner-label">{label}</span>
    </div>
  );
};

export const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`loading-skeleton ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={`skeleton-line-${index}`} className="skeleton-line" />
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="chart-skeleton" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={`chart-bar-${index}`}
          className="chart-skeleton-bar"
          style={{ height: `${35 + (index % 4) * 12}%` }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
