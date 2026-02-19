import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardList, Clock } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Weather from '../components/Weather';
import Chatbot from '../components/Chatbot';
import { dashboardStats } from '../data/mockData';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const statCards = [
    { title: 'Total Students', value: dashboardStats.totalStudents, icon: Users, color: '#800000' },
    { title: 'Total Courses', value: dashboardStats.totalCourses, icon: BookOpen, color: '#a00000' },
    { title: 'Active Enrollments', value: dashboardStats.activeEnrollments, icon: ClipboardList, color: '#c00000' },
    { title: 'Pending Approvals', value: dashboardStats.pendingApprovals, icon: Clock, color: '#d00000' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your enrollment system overview.</p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon" style={{ background: `${stat.color}15` }}>
              <stat.icon size={24} style={{ color: stat.color }} />
            </div>
            <div className="stat-content">
              <h3>{stat.value.toLocaleString()}</h3>
              <p>{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Enrollment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardStats.enrollmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 0, 0, 0.1)" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(128, 0, 0, 0.1)',
                  borderRadius: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="enrollments" 
                stroke="#800000" 
                strokeWidth={3}
                dot={{ fill: '#800000', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Program Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardStats.programDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardStats.programDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(128, 0, 0, 0.1)',
                  borderRadius: '10px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Section: Weather, Activity, Chatbot */}
      <div className="dashboard-bottom">
        <motion.div
          className="weather-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Weather />
        </motion.div>

        <motion.div
          className="activity-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="activity-card">
            <h2>Recent Activities</h2>
            <div className="activity-list">
              {dashboardStats.recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-badge ${activity.type}`}>
                    {activity.type.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-details">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="chatbot-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Chatbot />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
