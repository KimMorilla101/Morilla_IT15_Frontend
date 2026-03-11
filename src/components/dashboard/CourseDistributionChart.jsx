import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useDashboardContext } from './DashboardContext';
import { ChartSkeleton } from '../common/LoadingSpinner';

const CourseDistributionChart = () => {
  const { data, isLoading, error, retry } = useDashboardContext();
  const chartData = data?.courseDistribution || [];

  return (
    <div className="chart-card">
      <h2>Students Across Courses</h2>

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
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={96}
              paddingAngle={1}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={`course-distribution-${entry.name}`} fill={entry.color || '#800000'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(128, 0, 0, 0.1)',
                borderRadius: '10px',
              }}
              formatter={(value, _name, payload) => {
                const code = payload?.payload?.name || 'N/A';
                const fullName = payload?.payload?.fullName || 'Course';
                return [`${value} students`, `${code} - ${fullName}`];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CourseDistributionChart;
