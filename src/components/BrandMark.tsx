import React from 'react';

interface BrandMarkProps {
  size?: number;
  showText?: boolean;
  compact?: boolean;
  className?: string;
  textColor?: string;
  subTextColor?: string;
}

export default function BrandMark({
  size = 28,
  showText = true,
  compact = false,
  className = '',
  textColor = 'var(--color-ink)',
  subTextColor = 'var(--color-teal)',
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="DentSide Remote logo"
        width={size}
        height={size}
        style={{ width: size, height: size, display: 'block' }}
      />

      {showText && (
        <div style={{ lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: compact ? 14 : 16, fontWeight: 700, letterSpacing: '-0.02em', color: textColor }}>
            DentSide
          </span>
          <span style={{ fontSize: compact ? 9 : 10, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.18em', color: subTextColor, fontWeight: 700 }}>
            Remote
          </span>
        </div>
      )}
    </div>
  );
}
