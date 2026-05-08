import { useState } from 'react';
import StackGame from '../games/stack/StackGame';
import PlayerNameModal from '../components/PlayerNameModal';

interface Props { onBack: () => void; }

export default function StackScreen({ onBack }: Props) {
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      background: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <StackGame onBack={onBack} onGameEnd={setPendingScore} />

      {pendingScore !== null && (
        <PlayerNameModal
          gameId="stack"
          score={pendingScore}
          gameName="Stack"
          onDone={() => setPendingScore(null)}
        />
      )}
    </div>
  );
}
