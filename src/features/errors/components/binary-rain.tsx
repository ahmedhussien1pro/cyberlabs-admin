// src/features/errors/components/binary-rain.tsx
// Background binary‑rain animation — used by NotFoundPage & UnauthorizedPage
import { motion } from 'framer-motion';

export interface BinaryRainProps {
  color?: string; // Tailwind text color class
  cols?: number;
}

export function BinaryRain({ color = 'text-primary', cols = 12 }: BinaryRainProps) {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]'>
      {Array.from({ length: cols }, (_, i) => (
        <motion.div
          key={i}
          className={`absolute top-0 whitespace-pre font-mono text-xs leading-5 ${color}`}
          style={{ left: `${(i / cols) * 100}%` }}
          animate={{ y: ['-10%', '110%'] }}
          transition={{
            duration: 8 + (i % 5),
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'linear',
          }}>
          {Array.from({ length: 24 }, () =>
            Math.random() > 0.5 ? '1' : '0',
          ).join('\n')}
        </motion.div>
      ))}
    </div>
  );
}
