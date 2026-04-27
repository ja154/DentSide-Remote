import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gigs', href: '/opportunities', icon: Briefcase },
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/verification', icon: ShieldCheck },
];

export default function DentistSidebar({
  pathname,
  isOpen = false,
  onClose,
}: {
  pathname: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className={`ds-sidebar${isOpen ? ' open' : ''}`}>
      <div className="ds-sidebar-logo">
        <BrandMark size={32} showText={false} />
        <button
          type="button"
          className="ds-sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
      </div>
      <nav className="ds-sidebar-nav">
        <div className="ds-sidebar-section">
          <div className="ds-sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`ds-nav-item${isActive(href) ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon size={16} className="nav-icon" />
              {label}
            </Link>
          ))}
        </div>
        <div className="ds-sidebar-section" style={{ marginTop: 'auto' }}>
          <button
            type="button"
            className="ds-nav-item"
            style={{ color: 'var(--color-ruby)' }}
            onClick={async () => {
              onClose?.();
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
  );
}
