import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  LogOut,
  X,
  Layers,
  Users,
  CalendarDays,
} from 'lucide-react';
import { fetchProfile, getStoredProfile, logout } from '../services/authApi';
import '../styles/Sidebar.css';

const FALLBACK_PROFILE = {
  sidebar_card: {
    title: 'User',
    subtitle: 'No email',
  },
  avatar: {
    initials: 'U',
    background_color: '#800000',
    text_color: '#FFFFFF',
  },
};

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getStoredProfile() || FALLBACK_PROFILE);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const payload = await fetchProfile();
        const nextProfile = payload?.profile || getStoredProfile() || FALLBACK_PROFILE;

        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch {
        const cachedProfile = getStoredProfile();
        if (isMounted && cachedProfile) {
          setProfile(cachedProfile);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const sidebarTitle =
    profile?.sidebar_card?.title || profile?.name || FALLBACK_PROFILE.sidebar_card.title;
  const sidebarSubtitle =
    profile?.sidebar_card?.subtitle || profile?.email || FALLBACK_PROFILE.sidebar_card.subtitle;
  const avatarInitials =
    profile?.avatar?.initials ||
    sidebarTitle
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0].toUpperCase())
      .join('') ||
    FALLBACK_PROFILE.avatar.initials;

  const avatarStyle = useMemo(
    () => ({
      background: profile?.avatar?.background_color || FALLBACK_PROFILE.avatar.background_color,
      color: profile?.avatar?.text_color || FALLBACK_PROFILE.avatar.text_color,
    }),
    [profile],
  );

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/students', icon: Users, label: 'Students' },
    { path: '/programs', icon: Layers, label: 'Courses' },
    { path: '/academic-calendar', icon: CalendarDays, label: 'Academic Calendar' },
  ];

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <aside className={`sidebar d-flex flex-column ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <button type="button" className="sidebar-close-btn btn btn-sm btn-light" onClick={closeSidebar} aria-label="Close navigation">
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
            className={({ isActive }) => `nav-item d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile-card sidebar-profile-card-footer d-flex align-items-center">
          <div className="sidebar-profile-avatar" style={avatarStyle}>
            {avatarInitials}
          </div>
          <div className="sidebar-profile-text">
            <p className="sidebar-profile-title">{sidebarTitle}</p>
            <p className="sidebar-profile-subtitle">{sidebarSubtitle}</p>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="logout-btn btn btn-outline-danger d-flex align-items-center justify-content-center gap-2">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
