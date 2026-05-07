import React from 'react';
import SkylineIllustration from './SkylineIllustration';

interface Props {
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export default function Header({
  title = 'KRÍŽIKY – NULIČKY',
  subtitle = 'Zahrajte si a zabavte sa!',
  accentColor = '#2563eb',
}: Props) {
  return (
    <header style={styles.header}>
      {/* Top bar: logo + city name */}
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#1d4ed8" />
              <path d="M8 28 L8 18 L14 12 L20 18 L20 12 L28 18 L28 28 Z" fill="white" />
              <rect x="16" y="22" width="8" height="6" fill="#1d4ed8" />
            </svg>
          </div>
          <div style={styles.logoText}>
            <div style={styles.logoCity}>MESTO</div>
            <div style={styles.logoSlogan}>PRE VŠETKÝCH</div>
          </div>
        </div>
        <div style={styles.topDecoration}>
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
            <circle cx="12" cy="28" r="10" fill="#bbf7d0" />
            <circle cx="30" cy="22" r="14" fill="#86efac" />
            <circle cx="50" cy="28" r="10" fill="#bbf7d0" />
            <rect x="9" y="28" width="6" height="12" fill="#4ade80" />
            <rect x="27" y="22" width="6" height="18" fill="#4ade80" />
            <rect x="47" y="28" width="6" height="12" fill="#4ade80" />
          </svg>
        </div>
      </div>

      {/* Skyline decoration */}
      <div style={styles.skylineWrap}>
        <SkylineIllustration color="#bfdbfe" opacity={0.7} />
      </div>

      {/* Game title */}
      <div style={styles.titleSection}>
        <h1 style={{ ...styles.title, color: accentColor }}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #f0fdf4 100%)',
    paddingTop: '0',
    borderBottom: '2px solid #e0f2fe',
    overflow: 'hidden',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 48px 12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoIcon: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(29,78,216,0.3)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoCity: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.1em',
    lineHeight: 1,
  },
  logoSlogan: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.08em',
  },
  topDecoration: {
    opacity: 0.8,
  },
  skylineWrap: {
    marginTop: '-8px',
    marginBottom: '-4px',
  },
  titleSection: {
    textAlign: 'center',
    padding: '20px 40px 28px',
  },
  title: {
    fontSize: '52px',
    fontWeight: 900,
    letterSpacing: '0.02em',
    lineHeight: 1.1,
    textShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '24px',
    color: '#64748b',
    fontWeight: 500,
    marginTop: '8px',
  },
};
