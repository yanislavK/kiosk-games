import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import KioskLayout from '../components/KioskLayout';
import ParkingScreen from '../screens/ParkingScreen';

function ParkingApp() {
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function applyScale() {
      if (!screenRef.current) return;
      const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
      screenRef.current.style.transform = `scale(${scale})`;
    }
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', overflow: 'hidden' }}>
      <div
        ref={screenRef}
        style={{ width: '1080px', height: '1920px', transformOrigin: 'center center', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}
      >
        <KioskLayout>
          <ParkingScreen onBack={() => window.location.reload()} />
        </KioskLayout>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParkingApp />
  </React.StrictMode>
);
