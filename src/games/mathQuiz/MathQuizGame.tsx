import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Difficulty, MathQuizState, QuestionPart } from './types';
import { DIFF_CONFIGS } from './types';
import { generateQuestions, TOTAL } from './generator';

const BASE_PTS = 10;
const STREAK_BONUS = [0, 0, 0, 5, 8, 10]; // bonus at streak 3,4,5+

interface Props {
  difficulty: Difficulty;
  onBack: () => void;
}

function initState(difficulty: Difficulty): MathQuizState {
  return {
    questions: generateQuestions(difficulty),
    currentIndex: 0,
    selectedChoice: null,
    answered: false,
    timeLeft: DIFF_CONFIGS[difficulty].timeLimit,
    score: 0,
    streak: 0,
    maxStreak: 0,
    finished: false,
  };
}

export default function MathQuizGame({ difficulty, onBack }: Props) {
  const [state, setState] = useState<MathQuizState>(() => initState(difficulty));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = DIFF_CONFIGS[difficulty];

  const q = state.questions[state.currentIndex];
  const isLast = state.currentIndex === TOTAL - 1;

  const advance = useCallback((_correct: boolean, chosenScore: number, newStreak: number) => {
    setTimeout(() => {
      if (isLast) {
        setState((p) => ({ ...p, finished: true }));
      } else {
        setState((p) => ({
          ...p,
          currentIndex: p.currentIndex + 1,
          selectedChoice: null,
          answered: false,
          timeLeft: cfg.timeLimit,
          score: p.score + chosenScore,
          streak: newStreak,
          maxStreak: Math.max(p.maxStreak, newStreak),
        }));
      }
    }, 1800);
  }, [isLast, cfg.timeLimit]);

  const handleAnswer = useCallback((choice: number | null) => {
    if (state.answered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = choice === q.answer;
    const newStreak = correct ? state.streak + 1 : 0;
    const bonus = STREAK_BONUS[Math.min(newStreak, STREAK_BONUS.length - 1)];
    const pts = correct ? BASE_PTS + bonus : 0;

    setState((p) => ({
      ...p,
      selectedChoice: choice,
      answered: true,
      score: isLast ? p.score + pts : p.score,
      streak: newStreak,
      maxStreak: Math.max(p.maxStreak, newStreak),
    }));

    advance(correct, pts, newStreak);
  }, [state.answered, state.streak, q.answer, advance, isLast]);

  // Countdown timer
  useEffect(() => {
    if (state.answered || state.finished) return;
    timerRef.current = setInterval(() => {
      setState((p) => {
        if (p.timeLeft <= 1) {
          clearInterval(timerRef.current!);
          return p; // trigger timeout via the effect below
        }
        return { ...p, timeLeft: p.timeLeft - 1 };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.currentIndex, state.answered, state.finished]);

  // Timeout trigger
  useEffect(() => {
    if (!state.answered && state.timeLeft === 0) handleAnswer(null);
  }, [state.timeLeft, state.answered, handleAnswer]);

  const restart = () => setState(initState(difficulty));

  if (state.finished) {
    return <ResultScreen score={state.score} maxStreak={state.maxStreak} onRestart={restart} onBack={onBack} />;
  }

  const timeFraction = state.timeLeft / cfg.timeLimit;
  const timerColor = timeFraction > 0.5 ? '#0891b2' : timeFraction > 0.25 ? '#f59e0b' : '#e11d48';
  const bonusAt = STREAK_BONUS[Math.min(state.streak + 1, STREAK_BONUS.length - 1)];
  const showStreakBonus = state.streak >= 2;

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        {/* Streak */}
        <div style={{ ...styles.pill, borderColor: state.streak >= 3 ? '#f97316' : '#a5f3fc' }}>
          <span style={{ fontSize: '24px' }}>{state.streak >= 3 ? '🔥' : '✨'}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>SÉRIA</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: state.streak >= 3 ? '#f97316' : '#0891b2', lineHeight: 1 }}>{state.streak}</div>
          </div>
          {showStreakBonus && <span style={styles.bonusBadge}>+{bonusAt}</span>}
        </div>

        {/* Progress */}
        <div style={styles.progressWrap}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${(state.currentIndex / TOTAL) * 100}%` }} />
          </div>
          <div style={styles.progressLabel}>{state.currentIndex + 1} / {TOTAL}</div>
        </div>

        {/* Score */}
        <div style={{ ...styles.pill, borderColor: '#a5f3fc' }}>
          <span style={{ fontSize: '24px' }}>⭐</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>BODY</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0891b2', lineHeight: 1 }}>{state.score}</div>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div style={styles.timerTrack}>
        <div style={{
          ...styles.timerFill,
          width: `${(state.timeLeft / cfg.timeLimit) * 100}%`,
          background: timerColor,
          transition: 'width 1s linear, background 0.5s',
        }} />
        <span style={{ ...styles.timerNum, color: timerColor }}>{state.timeLeft}s</span>
      </div>

      {/* Question card */}
      <div style={styles.questionCard}>
        <p style={styles.questionHint}>
          {q.display.some(p => p.type === 'blank' && q.display.indexOf(p) < 3)
            ? 'Aké číslo chýba?'
            : 'Vypočítaj príklad:'}
        </p>
        <div style={styles.equationRow}>
          {q.display.map((part, i) => <EquationPart key={i} part={part} operation={q.operation} />)}
        </div>
        {/* Correct/wrong feedback */}
        {state.answered && (
          <div style={{
            ...styles.feedback,
            background: state.selectedChoice === q.answer ? '#ecfdf5' : '#fef2f2',
            borderColor: state.selectedChoice === q.answer ? '#6ee7b7' : '#fca5a5',
          }}>
            <span style={{ fontSize: '28px' }}>{state.selectedChoice === q.answer ? '✅' : '❌'}</span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>
              {state.selectedChoice === q.answer
                ? state.streak >= 3 ? `Skvelé! 🔥 Séria ${state.streak}! +${STREAK_BONUS[Math.min(state.streak, STREAK_BONUS.length-1)]} bonus` : 'Správne!'
                : `Správna odpoveď: ${q.answer}`}
            </span>
          </div>
        )}
        {/* Timeout feedback */}
        {state.answered && state.selectedChoice === null && (
          <div style={{ ...styles.feedback, background: '#fff7ed', borderColor: '#fdba74' }}>
            <span style={{ fontSize: '28px' }}>⏰</span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#9a3412' }}>
              Čas vypršal! Správna odpoveď: {q.answer}
            </span>
          </div>
        )}
      </div>

      {/* Choice grid */}
      <div style={styles.choicesGrid}>
        {q.choices.map((choice) => {
          const isSelected = state.selectedChoice === choice;
          const isCorrect = choice === q.answer;
          const answered = state.answered;
          let bg = '#fff', border = '#a5f3fc', color = '#1e293b';
          if (answered && isCorrect) { bg = '#ecfdf5'; border = '#16a34a'; color = '#065f46'; }
          else if (answered && isSelected && !isCorrect) { bg = '#fef2f2'; border = '#dc2626'; color = '#991b1b'; }
          return (
            <button
              key={choice}
              style={{
                ...styles.choiceBtn,
                background: bg, borderColor: border, color,
                cursor: answered ? 'default' : 'pointer',
                transform: isSelected ? 'scale(0.96)' : 'scale(1)',
                boxShadow: isCorrect && answered
                  ? '0 0 24px rgba(22,163,74,0.3)' : '0 3px 12px rgba(0,0,0,0.08)',
              }}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
            >
              {choice}
            </button>
          );
        })}
      </div>

      <button style={styles.backBtn} onClick={onBack}>← SPÄŤ</button>
    </div>
  );
}

/* Renders one part of the equation */
function EquationPart({ part }: { part: QuestionPart; operation: string }) {
  const opColors: Record<string, string> = {
    '+': '#16a34a', '−': '#dc2626', '×': '#7c3aed', '÷': '#d97706',
  };

  if (part.type === 'number') {
    return <span style={styles.eqNum}>{part.value}</span>;
  }
  if (part.type === 'op') {
    return (
      <span style={{ ...styles.eqOp, background: opColors[part.value] ?? '#0891b2' }}>
        {part.value}
      </span>
    );
  }
  if (part.type === 'equals') {
    return <span style={styles.eqEquals}>=</span>;
  }
  // blank
  return (
    <span style={{ ...styles.eqNum, color: '#0891b2', borderBottom: '5px solid #0891b2', minWidth: '70px', textAlign: 'center' }}>
      ?
    </span>
  );
}

/* Result screen */
function ResultScreen({ score, maxStreak, onRestart, onBack }: {
  score: number; maxStreak: number; onRestart: () => void; onBack: () => void;
}) {
  const max = TOTAL * (BASE_PTS + 10);
  const pct = score / max;
  const emoji = pct >= 0.85 ? '🏆' : pct >= 0.6 ? '🥈' : pct >= 0.35 ? '🥉' : '📚';
  const msg = pct >= 0.85 ? 'Matematický génius! Perfektné!' : pct >= 0.6 ? 'Výborne! Výborný výsledok!' : pct >= 0.35 ? 'Dobrý pokus! Ešte treba trénovať.' : 'Nevadí, matematika si vyžaduje čas!';
  const stars = pct >= 0.85 ? 3 : pct >= 0.55 ? 2 : 1;

  return (
    <div style={styles.result}>
      <div style={{ fontSize: '100px', lineHeight: 1, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>{emoji}</div>
      <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#0891b2', letterSpacing: '0.06em' }}>VÝSLEDOK</h2>

      <div style={styles.resultStats}>
        <div style={styles.rStat}>
          <span style={{ fontSize: '40px' }}>⭐</span>
          <span style={styles.rVal}>{score}</span>
          <span style={styles.rLbl}>Bodov</span>
        </div>
        <div style={styles.rStat}>
          <span style={{ fontSize: '40px' }}>🔥</span>
          <span style={styles.rVal}>{maxStreak}</span>
          <span style={styles.rLbl}>Max séria</span>
        </div>
        <div style={styles.rStat}>
          <span style={{ fontSize: '40px' }}>📊</span>
          <span style={styles.rVal}>{Math.round(pct * 100)}%</span>
          <span style={styles.rLbl}>Úspešnosť</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {[1, 2, 3].map(i => <span key={i} style={{ fontSize: '52px', opacity: i <= stars ? 1 : 0.2 }}>⭐</span>)}
      </div>

      <p style={{ fontSize: '24px', color: '#475569', textAlign: 'center', lineHeight: 1.5, maxWidth: '560px' }}>{msg}</p>

      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <button style={{ ...styles.bigBtn, background: 'linear-gradient(135deg,#0891b2,#0e7490)' }} onClick={onRestart}>↺ HRAŤ ZNOVA</button>
        <button style={{ ...styles.bigBtn, background: '#fff', color: '#64748b', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} onClick={onBack}>← SPÄŤ</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', padding: '18px 44px 24px', overflowY: 'auto' },
  topBar: { display: 'flex', alignItems: 'center', gap: '14px' },
  pill: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '2px solid', borderRadius: '16px', padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', position: 'relative', flexShrink: 0 },
  bonusBadge: { position: 'absolute', top: -8, right: -8, background: '#f97316', color: '#fff', fontSize: '13px', fontWeight: 900, padding: '2px 8px', borderRadius: '99px' },
  progressWrap: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  progressTrack: { height: '12px', background: '#cffafe', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#0891b2,#06b6d4)', borderRadius: '99px', transition: 'width 0.4s ease' },
  progressLabel: { fontSize: '16px', fontWeight: 700, color: '#0891b2', textAlign: 'right' },
  timerTrack: { height: '18px', background: '#e0f2fe', borderRadius: '99px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' },
  timerFill: { height: '100%', borderRadius: '99px' },
  timerNum: { position: 'absolute', right: '10px', fontSize: '13px', fontWeight: 800 },
  questionCard: { background: '#fff', borderRadius: '28px', padding: '28px 32px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', border: '2px solid #a5f3fc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  questionHint: { fontSize: '22px', color: '#64748b', fontWeight: 600 },
  equationRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  eqNum: { fontSize: '72px', fontWeight: 900, color: '#1e293b', lineHeight: 1 },
  eqOp: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  eqEquals: { fontSize: '56px', fontWeight: 700, color: '#94a3b8' },
  feedback: { width: '100%', borderRadius: '14px', padding: '14px 20px', border: '2px solid', display: 'flex', gap: '12px', alignItems: 'center', animation: 'fadeSlideUp 0.3s ease both' },
  choicesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  choiceBtn: { fontSize: '52px', fontWeight: 900, padding: '28px 20px', borderRadius: '22px', border: '3px solid', boxShadow: '0 3px 12px rgba(0,0,0,0.08)', transition: 'all 0.12s ease', textAlign: 'center' },
  backBtn: { alignSelf: 'center', background: '#fff', color: '#64748b', fontSize: '20px', fontWeight: 700, padding: '18px 44px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', cursor: 'pointer' },
  result: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px', padding: '32px 56px', textAlign: 'center' },
  resultStats: { display: 'flex', gap: '20px', background: '#ecfeff', border: '2px solid #a5f3fc', borderRadius: '20px', padding: '24px 36px', width: '100%' },
  rStat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  rVal: { fontSize: '44px', fontWeight: 900, color: '#0891b2', lineHeight: 1 },
  rLbl: { fontSize: '17px', color: '#64748b', fontWeight: 600 },
  bigBtn: { flex: 1, fontSize: '25px', fontWeight: 800, padding: '28px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', color: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', letterSpacing: '0.03em' },
};
