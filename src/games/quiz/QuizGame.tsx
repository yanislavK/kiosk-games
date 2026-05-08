import React, { useState, useEffect, useRef } from 'react';
import type { QuizState, Answer } from './types';
import { BRATISLAVA_QUESTIONS } from './questions';

interface Props {
  onBack: () => void;
  onGameEnd?: (score: number) => void;
}

const POINTS_PER_CORRECT = 10;
const INITIAL_STARS = 3;
const HINT_COST = 1;

function initState(): QuizState {
  return {
    currentIndex: 0,
    selectedId: null,
    answerState: 'idle',
    score: 0,
    stars: INITIAL_STARS,
    hintsUsed: 0,
    eliminatedIds: [],
    finished: false,
  };
}

export default function QuizGame({ onBack, onGameEnd }: Props) {
  const [state, setState] = useState<QuizState>(initState);
  const [showFact, setShowFact] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (state.finished) {
      if (!calledRef.current) { calledRef.current = true; onGameEnd?.(state.score); }
    } else {
      calledRef.current = false;
    }
  }, [state.finished, state.score, onGameEnd]);

  const question = BRATISLAVA_QUESTIONS[state.currentIndex];
  const isLast = state.currentIndex === BRATISLAVA_QUESTIONS.length - 1;
  const canUseHint = state.stars > 0 && state.answerState === 'idle' && state.eliminatedIds.length < 2;

  // Auto-advance after answering
  useEffect(() => {
    if (state.answerState === 'idle' || state.answerState === 'revealed') return;
    const timer = setTimeout(() => {
      setShowFact(false);
      if (isLast) {
        setState((prev) => ({ ...prev, finished: true }));
      } else {
        setState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          selectedId: null,
          answerState: 'idle',
          eliminatedIds: [],
        }));
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [state.answerState, isLast]);

  const handleAnswer = (id: Answer['id']) => {
    if (state.answerState !== 'idle' || state.selectedId !== null) return;
    const correct = id === question.correctId;
    setShowFact(true);
    setState((prev) => ({
      ...prev,
      selectedId: id,
      answerState: correct ? 'correct' : 'wrong',
      score: correct ? prev.score + POINTS_PER_CORRECT : prev.score,
    }));
  };

  const handleHint = () => {
    if (!canUseHint) return;
    const wrongAnswers = question.answers
      .filter((a) => a.id !== question.correctId && !state.eliminatedIds.includes(a.id))
      .map((a) => a.id);
    if (wrongAnswers.length === 0) return;
    const toEliminate = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    setState((prev) => ({
      ...prev,
      stars: Math.max(0, prev.stars - HINT_COST),
      hintsUsed: prev.hintsUsed + 1,
      eliminatedIds: [...prev.eliminatedIds, toEliminate],
    }));
  };

  const restart = () => {
    setShowFact(false);
    setState(initState());
  };

  if (state.finished) {
    return <ResultScreen score={state.score} stars={state.stars} total={BRATISLAVA_QUESTIONS.length} onRestart={restart} onBack={onBack} />;
  }

  const progress = (state.currentIndex / BRATISLAVA_QUESTIONS.length) * 100;

  return (
    <div style={styles.container}>
      {/* Header row */}
      <div style={styles.topRow}>
        <div style={styles.timerBox}>
          <span style={styles.timerIcon}>❓</span>
          <span style={styles.timerNum}>{state.currentIndex + 1}/{BRATISLAVA_QUESTIONS.length}</span>
        </div>
        <div style={styles.progressLabel}>OTÁZKA {state.currentIndex + 1} / {BRATISLAVA_QUESTIONS.length}</div>
        <div style={styles.scoreBox}>
          <span style={styles.starIcon}>⭐</span>
          <span style={styles.scoreNum}>{state.score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div style={styles.questionCard}>
        <p style={styles.questionText}>{question.question}</p>
      </div>

      {/* Fun fact */}
      {showFact && (
        <div style={{
          ...styles.factBox,
          background: state.answerState === 'correct' ? '#f0fdf4' : '#fef2f2',
          borderColor: state.answerState === 'correct' ? '#86efac' : '#fca5a5',
        }}>
          <span style={styles.factIcon}>{state.answerState === 'correct' ? '✅' : '❌'}</span>
          <span style={styles.factText}>{question.funFact}</span>
        </div>
      )}

      {/* Answer buttons */}
      <div style={styles.answersGrid}>
        {question.answers.map((answer) => {
          const isEliminated = state.eliminatedIds.includes(answer.id);
          const isSelected = state.selectedId === answer.id;
          const isCorrect = answer.id === question.correctId;
          const answered = state.answerState !== 'idle';

          let bg = '#fff';
          let border = '#e2e8f0';
          let color = '#1e293b';
          let opacity: number = isEliminated ? 0.3 : 1;

          if (answered && isCorrect) { bg = '#f0fdf4'; border = '#16a34a'; color = '#15803d'; }
          else if (answered && isSelected && !isCorrect) { bg = '#fef2f2'; border = '#dc2626'; color = '#b91c1c'; }

          return (
            <button
              key={answer.id}
              style={{
                ...styles.answerBtn,
                background: bg,
                borderColor: border,
                color,
                opacity,
                cursor: isEliminated || answered ? 'default' : 'pointer',
                transform: isSelected ? 'scale(0.98)' : 'scale(1)',
              }}
              onClick={() => !isEliminated && handleAnswer(answer.id)}
              disabled={isEliminated || answered}
            >
              <span style={{
                ...styles.answerLetter,
                background: answered && isCorrect
                  ? '#16a34a'
                  : answered && isSelected && !isCorrect
                  ? '#dc2626'
                  : '#f1f5f9',
                color: (answered && (isCorrect || (isSelected && !isCorrect))) ? '#fff' : '#64748b',
              }}>
                {answer.id}
              </span>
              <span style={styles.answerText}>{answer.text}</span>
            </button>
          );
        })}
      </div>

      {/* Hint + back */}
      <div style={styles.bottomRow}>
        <button
          style={{
            ...styles.hintBtn,
            opacity: canUseHint ? 1 : 0.4,
            cursor: canUseHint ? 'pointer' : 'default',
          }}
          onClick={handleHint}
          disabled={!canUseHint}
        >
          💡 POMÔCKA &nbsp;<span style={styles.hintCost}>-{HINT_COST} ⭐</span>
        </button>
        <div style={styles.starsDisplay}>
          {[...Array(INITIAL_STARS)].map((_, i) => (
            <span key={i} style={{ fontSize: '32px', opacity: i < state.stars ? 1 : 0.25 }}>⭐</span>
          ))}
        </div>
        <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
      </div>
    </div>
  );
}

interface ResultProps {
  score: number;
  stars: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}

function ResultScreen({ score, stars, total, onRestart, onBack }: ResultProps) {
  const maxScore = total * POINTS_PER_CORRECT;
  const pct = score / maxScore;
  const emoji = pct >= 0.9 ? '🏆' : pct >= 0.6 ? '🥈' : pct >= 0.3 ? '🥉' : '📚';
  const msg = pct >= 0.9
    ? 'Výborné! Ste expert na Bratislavu!'
    : pct >= 0.6
    ? 'Dobrá práca! Bratislavu dobre poznáte.'
    : pct >= 0.3
    ? 'Pokračujte! Ešte je čo objavovať.'
    : 'Nevadí – Bratislava má veľa tajomstiev!';

  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultEmoji}>{emoji}</div>
      <h2 style={styles.resultTitle}>VÝSLEDOK</h2>
      <div style={styles.resultScore}>{score}<span style={styles.resultMax}> / {maxScore} bodov</span></div>
      <p style={styles.resultMsg}>{msg}</p>

      <div style={styles.resultStars}>
        {[...Array(INITIAL_STARS)].map((_, i) => (
          <span key={i} style={{ fontSize: '52px', opacity: i < stars ? 1 : 0.2 }}>⭐</span>
        ))}
      </div>

      <div style={styles.resultActions}>
        <button style={styles.btnRestart} onClick={onRestart}>↺ HRAŤ ZNOVA</button>
        <button style={styles.btnBackResult} onClick={onBack}>← SPÄŤ</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '28px 48px 32px',
    overflowY: 'auto',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff',
    borderRadius: '16px',
    padding: '14px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #fed7aa',
  },
  timerIcon: { fontSize: '24px' },
  timerNum: { fontSize: '24px', fontWeight: 800, color: '#ea580c' },
  progressLabel: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#64748b',
    letterSpacing: '0.06em',
  },
  scoreBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff',
    borderRadius: '16px',
    padding: '14px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '2px solid #fed7aa',
  },
  starIcon: { fontSize: '24px' },
  scoreNum: { fontSize: '24px', fontWeight: 800, color: '#ea580c' },
  progressTrack: {
    height: '12px',
    background: '#fed7aa',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ea580c, #f97316)',
    borderRadius: '99px',
    transition: 'width 0.4s ease',
  },
  questionCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '36px 40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    border: '2px solid #fed7aa',
    minHeight: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 1.45,
  },
  factBox: {
    borderRadius: '16px',
    padding: '16px 24px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    animation: 'fadeSlideUp 0.3s ease both',
  },
  factIcon: { fontSize: '24px', flexShrink: 0, marginTop: '2px' },
  factText: { fontSize: '18px', color: '#374151', lineHeight: 1.5, fontWeight: 500 },
  answersGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  answerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 24px',
    borderRadius: '20px',
    border: '3px solid',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  answerLetter: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 900,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  answerText: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: 'auto',
  },
  hintBtn: {
    background: '#fff',
    border: '2px solid #fed7aa',
    borderRadius: '16px',
    padding: '18px 24px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    whiteSpace: 'nowrap',
  },
  hintCost: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#f97316',
  },
  starsDisplay: {
    display: 'flex',
    gap: '8px',
  },
  backBtn: {
    background: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    padding: '18px 28px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#64748b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  // Result screen
  resultContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '28px',
    padding: '40px 64px',
    textAlign: 'center',
  },
  resultEmoji: {
    fontSize: '120px',
    lineHeight: 1,
    animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
  },
  resultTitle: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#ea580c',
    letterSpacing: '0.08em',
  },
  resultScore: {
    fontSize: '80px',
    fontWeight: 900,
    color: '#1e293b',
    lineHeight: 1,
  },
  resultMax: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#94a3b8',
  },
  resultMsg: {
    fontSize: '26px',
    color: '#475569',
    lineHeight: 1.5,
    maxWidth: '600px',
  },
  resultStars: {
    display: 'flex',
    gap: '12px',
  },
  resultActions: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    marginTop: '12px',
  },
  btnRestart: {
    flex: 2,
    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
    color: '#fff',
    fontSize: '28px',
    fontWeight: 800,
    padding: '30px 24px',
    borderRadius: '20px',
    border: 'none',
    boxShadow: '0 6px 24px rgba(234,88,12,0.4)',
    cursor: 'pointer',
    letterSpacing: '0.03em',
  },
  btnBackResult: {
    flex: 1,
    background: '#fff',
    color: '#64748b',
    fontSize: '24px',
    fontWeight: 700,
    padding: '30px 24px',
    borderRadius: '20px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
};
