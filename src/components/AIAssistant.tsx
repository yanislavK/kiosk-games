import { useState, useEffect, useRef, useCallback } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';

interface Props {
  onClose: () => void;
}

interface MsgEntry {
  id: number;
  source: 'user' | 'agent';
  text: string;
}

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string;

// Outer wrapper — provides context and captures transcript via onMessage
export default function AIAssistant({ onClose }: Props) {
  const [transcript, setTranscript] = useState<MsgEntry[]>([]);
  const idRef = useRef(0);

  const handleMessage = useCallback((msg: any) => {
    const source: 'user' | 'agent' | undefined =
      msg?.source === 'user' ? 'user' : msg?.source === 'agent' ? 'agent' : undefined;
    const text = typeof msg?.message === 'string' ? msg.message.trim() : '';
    if (!source || !text) return;
    setTranscript(prev => [...prev.slice(-9), { id: ++idRef.current, source, text }]);
  }, []);

  return (
    <ConversationProvider onMessage={handleMessage}>
      <AIContent onClose={onClose} transcript={transcript} />
    </ConversationProvider>
  );
}

// Inner component — uses conversation hooks
function AIContent({ onClose, transcript }: Props & { transcript: MsgEntry[] }) {
  const conv = useConversation();
  const { status, isSpeaking } = conv;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const startedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-start session on mount
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conv.startSession({ agentId: AGENT_ID });
      } catch (err) {
        console.error('[ElevenLabs] session error:', err);
      }
    })();
    return () => { conv.endSession(); };
  }, []);

  // Scroll transcript to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      const connected = status === 'connected';
      const freqData = connected
        ? (isSpeaking ? conv.getOutputByteFrequencyData() : conv.getInputByteFrequencyData())
        : null;

      if (!freqData) {
        const t = Date.now() / 700;
        const amp = status === 'connecting' ? 18 : 5;
        ctx.beginPath();
        ctx.strokeStyle = status === 'connecting' ? '#f59e0b88' : '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2
            + Math.sin(x / 40 + t) * amp
            + Math.sin(x / 17 + t * 1.6) * (amp * 0.4);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const BAR = 64;
      const slice = Math.floor(freqData.length / BAR);
      const bw = W / BAR;
      const main = isSpeaking ? '#3b82f6' : '#10b981';
      const dim  = isSpeaking ? '#1d4ed830' : '#06644330';

      for (let i = 0; i < BAR; i++) {
        let sum = 0;
        for (let j = 0; j < slice; j++) sum += freqData[i * slice + j];
        const h = Math.max(3, (sum / slice / 255) * H * 0.88);
        const x = i * bw;
        const y = (H - h) / 2;
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, dim);
        g.addColorStop(0.5, main);
        g.addColorStop(1, dim);
        ctx.fillStyle = g;
        ctx.fillRect(x + 2, y, bw - 4, h);
      }
    };

    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [status, isSpeaking, conv]);

  const end = async () => { await conv.endSession(); onClose(); };

  const isConnected = status === 'connected';
  const color = status === 'connecting' ? '#f59e0b'
    : !isConnected       ? '#475569'
    : isSpeaking         ? '#3b82f6'
    :                      '#10b981';

  const label = status === 'disconnected' ? 'Odpojený'
    : status === 'connecting'              ? 'Pripájam...'
    : isSpeaking                           ? 'AI hovorí...'
    :                                        'Počúvam vás...';

  const icon = status === 'connecting' ? '⏳'
    : !isConnected       ? '🤖'
    : isSpeaking         ? '🔊'
    :                      '🎙️';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'linear-gradient(180deg,#020617 0%,#0f172a 60%,#020617 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 52px',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '32px 48px 0' }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.02em' }}>🤖 AI ASISTENT</div>
          <div style={{ fontSize: 17, color: '#475569', marginTop: 4 }}>Hlasový pomocník mesta</div>
        </div>
        <button onClick={end} style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid #1e293b', borderRadius: 16, padding: '13px 22px', color: '#475569', fontSize: 22, cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* ── Status ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 32 }}>
        <div style={{ width: 11, height: 11, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}55` }} />
        <span style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '0.03em' }}>{label}</span>
      </div>

      {/* ── Orb ── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 44, flexShrink: 0 }}>
        {isConnected && (
          <>
            <div className="ai-ring ai-ring-1" style={{ borderColor: color + '33' }} />
            <div className="ai-ring ai-ring-2" style={{ borderColor: color + '55' }} />
          </>
        )}
        <div style={{
          width: 170, height: 170, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle at 36% 36%, ${color}55, ${color}14)`,
          border: `3px solid ${color}44`,
          boxShadow: `0 0 48px ${color}2a, 0 0 90px ${color}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 68,
        }}>
          {icon}
        </div>
      </div>

      {/* ── Waveform ── */}
      <canvas ref={canvasRef} width={920} height={96}
        style={{ width: 920, height: 96, marginTop: 40, flexShrink: 0 }} />

      {/* ── Transcript ── */}
      <div style={{
        width: 920, flex: 1, overflowY: 'auto', display: 'flex',
        flexDirection: 'column', gap: 12, padding: '20px 0 4px', minHeight: 0,
      }}>
        {transcript.length === 0 && isConnected && (
          <div style={{ textAlign: 'center', color: '#1e293b', fontSize: 19, paddingTop: 12 }}>
            Začnite hovoriť...
          </div>
        )}
        {transcript.map(m => (
          <div key={m.id} style={{
            alignSelf: m.source === 'user' ? 'flex-end' : 'flex-start',
            background: m.source === 'user' ? 'rgba(37,99,235,0.16)' : 'rgba(16,185,129,0.11)',
            border: `1px solid ${m.source === 'user' ? '#2563eb2a' : '#10b9812a'}`,
            borderRadius: 18, padding: '13px 20px', maxWidth: '78%',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', marginBottom: 5, color: m.source === 'user' ? '#60a5fa' : '#34d399', textTransform: 'uppercase' }}>
              {m.source === 'user' ? 'Vy' : 'AI Asistent'}
            </div>
            <div style={{ fontSize: 20, color: '#e2e8f0', lineHeight: 1.55 }}>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── End button ── */}
      <button onClick={end} style={{
        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
        color: '#fff', fontSize: 24, fontWeight: 800, letterSpacing: '0.04em',
        padding: '22px 80px', borderRadius: 20, border: 'none',
        boxShadow: '0 8px 32px rgba(239,68,68,0.35)',
        marginTop: 20, flexShrink: 0, cursor: 'pointer',
      }}>
        🔴 Ukončiť rozhovor
      </button>
    </div>
  );
}
