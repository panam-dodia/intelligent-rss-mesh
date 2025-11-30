'use client';

import { useEffect, useState } from 'react';

export default function CreepyEyes() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 3000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, []);

  if (!mounted) return null;

  const eyes = [
    { x: 100, y: 100 },
    { x: window.innerWidth - 100, y: 100 },
  ];

  const getEyeDirection = (eyeX: number, eyeY: number) => {
    const dx = mousePos.x - eyeX;
    const dy = mousePos.y - eyeY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 80, 12);

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {eyes.map((eye, i) => {
        const direction = getEyeDirection(eye.x, eye.y);

        return (
          <div
            key={i}
            className="absolute"
            style={{ left: eye.x - 30, top: eye.y - 40 }}
          >
            {/* Eye socket - almond shape */}
            <div className="relative">
              <svg width="60" height="80" viewBox="0 0 60 80">
                {/* Eye socket shadow */}
                <ellipse
                  cx="30"
                  cy="40"
                  rx="28"
                  ry="38"
                  fill="rgba(0, 0, 0, 0.8)"
                  stroke="rgba(139, 0, 0, 0.5)"
                  strokeWidth="2"
                />
                
                {/* Eyeball white */}
                <ellipse
                  cx="30"
                  cy="40"
                  rx={blink ? 24 : 24}
                  ry={blink ? 3 : 32}
                  fill="#1a1a1a"
                  style={{ transition: 'all 0.1s' }}
                />
                
                {!blink && (
                  <>
                    {/* Iris */}
                    <circle
                      cx={30 + direction.x}
                      cy={40 + direction.y}
                      r="14"
                      fill="url(#redIris)"
                    />
                    
                    {/* Pupil */}
                    <circle
                      cx={30 + direction.x}
                      cy={40 + direction.y}
                      r="7"
                      fill="#000"
                    />
                    
                    {/* Highlight */}
                    <circle
                      cx={32 + direction.x}
                      cy={38 + direction.y}
                      r="3"
                      fill="rgba(255, 0, 0, 0.4)"
                    />
                    
                    {/* Blood veins */}
                    <path
                      d={`M30,40 Q${20 + direction.x},${30 + direction.y} 10,20`}
                      stroke="#8B0000"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.6"
                    />
                    <path
                      d={`M30,40 Q${40 + direction.x},${30 + direction.y} 50,20`}
                      stroke="#8B0000"
                      strokeWidth="1"
                      fill="none"
                      opacity="0.6"
                    />
                  </>
                )}
                
                {/* Gradient definition */}
                <defs>
                  <radialGradient id="redIris">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="50%" stopColor="#8B0000" />
                    <stop offset="100%" stopColor="#450000" />
                  </radialGradient>
                </defs>
              </svg>
              
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(139,0,0,0.6) 0%, transparent 70%)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}