import { Menu } from 'lucide-react';
import '../styles/Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  const userId = localStorage.getItem('userId');

  return (
    <div className="topbar">
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      
      <div className="topbar-content">
        <h1 className="topbar-title">Enrollment System</h1>
        
        <div className="topbar-right">
          <div className="user-info">
            <span className="user-id">{userId || 'Guest'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
