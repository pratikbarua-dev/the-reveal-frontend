'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { drawScratchSurface, scratchLine, calculateTransparency } from '@/lib/scratchUtils';

export default function DemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawScratchSurface(ctx, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (revealed) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) setLastPoint(coords);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    scratchLine(ctx, lastPoint.x, lastPoint.y, coords.x, coords.y, 28);
    setLastPoint(coords);

    const pct = calculateTransparency(ctx, canvas.width, canvas.height);
    setProgress(pct);

    if (pct >= 50) {
      setRevealed(true);
      setIsDrawing(false);
      canvas.style.transition = 'opacity 0.8s ease-out';
      canvas.style.opacity = '0';
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <section id="demo-section" ref={sectionRef} className="relative py-24 md:py-32 px-6 bg-surface overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(136,14,79,0.06)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center gap-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col gap-3"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/80">
            How It Works
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-contrast uppercase tracking-tight">
            Try It Right Now
          </h2>
          <p className="text-xs md:text-sm text-muted font-light leading-relaxed max-w-sm mx-auto">
            Go ahead — use your finger or mouse to scratch the card below. This is exactly what every session feels like.
          </p>
        </motion.div>

        {/* Interactive Scratch Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          ref={containerRef}
          className="relative w-full aspect-[4/3] bg-surface-light border border-primary/25 rounded-[var(--radius-card)] shadow-glow-intense overflow-hidden select-none"
        >
          {/* Hidden Content — revealed after scratching */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center z-0">
            <span className="text-4xl">🫦</span>
            <h3 className="text-lg md:text-xl font-black text-gradient uppercase tracking-tight">
              You Just Revealed Your First Secret
            </h3>
            <p className="text-xs md:text-sm text-muted font-light leading-relaxed max-w-xs">
              Imagine doing this together with your partner — in real-time, from anywhere in the world.
            </p>
          </div>

          {/* Canvas Scratch Cover */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="absolute inset-0 w-full h-full z-10 cursor-pointer touch-none"
            style={{ touchAction: 'none' }}
          />

          {/* Scratch hint overlay (fades out after first interaction) */}
          {!isDrawing && progress === 0 && !revealed && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-sm font-black text-secondary uppercase tracking-widest">
                  Scratch Me
                </span>
                <span className="text-[10px] text-muted uppercase tracking-wider">
                  Use your finger or mouse
                </span>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Progress indicator */}
        {progress > 0 && !revealed && (
          <div className="w-full max-w-xs mx-auto">
            <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress / 50 * 100, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
