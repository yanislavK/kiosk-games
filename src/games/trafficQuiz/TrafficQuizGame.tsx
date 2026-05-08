import React, { useState, useEffect, useRef } from 'react';
import type { TrafficAnswer, TrafficQuizState } from './types';
import { TRAFFIC_QUESTIONS } from './questions';

interface Props {
  onBack: () => void;
  onGameEnd?: (score: number) => void;
}

const TOTAL = TRAFFIC_QUESTIONS.length;
const PTS = 10;

function init(): TrafficQuizState {
  return { currentIndex: 0, selectedId: null, answered: false, score: 0, finished: false };
}

/* Animated traffic light decoration */
function TrafficLight({ phase }: { phase: 'red' | 'yellow' | 'green' }) {
  return (
    <svg width="64" height="160" viewBox="0 0 64 160">
      <rect x="8" y="4" width="48" height="148" rx="12" fill="#2d2d2d" />
      <rect x="12" y="8" width="40" height="140" rx="8" fill="#1a1a1a" />
      {[['#E53935', 38, phase === 'red'], ['#FFC107', 80, phase === 'yellow'], ['#43A047', 122, phase === 'green']].map(
        ([color, cy, on], i) => (
          <g key={i}>
            <circle cx="32" cy={cy as number} r="16" fill={on ? color as string : '#333'} />
            {on && <circle cx="32" cy={cy as number} r="16" fill={color as string} opacity="0.4" style={{ filter: 'blur(4px)' }} />}
            {on && <ellipse cx="26" cy={(cy as number) - 6} rx="5" ry="3" fill="rgba(255,255,255,0.3)" />}
          </g>
        )
      )}
      <rect x="28" y="152" width="8" height="8" rx="2" fill="#555" />
    </svg>
  );
}

