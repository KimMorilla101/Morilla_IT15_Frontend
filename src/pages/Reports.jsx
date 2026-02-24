import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Users, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardStats } from '../data/mockData';
import '../styles/Pages.css';

const Reports = () => {
  const reportTypes = [
    { icon: Users, title: 'Student Report', description: 'Complete student enrollment data', color: '#800000' },
    { icon: BookOpen, title: 'Course Report', description: 'Course statistics and capacity', color: '#a00000' },
    { icon: TrendingUp, title: 'Enrollment Trends', description: 'Historical enrollment analysis', color: '#c00000' },
    { icon: FileText, title: 'Academic Records', description: 'Grades and performance data', color: '#d00000' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Generate and download system reports</p>
        </div>
      </div>

      <div className="reports-grid">
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.title}
            className="report-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="report-icon" style={{ background: `${report.color}15` }}>
              <report.icon size={32} style={{ color: report.color }} />
            </div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <button 
              className="btn-download"
              onClick={() => alert(`Downloading ${report.title}...\nThis will connect to Laravel API GET /api/reports/${report.title.toLowerCase().replace(/ /g, '-')}`)}
            >
              <Download size={16} />
              Download PDF
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="chart-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2>Enrollment Statistics (Last 7 Months)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardStats.enrollmentTrends}>
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
            <Bar dataKey="enrollments" fill="#800000" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Students</h3>
          <p className="summary-value">{dashboardStats.totalStudents}</p>
          <span className="summary-label">Enrolled this year</span>
        </div>
        <div className="summary-card">
          <h3>Total Courses</h3>
          <p className="summary-value">{dashboardStats.totalCourses}</p>
          <span className="summary-label">Available courses</span>
        </div>
        <div className="summary-card">
          <h3>Total Enrollments</h3>
          <p className="summary-value">{dashboardStats.activeEnrollments}</p>
          <span className="summary-label">Active this semester</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
