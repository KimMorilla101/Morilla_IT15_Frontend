import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Users } from 'lucide-react';
import { fetchDashboardData } from '../../services/api';
import WeatherWidget from '../weather/WeatherWidget';
import EnrollmentChart from './EnrollmentChart';
import CourseDistributionChart from './CourseDistributionChart';
import AttendanceChart from './AttendanceChart';
import { DashboardProvider } from './DashboardContext';
import FloatingChat from '../FloatingChat';
import '../../styles/Dashboard.css';

const EMPTY_OVERVIEW = {
  studentsEnrolled: 0,
  coursesOffered: 0,
  schoolDays: 0,
  averageAttendance: 0,
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const responseData = await fetchDashboardData();
      setDashboardData(responseData);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to fetch dashboard analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const overview = dashboardData?.overview || EMPTY_OVERVIEW;

  const statCards = useMemo(
    () => [
      {
        title: 'Students Enrolled',
        value: overview.studentsEnrolled ?? overview.totalStudents,
        icon: Users,
        color: '#800000',
      },
      {
        title: 'Courses Offered',
        value: overview.coursesOffered ?? overview.totalCourses,
        icon: BookOpen,
        color: '#a00000',
      },
      {
        title: 'School Days',
        value: overview.schoolDays,
        icon: CalendarDays,
        color: '#c00000',
      },
      {
        title: 'Avg Attendance',
        value: overview.averageAttendance,
        icon: Clock3,
        color: '#d00000',
        format: (value) => `${Number(value || 0).toFixed(1)}%`,
      },
    ],
    [overview],
  );

  const contextValue = useMemo(
    () => ({
      data: dashboardData,
      isLoading,
      error,
      retry: loadDashboardData,
    }),
    [dashboardData, error, isLoading, loadDashboardData],
  );

  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <DashboardProvider value={contextValue}>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Enrollment trends, course distribution, attendance, and weather insights.</p>
          </div>

          <div className="current-date">
            <div className="date-text">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <span className="date-sub-text"></span>
          </div>
        </div>

        {error && !dashboardData ? (
          <div className="dashboard-inline-alert" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadDashboardData} className="chart-retry-btn">
              Retry
            </button>
          </div>
        ) : null}

        <div className="stats-grid">
          {statCards.map((stat) => (
            <div key={stat.title} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}15` }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <h3>
                  {stat.format
                    ? stat.format(stat.value)
                    : Number(stat.value || 0).toLocaleString()}
                </h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-grid charts-grid-3">
          <EnrollmentChart />
          <CourseDistributionChart />
          <AttendanceChart />
        </div>

        <div className="dashboard-bottom dashboard-bottom-split">
          <WeatherWidget />

          <div className="activity-section">
            <div className="activity-card">
              <h2>Recent Activity</h2>

              <div className="activity-list">
                {isLoading ? (
                  <p className="activity-placeholder">Loading recent activities...</p>
                ) : recentActivities.length ? (
                  recentActivities.map((item) => (
                    <div key={item.id} className="activity-item">
                      <div className={`activity-badge ${item.type || 'report'}`}>
                        {(item.type || 'a').charAt(0).toUpperCase()}
                      </div>
                      <div className="activity-details">
                        <p className="activity-message">{item.message}</p>
                        <span className="activity-time">{item.time || 'Just now'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="activity-placeholder">No recent activity available.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <FloatingChat />
      </div>
    </DashboardProvider>
  );
};

export default Dashboard;
