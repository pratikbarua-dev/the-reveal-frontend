// ============================================
// Canvas Scratch Utilities
// Pixel transparency calculation for scratch-off progress
// ============================================

/**
 * Calculates the percentage of transparent pixels in a canvas.
 * Samples every Nth pixel for performance (default: every 4th).
 *
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param sampleRate - Check every Nth pixel (higher = faster, less accurate)
 * @returns Percentage of canvas that has been scratched (0-100)
 */
export function calculateTransparency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sampleRate: number = 4
): number {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let transparentCount = 0;
  let totalSampled = 0;

  // Each pixel is 4 values (R, G, B, A)
  // Alpha channel is at index 3, 7, 11, ...
  for (let i = 3; i < pixels.length; i += 4 * sampleRate) {
    totalSampled++;
    if (pixels[i] === 0) {
      transparentCount++;
    }
  }

  if (totalSampled === 0) return 0;
  return Math.round((transparentCount / totalSampled) * 100);
}

/**
 * Fills the canvas with a dark textured background simulating
 * a metallic scratch-off surface with constellation dots.
 */
export function drawScratchSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Base fill — deep charcoal
  ctx.fillStyle = '#1E1E1E';
  ctx.fillRect(0, 0, width, height);

  // Subtle metallic gradient sheen
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(40, 40, 40, 0.8)');
  gradient.addColorStop(0.3, 'rgba(30, 30, 30, 0.9)');
  gradient.addColorStop(0.5, 'rgba(50, 45, 45, 0.7)');
  gradient.addColorStop(0.7, 'rgba(30, 30, 30, 0.9)');
  gradient.addColorStop(1, 'rgba(35, 35, 35, 0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Constellation dots
  const dotCount = Math.floor((width * height) / 800);
  for (let i = 0; i < dotCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.5 + 0.3;
    const alpha = Math.random() * 0.4 + 0.1;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    ctx.fill();
  }

  // Subtle rose accent glow spots
  const glowSpots = 3;
  for (let i = 0; i < glowSpots; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
    glowGradient.addColorStop(0, 'rgba(136, 14, 79, 0.06)');
    glowGradient.addColorStop(1, 'rgba(136, 14, 79, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Center crosshair hint pattern (subtle)
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.3);
  ctx.lineTo(width / 2, height * 0.7);
  ctx.moveTo(width * 0.3, height / 2);
  ctx.lineTo(width * 0.7, height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Performs a smooth erase at the given coordinates,
 * using composite operation 'destination-out'.
 */
export function scratchAt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 25
): void {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Draws a smooth line between two points with erasing effect.
 * Used for continuous scratch strokes.
 */
export function scratchLine(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  radius: number = 25
): void {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.lineWidth = radius * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Smoothly fades out the entire canvas for reveal animation.
 * Returns a promise that resolves when animation is complete.
 */
export function animateReveal(
  canvas: HTMLCanvasElement,
  duration: number = 600
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();

    function frame(time: number) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      canvas.style.opacity = String(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        canvas.style.opacity = '0';
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}
