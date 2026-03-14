// src/shared/components/common/matrix-rain.tsx
// Exact copy of cyberlabs-frontend MatrixRain — canvas-based, animated.
import { useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface MatrixRainProps {
  opacity?: number;
  color?: string;
  speed?: number;
  className?: string;
}

export const MatrixRain = memo(function MatrixRain({
  opacity = 0.15,
  color = '#22c55e',
  speed = 4,
  className,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }).fill(1) as number[];

    let frameCount = 0;
    let animationId: number;

    // Draw function
    const draw = () => {
      frameCount++;

      if (frameCount % speed !== 0) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      // Fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw characters
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        ctx.fillText(text, x, y * fontSize);

        // Reset drop randomly when it reaches bottom
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [opacity, color, speed]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn('absolute inset-0 z-0 pointer-events-none', className)}
        aria-hidden='true'
      />
      {/* Overlay gradient */}
      <div
        className='absolute inset-0 z-[1] pointer-events-none bg-gradient-to-br from-black/75 via-primary/20 to-black/75 backdrop-blur-[1px]'
        aria-hidden='true'
      />
    </>
  );
});
