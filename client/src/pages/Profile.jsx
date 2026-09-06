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

  return (
    <div className="cc-page cc-profile-page" style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, marginBottom: 24 }}>
          Student Profile
        </h1>

        <div className="glass-panel" style={{ padding: 36, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #00E5FF)', color: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
              {user.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{user.name}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Student Builder</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Email</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.email}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <GraduationCap size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>College</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.college || 'Engineering Institute'}</div>
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
