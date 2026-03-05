import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, BookOpen, ClipboardList, Clock, ListChecks, Cloud, CloudRain, Sun } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { programsData, subjectsData } from '../data/mockData';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [weather, setWeather] = useState({ temp: 32, condition: 'Mostly cloudy' });

  const totalPrograms = programsData.length;
  const totalSubjects = subjectsData.length;
  const activePrograms = programsData.filter((program) => program.status === 'Active').length;
  const inactivePrograms = programsData.filter((program) => program.status !== 'Active').length;
  const subjectsWithPrereq = subjectsData.filter((subject) => subject.preReqs.length > 0).length;

  const programStatusData = [
    { name: 'Active', value: activePrograms, color: '#800000' },
    { name: 'Inactive', value: inactivePrograms, color: '#c00000' }
  ];

  const subjectsByTerm = ['Semester', 'Term', 'Both'].map((term) => ({
    term,
    count: subjectsData.filter((subject) => subject.termType === term).length
  }));

  const recentAdditions = [
    ...programsData.map((program) => ({
      id: `program-${program.id}`,
      type: 'Program',
      code: program.code,
      name: program.name,
      date: program.addedDate
    })),
    ...subjectsData.map((subject) => ({
      id: `subject-${subject.id}`,
      type: 'Subject',
      code: subject.code,
      name: subject.title,
      date: subject.addedDate
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const statCards = [
    { title: 'Total Programs', value: totalPrograms, icon: Layers, color: '#800000' },
    { title: 'Total Subjects', value: totalSubjects, icon: BookOpen, color: '#a00000' },
    { title: 'Active Programs', value: activePrograms, icon: ClipboardList, color: '#c00000' },
    { title: 'Inactive Programs', value: inactivePrograms, icon: Clock, color: '#d00000' },
    { title: 'Subjects with Pre-reqs', value: subjectsWithPrereq, icon: ListChecks, color: '#800000' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your enrollment system overview.</p>
        </div>
        <div className="current-date">
          <div className="date-text">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="weather-info">
            <Cloud size={18} />
            <span>{weather.temp}°C • {weather.condition}</span>
          </div>
        </div>
      </div>

      <h2>Program & Subject Overview</h2>

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
          <h2>Subjects by Semester/Term</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectsByTerm}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 0, 0, 0.1)" />
              <XAxis dataKey="term" stroke="#666" />
              <YAxis stroke="#666" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(128, 0, 0, 0.1)',
                  borderRadius: '10px'
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Subjects" fill="#800000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Active vs Inactive Programs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={programStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {programStatusData.map((entry, index) => (
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

      {/* Bottom Section: Activity */}
      <div className="dashboard-bottom">
        <motion.div
          className="activity-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="activity-card">
            <h2>Recently Added</h2>
            <div className="activity-list">
              {recentAdditions.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-badge ${item.type === 'Program' ? 'program' : 'subject'}`}>
                    {item.type.charAt(0)}
                  </div>
                  <div className="activity-details">
                    <p className="activity-message">
                      {item.type} added: {item.code} - {item.name}
                    </p>
                    <span className="activity-time">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
