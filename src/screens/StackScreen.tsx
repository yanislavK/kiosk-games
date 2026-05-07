import StackGame from '../games/stack/StackGame';

interface Props { onBack: () => void; }

export default function StackScreen({ onBack }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <StackGame onBack={onBack} />
    </div>
  );
}
