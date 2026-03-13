import { Menu } from 'lucide-react';
import ProfilePanel from './ProfilePanel';
import '../styles/Topbar.css';

const Topbar = ({ toggleSidebar }) => {
  return (
    <header className="topbar navbar navbar-light bg-white border-bottom px-2 px-md-3">
      <button
        type="button"
        className="hamburger-btn btn btn-outline-danger btn-sm"
        onClick={toggleSidebar}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="topbar-content w-100 d-flex align-items-center justify-content-between">
        <h1 className="topbar-title h5 mb-0 fw-bold text-danger-emphasis">Enrollment System</h1>

        <div className="topbar-right d-flex align-items-center ms-auto">
          <ProfilePanel />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