export default function TrafficQuizGame({ onBack, onGameEnd }: Props) {
  const [state, setState] = useState<TrafficQuizState>(init);
  const [lightPhase, setLightPhase] = useState<'red' | 'yellow' | 'green'>('red');
  const calledRef = useRef(false);

  useEffect(() => {
    if (state.finished) {
      if (!calledRef.current) { calledRef.current = true; onGameEnd?.(state.score); }
    } else {
      calledRef.current = false;
    }
  }, [state.finished, state.score, onGameEnd]);

  const q = TRAFFIC_QUESTIONS[state.currentIndex];
  const isLast = state.currentIndex === TOTAL - 1;

  /* Cycle traffic light while idle */
  useEffect(() => {
    if (state.answered) return;
    const seq: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green', 'yellow'];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % seq.length; setLightPhase(seq[i]); }, 1400);
    return () => clearInterval(t);
  }, [state.answered, state.currentIndex]);

  /* Auto-advance after answer */
  useEffect(() => {
    if (!state.answered) return;
    const t = setTimeout(() => {
      if (isLast) {
        setState((p) => ({ ...p, finished: true }));
      } else {
        setState((p) => ({ ...p, currentIndex: p.currentIndex + 1, selectedId: null, answered: false }));
        setLightPhase('red');
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [state.answered, isLast]);

  const handleAnswer = (id: TrafficAnswer['id']) => {
    if (state.answered) return;
    const correct = id === q.correctId;
    setLightPhase(correct ? 'green' : 'red');
    setState((p) => ({
      ...p,
      selectedId: id,
      answered: true,
      score: correct ? p.score + PTS : p.score,
    }));
  };

  if (state.finished) return <ResultScreen score={state.score} onRestart={() => setState(init())} onBack={onBack} />;

  const progress = ((state.currentIndex) / TOTAL) * 100;

  return (
    <div style={styles.container}>
      {/* Top row: level badge + progress + traffic light */}
      <div style={styles.topRow}>
        <div style={styles.levelBadge}>
          <span style={styles.levelWord}>ÚROVEŇ</span>
          <span style={styles.levelNum}>{state.currentIndex + 1}</span>
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressText}>{state.currentIndex + 1} / {TOTAL}</div>
        </div>

        <div style={styles.scoreBox}>
          <span style={styles.scoreStar}>⭐</span>
          <span style={styles.scoreVal}>{state.score}</span>
        </div>
      </div>

      {/* Main question card */}
      <div style={styles.questionCard}>
        {/* Traffic sign */}
        <div style={styles.signArea}>
          <q.Sign size={160} />
        </div>
        <p style={styles.questionText}>{q.question}</p>

        {/* Explanation after answering */}
        {state.answered && (
          <div style={{
            ...styles.explanation,
            background: state.selectedId === q.correctId ? '#f0fdf4' : '#fef2f2',
            borderColor: state.selectedId === q.correctId ? '#86efac' : '#fca5a5',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>
              {state.selectedId === q.correctId ? '✅' : '❌'}
            </span>
            <span style={styles.explText}>{q.explanation}</span>
          </div>
        )}
      </div>

      {/* Answers + traffic light side by side */}
      <div style={styles.answersRow}>
        <div style={styles.answersCol}>
          {q.answers.map((ans) => {
            const isSelected = state.selectedId === ans.id;
            const isCorrect = ans.id === q.correctId;
            const answered = state.answered;

            let bg = '#fff';
            let border = '#fde68a';
            let color = '#1e293b';
            let shadow = '0 3px 12px rgba(0,0,0,0.08)';

            if (answered && isCorrect) { bg = '#f0fdf4'; border = '#16a34a'; color = '#15803d'; shadow = '0 0 20px rgba(22,163,74,0.25)'; }
            else if (answered && isSelected) { bg = '#fef2f2'; border = '#dc2626'; color = '#b91c1c'; }

            return (
              <button
                key={ans.id}
                style={{
                  ...styles.answerBtn,
                  background: bg,
                  borderColor: border,
                  color,
                  boxShadow: shadow,
                  cursor: answered ? 'default' : 'pointer',
                  transform: isSelected && !answered ? 'scale(0.97)' : 'scale(1)',
                }}
                onClick={() => handleAnswer(ans.id)}
                disabled={answered}
              >
                <span style={{
                  ...styles.answerLetter,
                  background: answered && isCorrect ? '#16a34a' : answered && isSelected ? '#dc2626' : '#fef3c7',
                  color: answered && (isCorrect || isSelected) ? '#fff' : '#92400e',
                }}>
                  {ans.id}
                </span>
                <span style={styles.answerText}>{ans.text}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.lightCol}>
          <TrafficLight phase={lightPhase} />
        </div>
      </div>

      <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
    </div>
  );
}

/* ─── Result ─── */
function ResultScreen({ score, onRestart, onBack }: { score: number; onRestart: () => void; onBack: () => void }) {
  const max = TOTAL * PTS;
  const pct = score / max;
  const emoji = pct >= 0.9 ? '🏆' : pct >= 0.6 ? '🥈' : pct >= 0.3 ? '🥉' : '📚';
  const msg = pct >= 0.9
    ? 'Výborne! Ste vzorný vodič!'
    : pct >= 0.6
    ? 'Dobre! Pravidlá poznáte slušne.'
    : pct >= 0.3
    ? 'Skúste to znova, ešte sa to dá!'
    : 'Odporúčame opakovanie pravidiel.';
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;

  return (
    <div style={styles.result}>
      <div style={{ fontSize: '110px', lineHeight: 1, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>{emoji}</div>
      <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#d97706', letterSpacing: '0.06em' }}>VÝSLEDOK</h2>
      <div style={{ fontSize: '72px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
        {score}<span style={{ fontSize: '28px', color: '#94a3b8' }}> / {max} bodov</span>
      </div>
      <p style={{ fontSize: '24px', color: '#475569', maxWidth: '580px', textAlign: 'center', lineHeight: 1.5 }}>{msg}</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        {[1, 2, 3].map((i) => <span key={i} style={{ fontSize: '52px', opacity: i <= stars ? 1 : 0.2 }}>⭐</span>)}
      </div>
      <div style={{ display: 'flex', gap: '20px', width: '100%', marginTop: '8px' }}>
        <button style={{ ...styles.bigBtn, background: 'linear-gradient(135deg,#f59e0b,#d97706)' }} onClick={onRestart}>↺ HRAŤ ZNOVA</button>
        <button style={{ ...styles.bigBtn, background: '#fff', color: '#64748b', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} onClick={onBack}>← SPÄŤ</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px 44px 28px',
    overflowY: 'auto',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  levelBadge: {
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    borderRadius: '18px',
    padding: '12px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
    flexShrink: 0,
    minWidth: '90px',
  },
  levelWord: { fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.08em' },
  levelNum: { fontSize: '40px', fontWeight: 900, color: '#fff', lineHeight: 1 },
  progressWrap: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  progressTrack: { height: '14px', background: '#fde68a', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '99px', transition: 'width 0.4s ease' },
  progressText: { fontSize: '16px', fontWeight: 700, color: '#92400e', textAlign: 'right' },
  scoreBox: {
    background: '#fff',
    border: '2px solid #fde68a',
    borderRadius: '16px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    flexShrink: 0,
  },
  scoreStar: { fontSize: '24px' },
  scoreVal: { fontSize: '26px', fontWeight: 800, color: '#d97706' },
  questionCard: {
    background: '#fff',
    borderRadius: '28px',
    padding: '28px 32px 24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    border: '2px solid #fde68a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  signArea: {
    display: 'flex',
    justifyContent: 'center',
    filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.18))',
  },
  questionText: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  explanation: {
    width: '100%',
    borderRadius: '14px',
    padding: '14px 20px',
    border: '2px solid',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    animation: 'fadeSlideUp 0.3s ease both',
  },
  explText: { fontSize: '17px', color: '#374151', lineHeight: 1.5, fontWeight: 500 },
  answersRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  answersCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  lightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '8px',
    flexShrink: 0,
  },
  answerBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '22px 26px',
    borderRadius: '18px',
    border: '3px solid',
    cursor: 'pointer',
    transition: 'all 0.14s ease',
    textAlign: 'left',
  },
  answerLetter: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 900,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  answerText: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  backBtn: {
    alignSelf: 'center',
    background: '#fff',
    color: '#64748b',
    fontSize: '21px',
    fontWeight: 700,
    padding: '20px 48px',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
    cursor: 'pointer',
  },
  result: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '32px 56px',
    textAlign: 'center',
  },
  bigBtn: {
    flex: 1,
    fontSize: '26px',
    fontWeight: 800,
    padding: '28px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
    letterSpacing: '0.03em',
  },
};
