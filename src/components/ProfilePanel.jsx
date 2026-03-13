import { useEffect, useRef, useState } from 'react';
import { LogOut, User, Mail, Loader } from 'lucide-react';
import authApi from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const ProfilePanel = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.fetchProfile();
      setProfile(data.profile || data.user || data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);

      const cached = localStorage.getItem('profile');
      if (cached) {
        setProfile(JSON.parse(cached));
      } else {
        setProfile({
          name: localStorage.getItem('userId') || 'User',
          email: 'Not available',
        });
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setIsOpen(false);
    navigate('/', { replace: true });
  };

  const displayName =
    profile?.sidebar_card?.title || profile?.name || profile?.email?.split('@')[0] || 'User';
  const displayEmail =
    profile?.sidebar_card?.subtitle || profile?.email || 'guest@example.com';

  return (
    <div className="profile-panel-container dropdown" ref={panelRef}>
      <button
        type="button"
        className="profile-trigger btn btn-link text-decoration-none p-0 border-0"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown dropdown-menu dropdown-menu-end show">
          <div className="profile-header border-bottom">
            <div className="profile-header-content d-flex align-items-center">
              <div className="profile-section-title">
                {loading ? 'Loading...' : 'Profile'}
              </div>
            </div>
          </div>

          {loading && !profile ? (
            <div className="profile-loading text-center">
              <Loader size={20} className="spinner" />
              <span>Loading profile...</span>
            </div>
          ) : (
            <>
              <div className="profile-content">
                <div className="profile-item d-flex align-items-start">
                  <User size={18} />
                  <div>
                    <span className="profile-label">Name</span>
                    <span className="profile-value">{displayName}</span>
                  </div>
                </div>
                <div className="profile-item d-flex align-items-start">
                  <Mail size={18} />
                  <div>
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{displayEmail}</span>
                  </div>
                </div>
                {profile?.role && (
                  <div className="profile-item d-flex align-items-start">
                    <span className="profile-label">Role</span>
                    <span className="profile-value">{profile.role}</span>
                  </div>
                )}
              </div>

              {error && <div className="profile-error alert alert-warning py-2 px-3 mb-2">{error}</div>}

              <div className="profile-actions">
                <button type="button" className="profile-refresh btn btn-outline-danger btn-sm w-100" onClick={loadProfile}>
                  Refresh
                </button>
              </div>
            </>
          )}

          <div className="profile-footer border-top">
            <button type="button" className="profile-logout btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePanel;
