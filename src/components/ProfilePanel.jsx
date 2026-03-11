import { useEffect, useState } from 'react';
import { LogOut, User, Mail, Loader } from 'lucide-react';
import authApi from '../services/authApi';
import { useNavigate } from 'react-router-dom';

const ProfilePanel = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.fetchProfile();
      setProfile(data.profile || data.user || data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Fallback to cached profile or user ID
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
    navigate('/', { replace: true });
  };

  const displayName =
    profile?.sidebar_card?.title || profile?.name || profile?.email?.split('@')[0] || 'User';
  const displayEmail =
    profile?.sidebar_card?.subtitle || profile?.email || 'guest@example.com';

  return (
    <div className="profile-panel-container">
      <button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-section-title">
                {loading ? 'Loading...' : 'Profile'}
              </div>
            </div>
          </div>

          {loading && !profile ? (
            <div className="profile-loading">
              <Loader size={20} className="spinner" />
              <span>Loading profile...</span>
            </div>
          ) : (
            <>
              <div className="profile-content">
                <div className="profile-item">
                  <User size={18} />
                  <div>
                    <span className="profile-label">Name</span>
                    <span className="profile-value">{displayName}</span>
                  </div>
                </div>
                <div className="profile-item">
                  <Mail size={18} />
                  <div>
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{displayEmail}</span>
                  </div>
                </div>
                {profile?.role && (
                  <div className="profile-item">
                    <span className="profile-label">Role</span>
                    <span className="profile-value">{profile.role}</span>
                  </div>
                )}
              </div>

              {error && <div className="profile-error">{error}</div>}

              <div className="profile-actions">
                <button className="profile-refresh" onClick={loadProfile}>
                  Refresh
                </button>
              </div>
            </>
          )}

          <div className="profile-footer">
            <button className="profile-logout" onClick={handleLogout}>
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
