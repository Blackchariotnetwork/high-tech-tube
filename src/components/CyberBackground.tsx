import React, { useEffect, useRef, useState } from 'react';

export const CyberBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth mouse tracking for dynamic ambient illumination
  useEffect(() => {
    let animId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetX = e.touches[0].clientX;
        targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Smooth lerp for buttery organic spotlight tracking
    const update = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({
        x: (currentX / window.innerWidth) * 100,
        y: (currentY / window.innerHeight) * 100,
      });
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Subtle floating stream particles on canvas (ultra lightweight, 30 particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 28 subtle slow floating optic nodes
    const particles = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.35 - 0.05,
      opacity: Math.random() * 0.35 + 0.05,
    }));

    let animFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deep Futuristic Base Gradient */}
      <div className="absolute inset-0 bg-[#050608]" />

      {/* 2. Cybernetic Matrix Grid Pattern with Radial Mask */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 20%, transparent 85%)',
        }}
      />

      {/* 3. Micro Tech Dot Accents */}
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* 4. Interactive Organic Spotlight Aura (Follows cursor smoothly) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.045), rgba(56, 189, 248, 0.015) 35%, transparent 70%)`,
        }}
      />

      {/* 5. Ambient Top Light Spill */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 6. Subtle Optic Nodes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" />

      {/* 7. Precision Hairline Reticle Coordinates in Viewport Corners */}
      <div className="absolute top-6 left-6 text-[9px] font-mono text-neutral-700/60 tracking-widest hidden sm:block">
        + MATRIX_STREAM // 05
      </div>
      <div className="absolute top-6 right-6 text-[9px] font-mono text-neutral-700/60 tracking-widest hidden sm:block">
        FREQ_2088 // LOW_LATENCY +
      </div>
      <div className="absolute bottom-6 left-6 text-[9px] font-mono text-neutral-700/60 tracking-widest hidden sm:block">
        + SYS.READY
      </div>
      <div className="absolute bottom-6 right-6 text-[9px] font-mono text-neutral-700/60 tracking-widest hidden sm:block">
        OPTICAL_BUS // 60FPS +
      </div>

      {/* 8. Fine Filmic Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
