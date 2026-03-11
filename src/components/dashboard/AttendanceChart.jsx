import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardContext } from './DashboardContext';
import { ChartSkeleton } from '../common/LoadingSpinner';

const AttendanceChart = () => {
  const { data, isLoading, error, retry } = useDashboardContext();
  const chartData = data?.attendancePattern || [];

  return (
    <div className="chart-card">
      <h2>Attendance Over School Days</h2>

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
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 0, 0, 0.1)" />
            <XAxis dataKey="day" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis domain={[75, 100]} stroke="#666" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid rgba(128, 0, 0, 0.1)',
                borderRadius: '10px',
              }}
              formatter={(value) => [`${value}%`, 'Attendance']}
            />
            <Line
              type="monotone"
              dataKey="attendanceRate"
              stroke="#800000"
              strokeWidth={3}
              dot={{ r: 4, fill: '#800000' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceChart;
