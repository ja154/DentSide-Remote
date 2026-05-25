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
  subTextColor = 'var(--color-blue)',
}: BrandMarkProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="flex items-center justify-center overflow-hidden rounded-xl"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          background: 'var(--color-blue)',
          boxShadow: '0 18px 32px rgba(37, 99, 235, 0.2)',
        }}
      >
        <img
          src="/logo-icon.png"
          alt="DentSide Remote"
          className="w-3/5 h-3/5 object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: compact ? size * 0.55 : size * 0.7,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: textColor,
            }}
          >
            DentSide
          </span>
          <span
            className="font-bold uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: compact ? size * 0.35 : size * 0.4,
              lineHeight: 1.1,
              letterSpacing: '0.2em',
              color: subTextColor,
            }}
          >
            Remote
          </span>
        </div>
      )}
    </div>
  );
}
