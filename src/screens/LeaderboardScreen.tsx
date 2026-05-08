import React, { useState, useEffect } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import { fetchAllLeaderboards } from '../lib/api';
import type { ScoreEntry } from '../lib/api';

interface Props {
  onBack: () => void;
}

const GAMES = [
  { id: 'quiz',        label: 'Kvíz o meste',  emoji: '🏰', color: '#ea580c', bg: '#fff7ed' },
  { id: 'trafficquiz', label: 'Dopravný kvíz', emoji: '🚦', color: '#d97706', bg: '#fffbeb' },
  { id: 'mathquiz',    label: 'Matematika',    emoji: '🧮', color: '#0891b2', bg: '#ecfeff' },
  { id: 'memory',      label: 'Pamäť',         emoji: '🧩', color: '#15803d', bg: '#f0fdf4' },
  { id: 'puzzle',      label: 'Puzzle',        emoji: '🖼️', color: '#7c3aed', bg: '#faf5ff' },
  { id: 'stack',       label: 'Stack',         emoji: '🏗️', color: '#6366f1', bg: '#eef2ff' },
] as const;

type GameId = typeof GAMES[number]['id'];

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'dnes';
  if (diffDays === 1) return 'včera';
  if (diffDays < 7) return `pred ${diffDays} dňami`;
  return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' });
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ onBack }: Props) {
  const [activeGame, setActiveGame] = useState<GameId>('quiz');
  const [data, setData] = useState<Record<string, ScoreEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const result = await fetchAllLeaderboards();
    if (Object.keys(result).length === 0) {
      setError(true);
    } else {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const meta = GAMES.find((g) => g.id === activeGame)!;
  const entries: ScoreEntry[] = data[activeGame] ?? [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.logoWrap}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="11" fill="#7c3aed" />
              <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
              <rect x="17" y="25" width="9" height="7" fill="#7c3aed" />
            </svg>
          </div>
          <div style={styles.logoText}>MESTO PRE VŠETKÝCH</div>
          <button style={styles.refreshBtn} onClick={load}>↻</button>
        </div>
        <SkylineIllustration color="#bfdbfe" opacity={0.5} />
        <div style={styles.titleArea}>
          <h1 style={styles.title}>🏆 REBRÍČKY</h1>
          <p style={styles.sub}>Najlepší hráči kiosku</p>
        </div>
      </header>

      {/* Game tabs */}
      <div style={styles.tabs}>
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            style={{
              ...styles.tab,
              background: activeGame === g.id ? g.color : '#f8fafc',
              color: activeGame === g.id ? '#fff' : '#64748b',
              borderColor: activeGame === g.id ? g.color : '#e2e8f0',
              boxShadow: activeGame === g.id ? `0 4px 16px ${g.color}44` : 'none',
              transform: activeGame === g.id ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{g.emoji}</span>
            <span style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px', textAlign: 'center', lineHeight: 1.2 }}>
              {g.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={styles.main}>
        {loading && (
          <div style={styles.center}>
            <div style={{ fontSize: '64px', lineHeight: 1 }}>⏳</div>
            <p style={styles.centerText}>Načítavam...</p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.center}>
            <div style={{ fontSize: '64px', lineHeight: 1 }}>⚠️</div>
            <p style={styles.centerText}>Rebríček nie je dostupný</p>
            <p style={{ fontSize: '20px', color: '#94a3b8', marginTop: '8px' }}>
              Skontrolujte pripojenie k sieti
            </p>
            <button style={styles.retryBtn} onClick={load}>↻ Skúsiť znova</button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={styles.center}>
            <div style={{ fontSize: '80px', lineHeight: 1 }}>
              {meta.emoji}
            </div>
            <p style={styles.centerText}>Zatiaľ žiadne skóre</p>
            <p style={{ fontSize: '20px', color: '#94a3b8', marginTop: '8px' }}>
              Buďte prvý, kto zahrá {meta.label}!
            </p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div style={styles.list}>
            {/* Active game header */}
            <div style={{ ...styles.gameHeader, background: meta.bg, borderColor: `${meta.color}44` }}>
              <span style={{ fontSize: '48px' }}>{meta.emoji}</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: meta.color }}>{meta.label}</div>
                <div style={{ fontSize: '18px', color: '#64748b' }}>Top {entries.length} hráčov</div>
              </div>
            </div>

            {entries.map((entry, i) => (
              <div
                key={i}
                style={{
                  ...styles.row,
                  background: i === 0 ? '#fefce8' : i === 1 ? '#f8fafc' : i === 2 ? '#fff7ed' : '#fff',
                  borderColor: i === 0 ? '#fde047' : i === 1 ? '#cbd5e1' : i === 2 ? '#fdba74' : '#f1f5f9',
                  boxShadow: i < 3 ? `0 4px 16px rgba(0,0,0,0.08)` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Rank */}
                <div style={styles.rank}>
                  {i < 3
                    ? <span style={{ fontSize: '36px' }}>{MEDALS[i]}</span>
                    : <span style={{ fontSize: '26px', fontWeight: 900, color: '#94a3b8' }}>#{i + 1}</span>
                  }
                </div>

                {/* Initials badge */}
                <div style={{
                  ...styles.initials,
                  background: i === 0 ? '#fde047' : i === 1 ? '#e2e8f0' : i === 2 ? '#fdba74' : meta.bg,
                  color: i < 3 ? '#1e293b' : meta.color,
                  borderColor: i < 3 ? 'transparent' : `${meta.color}44`,
                }}>
                  {entry.player_name}
                </div>

                {/* Score */}
                <div style={styles.scoreCol}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: i < 3 ? meta.color : '#374151' }}>
                    {entry.score}
                  </span>
                  <span style={{ fontSize: '16px', color: '#94a3b8', marginLeft: '6px' }}>bodov</span>
                </div>

                {/* Date */}
                <div style={styles.date}>{relativeDate(entry.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <div style={styles.footerArea}>
        <button style={styles.backBtn} onClick={onBack}>← SPÄŤ NA DOMOV</button>
        <SkylineIllustration color="#c7d2fe" opacity={0.4} flip />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #eff6ff 0%, #faf5ff 100%)',
  },
  header: {
    background: 'linear-gradient(180deg, #eff6ff 0%, #e0e7ff 100%)',
    borderBottom: '2px solid #c7d2fe',
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 48px 10px',
  },
  logoWrap: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
  },
  logoText: {
    flex: 1,
    fontSize: '20px',
    fontWeight: 900,
    color: '#1e293b',
    letterSpacing: '0.08em',
  },
  refreshBtn: {
    background: '#fff',
    border: '2px solid #c7d2fe',
    borderRadius: '14px',
    padding: '12px 20px',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#7c3aed',
    lineHeight: 1,
  },
  titleArea: {
    textAlign: 'center',
    padding: '16px 40px 24px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#7c3aed',
    letterSpacing: '0.02em',
  },
  sub: {
    fontSize: '20px',
    color: '#64748b',
    marginTop: '6px',
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
    padding: '16px 24px',
    background: '#fff',
    borderBottom: '2px solid #e2e8f0',
    flexShrink: 0,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px 8px',
    borderRadius: '18px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s',
    minHeight: '88px',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 32px',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    paddingTop: '60px',
  },
  centerText: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#374151',
  },
  retryBtn: {
    marginTop: '8px',
    background: '#7c3aed',
    color: '#fff',
    fontSize: '22px',
    fontWeight: 700,
    padding: '18px 48px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  gameHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 28px',
    borderRadius: '20px',
    border: '2px solid',
    marginBottom: '6px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 24px',
    borderRadius: '18px',
    border: '2px solid',
    transition: 'transform 0.1s',
  },
  rank: {
    width: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: {
    width: '80px',
    height: '64px',
    borderRadius: '14px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    flexShrink: 0,
  },
  scoreCol: {
    flex: 1,
    display: 'flex',
    alignItems: 'baseline',
  },
  date: {
    fontSize: '18px',
    color: '#94a3b8',
    flexShrink: 0,
  },
  footerArea: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    paddingTop: '12px',
  },
  backBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 800,
    padding: '24px 60px',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(124,58,237,0.35)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    marginBottom: '12px',
  },
};
