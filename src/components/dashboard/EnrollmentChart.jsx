import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardContext } from './DashboardContext';
import { ChartSkeleton } from '../common/LoadingSpinner';

const EnrollmentChart = () => {
  const { data, isLoading, error, retry } = useDashboardContext();
  const chartData = data?.monthlyEnrollment || [];

  return (
    <div className="chart-card">
      <h2>Monthly Enrollment Trends</h2>

      {isLoading ? (
        <ChartSkeleton />
      ) : error ? (
        <div className="chart-error" role="alert">
          <p>{error}</p>
          <button type="button" className="chart-retry-btn" onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 0, 0, 0.1)" />
            <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(128, 0, 0, 0.1)',
                borderRadius: '10px',
              }}
            />
            <Bar dataKey="enrollments" fill="#800000" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EnrollmentChart;
