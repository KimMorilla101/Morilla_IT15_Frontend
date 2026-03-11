import { Menu } from 'lucide-react';
import ProfilePanel from './ProfilePanel';
import '../styles/Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="topbar">
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      
      <div className="topbar-content">
        <h1 className="topbar-title">Enrollment System</h1>
        
        <div className="topbar-right">
          <ProfilePanel />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
