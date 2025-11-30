'use client';

import { useEffect, useRef } from 'react';

export default function RealisticSpiderWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const webs = [
      { x: canvas.width * 0.15, y: 50, size: 200 },
      { x: canvas.width * 0.85, y: 50, size: 180 },
    ];

    const drawWeb = (web: any) => {
      const segments = 12;
      const rings = 6;

      ctx.strokeStyle = 'rgba(139, 0, 0, 0.2)';
      ctx.lineWidth = 1;

      // Radial threads
      for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        ctx.beginPath();
        ctx.moveTo(web.x, web.y);
        ctx.lineTo(
          web.x + Math.cos(angle) * web.size,
          web.y + Math.sin(angle) * web.size
        );
        ctx.stroke();
      }

      // Rings
      for (let ring = 1; ring <= rings; ring++) {
        ctx.beginPath();
        const radius = (web.size / rings) * ring;
        ctx.arc(web.x, web.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    webs.forEach(drawWeb);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      webs.forEach(drawWeb);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2] opacity-60"
    />
  );
}