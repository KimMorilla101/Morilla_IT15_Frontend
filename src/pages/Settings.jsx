import { motion } from 'framer-motion';
import { User, Lock, Bell, Globe, Database, Shield } from 'lucide-react';
import '../styles/Pages.css';

const Settings = () => {
  const settingsSections = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Update your personal information',
      color: '#800000'
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Password and authentication settings',
      color: '#a00000'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      color: '#c00000'
    },
    {
      icon: Globe,
      title: 'System Settings',
      description: 'General system configuration',
      color: '#d00000'
    },
    {
      icon: Database,
      title: 'API Configuration',
      description: 'Laravel REST API endpoints',
      color: '#800000'
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Data and privacy settings',
      color: '#a00000'
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure system preferences and options</p>
        </div>
      </div>

      <div className="settings-grid">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            className="setting-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="setting-icon" style={{ background: `${section.color}15` }}>
              <section.icon size={24} style={{ color: section.color }} />
            </div>
            <div className="setting-content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
            <button 
              className="btn-configure"
              onClick={() => alert(`Configuring ${section.title}...\nThis will open a modal to manage these settings.`)}
            >
              Configure
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="api-config-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2>Laravel API Configuration</h2>
        <p className="api-description">
          Configure connection to your Laravel REST API backend. This system is designed to integrate seamlessly with Laravel endpoints.
        </p>
        
        <div className="config-form">
          <div className="form-group">
            <label>API Base URL</label>
            <input 
              type="text" 
              placeholder="http://localhost:8000/api" 
              defaultValue="http://localhost:8000/api"
            />
          </div>
          
          <div className="form-group">
            <label>API Token</label>
            <input 
              type="password" 
              placeholder="Enter your API token" 
            />
          </div>

          <div className="form-group">
            <label>Timeout (seconds)</label>
            <input 
              type="number" 
              defaultValue="30" 
            />
          </div>

          <div className="endpoint-list">
            <h4>Available Endpoints</h4>
            <div className="endpoint-item">
              <span className="method get">GET</span>
              <code>/api/students</code>
            </div>
            <div className="endpoint-item">
              <span className="method get">GET</span>
              <code>/api/courses</code>
            </div>
            <div className="endpoint-item">
              <span className="method get">GET</span>
              <code>/api/enrollments</code>
            </div>
            <div className="endpoint-item">
              <span className="method post">POST</span>
              <code>/api/auth/login</code>
            </div>
          </div>

          <button 
            className="btn-save"
            onClick={() => alert('API Configuration saved successfully!\nYour Laravel backend connection is ready.')}
          >
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
