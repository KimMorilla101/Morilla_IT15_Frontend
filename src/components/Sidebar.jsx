import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, BookOpen, ClipboardList, FileText, Settings, LogOut, X } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/enrollment', icon: ClipboardList, label: 'Enrollment' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-close-btn" onClick={closeSidebar}>
          <X size={24} />
        </button>
        <div className="logo">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <path d="M50 15 C25 15 10 40 10 65 C10 80 50 95 50 85 C50 95 90 80 90 65 C90 40 75 15 50 15Z" fill="#800000" />
              <ellipse cx="40" cy="45" rx="3" ry="3" fill="white" />
              <ellipse cx="60" cy="45" rx="3" ry="3" fill="white" />
              <path d="M48 52 L52 52 L50 60 Z" fill="#FFD700" />
            </svg>
          </div>
          <h2>Enrollment</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
