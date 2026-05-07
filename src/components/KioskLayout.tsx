import React from 'react';

interface Props {
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export default function KioskLayout({ children, bottomNav }: Props) {
  return (
    <div style={styles.kiosk}>
      <div style={styles.screen}>
        <div style={styles.content}>{children}</div>
        {bottomNav && <div style={styles.bottomNav}>{bottomNav}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  kiosk: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e293b',
    overflow: 'hidden',
  },
  screen: {
    width: '1080px',
    height: '1920px',
    background: '#f0f6ff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    transformOrigin: 'center center',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  bottomNav: {
    flexShrink: 0,
  },
};
