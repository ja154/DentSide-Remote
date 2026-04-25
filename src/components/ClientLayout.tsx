import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';
import SiteFooter from './SiteFooter';

const CLIENT_NAV_ITEMS = [
  { label: 'Dashboard', href: '/client-dashboard', icon: LayoutDashboard },
  { label: 'Find a Dentist', href: '/client/network', icon: Search },
  { label: 'Appointments', href: '/client/appointments', icon: Calendar },
];

export default function ClientLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  return (
    <div className="ds-layout">
      {/* Sidebar */}
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <BrandMark size={32} showText={false} />
        </div>
        <nav className="ds-sidebar-nav">
          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-label">Client Portal</div>
            {CLIENT_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive =
                location.pathname === href || location.pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  to={href}
                  className={`ds-nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} className="nav-icon" />
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="ds-sidebar-section" style={{ marginTop: 'auto' }}>
            <button
              className="ds-nav-item"
              style={{ color: 'var(--color-ruby)' }}
              onClick={async () => {
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

      {/* Top Bar */}
      <header className="ds-topbar">
        <p className="text-[13px] text-[var(--color-ink-4)] font-medium">
          {title}
        </p>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[13px] text-[var(--color-ink-4)] font-medium">
            {profile?.displayName || profile?.email}
          </span>
          <div className="ds-avatar ds-avatar-md">
            <img
              src={
                profile?.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${
                  profile?.displayName || 'C'
                }`
              }
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ds-main flex flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter className="-mx-8 -mb-12 mt-12" />
      </main>
    </div>
  );
}

