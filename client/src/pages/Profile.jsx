import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { User, Mail, GraduationCap, Package, LogOut, Shield } from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cleanName = user.name ? user.name.replace(/CampusCircuit/gi, 'upVolt') : 'Student';
  const cleanEmail = user.email ? user.email.replace(/@campuscircuit\.com/gi, '@upvolt.com') : '';
  const cleanCollege = user.college ? user.college.replace(/CampusCircuit/gi, 'upVolt') : 'Engineering Institute';

  return (
    <div className="cc-page cc-profile-page" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: 24 }}>
          Student Profile
        </h1>

        <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 55%, #0284C7 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.25), 0 4px 16px rgba(37, 99, 235, 0.35)',
              letterSpacing: '0.04em',
              userSelect: 'none'
            }}>
              {cleanName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{cleanName}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Student Builder</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Email</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cleanEmail}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <GraduationCap size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>College</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cleanCollege}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
            <Link to="/orders">
              <Button variant="secondary" icon={<Package size={16} />}>View Order History</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} icon={<LogOut size={16} />}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
