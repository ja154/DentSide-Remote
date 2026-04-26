import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogOut, Menu, Search } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  return (
    <div className="ds-layout">
      {/* Sidebar */}
      <aside className={`ds-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
                  onClick={() => setIsSidebarOpen(false)}
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
                setIsSidebarOpen(false);
              }}
            >
              <LogOut size={16} className="nav-icon" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>
      {isSidebarOpen && (
        <button
          className="ds-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation backdrop"
        />
      )}

      {/* Top Bar */}
      <header className="ds-topbar">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="ds-sidebar-toggle"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
          <p className="text-[13px] text-[var(--color-ink-4)] font-medium truncate">
          {title}
          </p>
        </div>
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
        <SiteFooter className="mt-12 -mx-4 -mb-8 sm:-mx-8 sm:-mb-12" />
      </main>
    </div>
  );
}
