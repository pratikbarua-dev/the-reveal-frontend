'use client';

import { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  drawScratchSurface,
  scratchLine,
  calculateTransparency,
  animateReveal,
} from '@/lib/scratchUtils';
import { useSocket } from '@/hooks/useSocket';

interface ScratchCardProps {
  roomId?: string;
  assignedText: string;
  title: string;
  spiceLevel: number;
  tags: string[];
  imageUrl?: string;
  isRevealed: boolean;
  onRevealComplete: () => void;
  revealProgress: number;
  onProgressUpdate: (progress: number) => void;
}

export default function ScratchCard({
  roomId,
  assignedText,
  title,
  spiceLevel,
  tags,
  imageUrl,
  isRevealed,
  onRevealComplete,
  revealProgress,
  onProgressUpdate,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [imgError, setImgError] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  // Reset/draw canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set pixel density
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    drawScratchSurface(ctx, canvas.width, canvas.height);
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [title]); // redraw when card title updates

  useEffect(() => {
    if (isRevealed) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
      }
    } else {
      initCanvas();
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
        canvasRef.current.style.pointerEvents = 'auto';
      }
    }
  }, [isRevealed]);

  // Sync incoming scratch strokes in real-time
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRemoteStroke = (data: any) => {
      if (data.roomId !== roomId) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const points = data.points;
      if (points.length < 2) return;

      for (let i = 1; i < points.length; i++) {
        scratchLine(ctx, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, data.brushRadius, 0.4);
      }

      // Re-calculate transparency locally
      const pct = calculateTransparency(ctx, canvas.width, canvas.height);
      onProgressUpdate(pct);

      if (pct >= 60 && !isRevealed) {
        handleReveal();
      }
    };

    socket.on('scratch:stroke', handleRemoteStroke);
    return () => {
      socket.off('scratch:stroke', handleRemoteStroke);
    };
  }, [socket, roomId, isRevealed]);

  const handleReveal = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await animateReveal(canvas, 600);
    onRevealComplete();
    if (socket && roomId) {
      socket.emit('scratch:reveal', { roomId });
    }
  };

  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      setLastPoint(coords);
    }
  };

  const handleMove = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const brushRadius = 22;
    scratchLine(ctx, lastPoint.x, lastPoint.y, coords.x, coords.y, brushRadius);

    // Sync stroke to other players
    if (socket && roomId) {
      socket.emit('scratch:stroke', {
        roomId,
        points: [lastPoint, coords],
        brushRadius,
        userId: '',
      });
    }

    setLastPoint(coords);

    // Check transparency percentage
    const pct = calculateTransparency(ctx, canvas.width, canvas.height);
    onProgressUpdate(pct);

    // Sync progress to server & other players
    if (socket && roomId) {
      socket.emit('scratch:progress', { roomId, percentage: pct });
    }

    if (pct >= 60 && !isRevealed) {
      setIsDrawing(false);
      handleReveal();
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto glass border border-primary/25 rounded-[var(--radius-card)] shadow-glow-intense overflow-hidden select-none min-h-[400px]"
    >
      {/* Revealed Content Layer */}
      <div className="relative p-6 flex flex-col gap-6 items-center z-0 w-full">
        {/* Top Side: Position sketch print card */}
        <div className="w-full flex items-center justify-center bg-contrast rounded-[var(--radius-card)] border border-primary/10 overflow-hidden relative shadow-inner p-4 select-none min-h-[250px]">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              onError={() => setImgError(true)}
              className="object-contain mix-blend-multiply transition-opacity duration-300 pointer-events-none p-4"
            />
          ) : (
            <div className="text-muted text-[10px] uppercase font-bold tracking-wider text-center select-none">
              Drawing Preview
            </div>
          )}
        </div>

        {/* Bottom Side: Text description details */}
        <div className="w-full flex flex-col py-1 select-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: spiceLevel }).map((_, i) => (
                <span key={i} className="text-xs">🌶️</span>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gradient uppercase font-sans leading-none select-none">
              {title}
            </h2>
            <p className="text-contrast text-sm md:text-base leading-relaxed font-sans font-light mt-2 select-none">
              {assignedText}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-semibold uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 text-secondary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas scratch cover */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="absolute inset-0 w-full h-full z-10 cursor-pointer transition-opacity duration-300 touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
