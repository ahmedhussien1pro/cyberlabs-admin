// src/features/errors/components/terminal-block.tsx
// Animated terminal — used by NotFoundPage & UnauthorizedPage
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

export interface TerminalBlockProps {
  lines: string[];
  label?: string;
  getLineColor: (line: string) => string;
  cursorColor?: string;
}

export function TerminalBlock({
  lines: terminalLines,
  label = 'cyberlabs — bash',
  getLineColor,
  cursorColor = 'bg-primary',
}: TerminalBlockProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const run = () => {
      setVisibleLines([]);
      let i = 0;
      const interval = setInterval(() => {
        if (!active) return;
        if (i < terminalLines.length) {
          const line = terminalLines[i];
          if (typeof line === 'string') setVisibleLines((p) => [...p, line]);
          i++;
        } else {
          clearInterval(interval);
          if (active) setTimeout(run, 2000);
        }
      }, 600);
    };

    run();
    return () => { active = false; };
  }, [terminalLines]);

  return (
    <div
      dir='ltr'
      className='w-full overflow-hidden rounded-xl border border-border/40 bg-muted/60 backdrop-blur-sm dark:border-primary/20 dark:bg-black/60'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-border/30 bg-muted/80 px-4 py-2.5 dark:border-primary/10 dark:bg-muted/20'>
        <div className='h-3 w-3 rounded-full bg-red-500/70' />
        <div className='h-3 w-3 rounded-full bg-yellow-500/70' />
        <div className='h-3 w-3 rounded-full bg-green-500/70' />
        <span className='ms-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Terminal className='h-3 w-3' />
          {label}
        </span>
      </div>
      {/* Body */}
      <div className='min-h-[150px] space-y-1.5 p-4 font-mono text-xs md:text-sm text-left text-foreground/70'>
        <AnimatePresence mode='popLayout'>
          {visibleLines.map((line, i) =>
            typeof line === 'string' ? (
              <motion.p
                key={`${line}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={getLineColor(line)}>
                {line}
              </motion.p>
            ) : null,
          )}
        </AnimatePresence>
        <p className='text-primary/80'>
          {'> '}
          <span className={`inline-block h-[14px] w-[7px] translate-y-[2px] animate-[blink_1s_step-end_infinite] ${cursorColor}`} />
        </p>
      </div>
    </div>
  );
}
