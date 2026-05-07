import React from 'react';
import type { GameDefinition } from '../games';

interface Props {
  game: GameDefinition;
  onPlay: (gameId: string) => void;
}

export default function GameCard({ game, onPlay }: Props) {
  return (
    <div
      style={{
        ...styles.card,
        opacity: game.available ? 1 : 0.75,
      }}
      onClick={() => game.available && onPlay(game.id)}
    >
      <div style={{ ...styles.iconBadge, background: game.gradient }}>
        <span style={styles.icon}>{game.icon}</span>
      </div>
      <div style={styles.content}>
        <div style={{ ...styles.title, color: game.color }}>{game.title}</div>
        <div style={styles.subtitle}>{game.subtitle}</div>
        <div style={styles.description}>{game.description}</div>
      </div>
      {game.available ? (
        <div style={{ ...styles.badge, background: game.gradient }}>HRAŤ</div>
      ) : (
        <div style={styles.badgeSoon}>{game.comingSoon}</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '2px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  iconBadge: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  icon: {
    fontSize: '36px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '22px',
    fontWeight: 900,
    letterSpacing: '0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: 500,
    marginTop: '4px',
  },
  description: {
    fontSize: '15px',
    color: '#94a3b8',
    marginTop: '6px',
    lineHeight: 1.4,
  },
  badge: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 800,
    padding: '12px 24px',
    borderRadius: '14px',
    letterSpacing: '0.05em',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  badgeSoon: {
    color: '#94a3b8',
    fontSize: '16px',
    fontWeight: 700,
    padding: '12px 20px',
    borderRadius: '14px',
    background: '#f1f5f9',
    flexShrink: 0,
    letterSpacing: '0.05em',
  },
};
