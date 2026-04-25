import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function SiteFooter({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        'border-t border-[var(--color-ink-3)] bg-[var(--color-ink)] px-8 py-6',
        'flex flex-wrap items-center justify-between gap-4',
        className,
      ].join(' ')}
    >
      <BrandMark
        size={28}
        textColor="var(--color-fog-3)"
        subTextColor="var(--color-teal-mid)"
      />

      <p className="text-[13px] text-[var(--color-ink-4)]">
        © {year} DentSide Remote. All rights reserved.
      </p>

      <nav className="flex items-center gap-6">
        <Link
          to="/terms"
          className="no-underline text-[13px] text-[var(--color-ink-4)] hover:text-[var(--color-fog-3)] transition-colors"
        >
          Terms
        </Link>
        <Link
          to="/privacy"
          className="no-underline text-[13px] text-[var(--color-ink-4)] hover:text-[var(--color-fog-3)] transition-colors"
        >
          Privacy
        </Link>
        <a
          href="mailto:support@dentsideremote.com"
          className="no-underline text-[13px] text-[var(--color-ink-4)] hover:text-[var(--color-fog-3)] transition-colors"
        >
          Contact
        </a>
      </nav>
    </footer>
  );
}
