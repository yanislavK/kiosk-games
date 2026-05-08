import React, { useState } from 'react';
import SkylineIllustration from '../components/SkylineIllustration';
import PuzzleGame from '../games/puzzle/PuzzleGame';
import PlayerNameModal from '../components/PlayerNameModal';
import type { Difficulty } from '../games/puzzle/types';
import { GRID_CONFIGS } from '../games/puzzle/types';
import { PUZZLE_IMAGES } from '../games/puzzle/images';
import type { PuzzleImage } from '../games/puzzle/images';

interface Props {
  onBack: () => void;
}

type SetupStep = 'image' | 'difficulty';

function randomImage(): PuzzleImage {
  return PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
}

export default function PuzzleScreen({ onBack }: Props) {
  const [step, setStep] = useState<SetupStep>('image');
  const [selectedImage, setSelectedImage] = useState<PuzzleImage | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  const handlePickImage = (img: PuzzleImage) => {
    setSelectedImage(img);
    setStep('difficulty');
  };

  const handlePickDifficulty = (d: Difficulty) => {
    setDifficulty(d);
  };

  const handleNewImage = () => {
    setSelectedImage(null);
    setDifficulty(null);
    setStep('image');
  };

  // Active game
  if (selectedImage && difficulty) {
    return (
      <div style={{ ...styles.container, position: 'relative' }}>
        <header style={styles.headerCompact}>
          <div style={styles.topBarCompact}>
            <LogoBadge />
            <div style={styles.headerCenter}>
              <span style={styles.headerTitle}>PUZZLE</span>
              <span style={styles.headerSub}>
                {selectedImage.label} · {GRID_CONFIGS[difficulty].label} {GRID_CONFIGS[difficulty].sublabel}
              </span>
            </div>
            <button style={styles.changeBtn} onClick={handleNewImage}>⚙️</button>
          </div>
        </header>
        <PuzzleGame
          difficulty={difficulty}
          image={selectedImage}
          onBack={onBack}
          onNewImage={handleNewImage}
          onGameEnd={setPendingScore}
        />
        <div style={styles.footer}><SkylineIllustration color="#e9d5ff" opacity={0.35} flip /></div>

        {pendingScore !== null && (
          <PlayerNameModal
            gameId="puzzle"
            score={pendingScore}
            gameName="Puzzle"
            onDone={() => setPendingScore(null)}
          />
        )}
      </div>
    );
  }

  // Difficulty picker
  if (step === 'difficulty' && selectedImage) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.topBar}><LogoBadge /></div>
          <SkylineIllustration color="#e9d5ff" opacity={0.55} />
          <div style={styles.titleSection}>
            <h1 style={styles.title}>PUZZLE</h1>
            <p style={styles.subtitle}>Vyberte obtiažnosť</p>
          </div>
        </header>

        {/* Selected image preview */}
        <div style={styles.previewWrap}>
          <div style={styles.previewCard}>
            <div style={styles.previewImg}>
              <selectedImage.Component size={220} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed' }}>{selectedImage.label}</div>
              <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>Vybraný obrázok</div>
            </div>
            <button style={styles.changeImgBtn} onClick={() => setStep('image')}>Zmeniť</button>
          </div>
        </div>

        <div style={styles.diffSection}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
            const cfg = GRID_CONFIGS[d];
            const palette = {
              easy:   { bg: 'linear-gradient(135deg,#a855f7,#7c3aed)', border: '#e9d5ff', emoji: '😊' },
              medium: { bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: '#c4b5fd', emoji: '😤' },
              hard:   { bg: 'linear-gradient(135deg,#6d28d9,#4c1d95)', border: '#a78bfa', emoji: '😈' },
            }[d];
            return (
              <button key={d} style={{ ...styles.diffBtn, background: palette.bg, borderColor: palette.border }}
                onClick={() => handlePickDifficulty(d)}>
                <span style={{ fontSize: '48px' }}>{palette.emoji}</span>
                <div>
                  <div style={styles.diffLabel}>{cfg.label}</div>
                  <div style={styles.diffSub}>{cfg.sublabel} · {cfg.size * cfg.size - 1} dielikov</div>
                </div>
              </button>
            );
          })}
        </div>

        <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
        <div style={styles.footer}><SkylineIllustration color="#e9d5ff" opacity={0.35} flip /></div>
      </div>
    );
  }

  // Image picker
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topBar}><LogoBadge /></div>
        <SkylineIllustration color="#e9d5ff" opacity={0.55} />
        <div style={styles.titleSection}>
          <h1 style={styles.title}>PUZZLE</h1>
          <p style={styles.subtitle}>Poskladajte obrázok! Vyberte motív:</p>
        </div>
      </header>

      <div style={styles.imageGrid}>
        {PUZZLE_IMAGES.map((img) => (
          <button key={img.id} style={{ ...styles.imgCard, borderColor: img.color }}
            onClick={() => handlePickImage(img)}>
            <div style={styles.imgPreview}>
              <img.Component size={200} />
            </div>
            <div style={{ ...styles.imgLabel, color: img.color }}>{img.label}</div>
          </button>
        ))}
        <button style={{ ...styles.imgCard, borderColor: '#64748b', borderStyle: 'dashed' }}
          onClick={() => handlePickImage(randomImage())}>
          <div style={{ fontSize: '72px', lineHeight: 1, padding: '24px 0' }}>🎲</div>
          <div style={{ ...styles.imgLabel, color: '#64748b' }}>NÁHODNÝ</div>
        </button>
      </div>

      <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
      <div style={styles.footer}><SkylineIllustration color="#e9d5ff" opacity={0.35} flip /></div>
    </div>
  );
}

function LogoBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ borderRadius: '11px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect width="44" height="44" rx="11" fill="#6d28d9" />
          <path d="M9 32 L9 20 L16 13 L22 20 L22 13 L30 20 L30 32 Z" fill="white" />
          <rect x="17" y="25" width="9" height="7" fill="#6d28d9" />
        </svg>
      </div>
      <div style={{ fontSize: '19px', fontWeight: 900, color: '#1e293b', letterSpacing: '0.08em' }}>
        MESTO PRE VŠETKÝCH
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#faf5ff 0%,#fff 60%,#faf5ff 100%)' },
  header: { background: 'linear-gradient(180deg,#faf5ff 0%,#ede9fe 100%)', borderBottom: '2px solid #e9d5ff', flexShrink: 0 },
  headerCompact: { background: 'linear-gradient(180deg,#faf5ff 0%,#ede9fe 100%)', borderBottom: '2px solid #e9d5ff', flexShrink: 0, padding: '16px 40px' },
  topBar: { padding: '20px 48px 10px' },
  topBarCompact: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  headerCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  headerTitle: { fontSize: '32px', fontWeight: 900, color: '#7c3aed', letterSpacing: '0.06em' },
  headerSub: { fontSize: '16px', color: '#9333ea', fontWeight: 500 },
  changeBtn: { background: '#fff', border: '2px solid #e9d5ff', borderRadius: '12px', padding: '10px 16px', fontSize: '22px', cursor: 'pointer', color: '#7c3aed' },
  titleSection: { textAlign: 'center', padding: '16px 40px 24px' },
  title: { fontSize: '52px', fontWeight: 900, color: '#7c3aed', letterSpacing: '0.02em' },
  subtitle: { fontSize: '22px', color: '#9333ea', marginTop: '6px', fontWeight: 500 },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    padding: '24px 48px',
    flex: 1,
  },
  imgCard: {
    background: '#fff',
    border: '3px solid',
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 0 16px',
    transition: 'transform 0.12s',
  },
  imgPreview: { width: '100%', overflow: 'hidden', lineHeight: 0 },
  imgLabel: { fontSize: '20px', fontWeight: 800, marginTop: '12px', letterSpacing: '0.04em' },
  previewWrap: { padding: '16px 48px 0' },
  previewCard: {
    background: '#fff',
    border: '2px solid #e9d5ff',
    borderRadius: '20px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  previewImg: { width: '220px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', lineHeight: 0 },
  changeImgBtn: {
    background: '#ede9fe', color: '#7c3aed', border: '2px solid #c4b5fd',
    borderRadius: '12px', padding: '12px 20px', fontSize: '18px', fontWeight: 700, cursor: 'pointer',
    flexShrink: 0,
  },
  diffSection: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 56px', flex: 1, justifyContent: 'center' },
  diffBtn: {
    display: 'flex', alignItems: 'center', gap: '28px',
    padding: '28px 36px', borderRadius: '24px', border: '3px solid',
    cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
    color: '#fff', transition: 'transform 0.12s',
  },
  diffLabel: { fontSize: '30px', fontWeight: 900, letterSpacing: '0.04em' },
  diffSub: { fontSize: '18px', fontWeight: 500, opacity: 0.85, marginTop: '4px' },
  backBtn: {
    alignSelf: 'center', margin: '8px 0 16px',
    background: '#fff', color: '#64748b', fontSize: '22px', fontWeight: 700,
    padding: '22px 56px', borderRadius: '18px', border: '2px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)', cursor: 'pointer',
  },
  footer: { flexShrink: 0, marginBottom: '-2px' },
};
