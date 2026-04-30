import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';
import NotificationMenu from './NotificationMenu';

const ADMIN_NAV_ITEMS = [
  { label: 'Overview', hash: '#overview', icon: LayoutDashboard },
  { label: 'Users', hash: '#users', icon: Users },
  { label: 'Verification', hash: '#verifications', icon: BadgeCheck },
  { label: 'Marketplace', hash: '#gigs', icon: Briefcase },
  { label: 'Appointments', hash: '#appointments', icon: Calendar },
  { label: 'Withdrawals', hash: '#withdrawals', icon: Wallet },
];

export default function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const activeHash = useMemo(() => location.hash || '#overview', [location.hash]);

  const handleNav = (hash: string) => {
    setIsSidebarOpen(false);

    if (typeof window === 'undefined') {
      return;
    }

    const sectionId = hash.replace('#', '');
    const target = document.getElementById(sectionId);

    navigate(`/admin${hash}`, { replace: true });

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.hash = hash;
  };

  return (
    <div className="ds-layout">
      {isSidebarOpen && (
        <button
          type="button"
          className="ds-sidebar-backdrop md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`ds-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="ds-sidebar-logo">
          <BrandMark size={32} showText={false} />
          <button
            type="button"
            className="ds-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="ds-sidebar-nav">
          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-label">Admin Console</div>
            {ADMIN_NAV_ITEMS.map(({ label, hash, icon: Icon }) => (
              <button
                key={hash}
                type="button"
                className={`ds-nav-item${activeHash === hash ? ' active' : ''}`}
                onClick={() => handleNav(hash)}
              >
                <Icon size={16} className="nav-icon" />
                {label}
              </button>
            ))}
          </div>

          <div className="ds-sidebar-section">
            <Link
              to="/gig-studio"
              className={`ds-nav-item${location.pathname === '/gig-studio' ? ' active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Briefcase size={16} className="nav-icon" />
              Gig Studio
            </Link>
          </div>

          <div className="ds-sidebar-section">
            <Link to="/" className="ds-nav-item" onClick={() => setIsSidebarOpen(false)}>
              <Shield size={16} className="nav-icon" />
              Public Site
            </Link>
          </div>

          <div className="ds-sidebar-section" style={{ marginTop: 'auto' }}>
            <button
              type="button"
              className="ds-nav-item"
              style={{ color: 'var(--color-ruby)' }}
              onClick={async () => {
                setIsSidebarOpen(false);
                await logout();
                navigate('/');
              }}
            >
              <LogOut size={16} className="nav-icon" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <header className="ds-topbar">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="ds-sidebar-toggle"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
          <p className="text-[13px] text-[var(--color-ink-4)] font-medium truncate">{title}</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationMenu />
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[var(--color-fog-2)] bg-white px-3 py-1.5">
            <Shield size={13} color="var(--color-teal)" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-teal-dark)]">
              Admin
            </span>
          </div>
          <span className="hidden sm:block text-[13px] text-[var(--color-ink-4)] font-medium">
            {profile?.displayName || profile?.email}
          </span>
          <div className="ds-avatar ds-avatar-md">
            <img
              src={
                profile?.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'A'}`
              }
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      <main className="ds-main">{children}</main>
    </div>
  );
}
