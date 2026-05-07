import React from 'react';

type NavTab = 'home' | 'leaderboard' | 'about';

interface Props {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const navItems: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'DOMOV', icon: '🏠' },
  { id: 'leaderboard', label: 'REBRÍČKY', icon: '🏆' },
  { id: 'about', label: 'O KIOSKU', icon: 'ℹ️' },
];

export default function BottomNavigation({ active, onNavigate }: Props) {
  return (
    <nav style={styles.nav}>
      {navItems.map((item) => (
        <button
          key={item.id}
          style={{
            ...styles.navBtn,
            ...(active === item.id ? styles.navBtnActive : {}),
          }}
          onClick={() => onNavigate(item.id)}
        >
          <span style={styles.navIcon}>{item.icon}</span>
          <span style={{
            ...styles.navLabel,
            color: active === item.id ? '#2563eb' : '#64748b',
          }}>
            {item.label}
          </span>
          {active === item.id && <div style={styles.activeIndicator} />}
        </button>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    background: '#fff',
    borderTop: '2px solid #e2e8f0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    flexShrink: 0,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px 24px',
    background: 'transparent',
    border: 'none',
    position: 'relative',
    transition: 'background 0.15s',
    gap: '6px',
  },
  navBtnActive: {
    background: '#eff6ff',
  },
  navIcon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  navLabel: {
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '4px',
    background: '#2563eb',
    borderRadius: '0 0 4px 4px',
  },
};
