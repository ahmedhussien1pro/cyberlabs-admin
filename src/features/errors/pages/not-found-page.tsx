import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, RotateCcw, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';

// ── Constants ──────────────────────────────────────────────────────────────
const TERMINAL_LINES: string[] = [
  '> SYSTEM ERROR: Route not found',
  '> Scanning directories...',
  '> ERROR 404: /page does not exist',
  '> Attempting recovery...',
  '> Access Denied.',
];

// ── Glitch Text ────────────────────────────────────────────────────────────
function GlitchText({ text }: { text: string }) {
  return (
    <div className='relative select-none'>
      <span
        aria-hidden='true'
        className='absolute inset-0 animate-[glitch1_3s_infinite] bg-gradient-to-r from-primary to-[#00c4ff] bg-clip-text text-transparent opacity-70'
        style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 50%, 0 50%)' }}>
        {text}
      </span>
      <span
        aria-hidden='true'
        className='absolute inset-0 animate-[glitch2_3s_infinite] text-red-500/50 opacity-50'
        style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 80%, 0 80%)' }}>
        {text}
      </span>
      <span className='bg-gradient-to-r from-primary via-[#00c4ff] to-primary bg-clip-text text-transparent'>
        {text}
      </span>
    </div>
  );
}

function TerminalBlock() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    let active = true;

    const run = () => {
      setLines([]);
      i = 0;

      const interval = setInterval(() => {
        if (!active) return;

        if (i < TERMINAL_LINES.length) {
          const line = TERMINAL_LINES[i];
          if (typeof line === 'string') {
            setLines((prev) => [...prev, line]);
          }
          i++;
        } else {
          clearInterval(interval);
          if (active) {
            setTimeout(run, 2000);
          }
        }
      }, 600);
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const getLineColor = (line: string) => {
    if (line.includes('ERROR') || line.includes('Denied'))
      return 'text-red-400';
    if (line.includes('recovery') || line.includes('Scanning'))
      return 'text-yellow-400';
    return 'text-primary/80';
  };

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
          cyberlabs — bash
        </span>
      </div>

      {/* Body */}
      <div className='min-h-[150px] space-y-1.5 p-4 font-mono text-xs md:text-sm text-left text-foreground/70'>
        <AnimatePresence mode='popLayout'>
          {lines.map((line, i) =>
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
          <span className='inline-block h-[14px] w-[7px] translate-y-[2px] animate-[blink_1s_step-end_infinite] bg-primary' />
        </p>
      </div>
    </div>
  );
}

// ── Binary Rain ────────────────────────────────────────────────────────────
function BinaryRain() {
  const cols = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]'>
      {cols.map((i) => (
        <motion.div
          key={i}
          className='absolute top-0 whitespace-pre font-mono text-xs leading-5 text-primary'
          style={{ left: `${(i / 12) * 100}%` }}
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NotFoundPage() {
  const { t } = useTranslation('errors');

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16'>
      <BinaryRain />

      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl' />
        <div className='absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-[#00c4ff]/[0.04] blur-3xl' />
        <div className='absolute bottom-1/4 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl' />
        <motion.div
          className='absolute inset-x-0 h-px bg-primary/8'
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
      </div>

      <div className='flex w-full max-w-lg flex-col items-center text-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='relative text-[6rem] font-black leading-none md:text-[8rem]'>
          <div className='absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl' />
          <GlitchText text='404' />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-2 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 font-mono text-xs font-semibold text-red-400'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-400' />
          SYSTEM :: PAGE_NOT_FOUND
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className='mt-6 w-full'>
          <TerminalBlock />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-5 text-sm leading-relaxed text-muted-foreground'>
          {t('notFoundDesc')}
        </motion.p>

        <div className='my-6 h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent' />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='flex flex-wrap items-center justify-center gap-3'>
          <Button
            asChild
            size='lg'
            className='gap-2 px-3 font-mono shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/40'>
            <Link to={ROUTES.HOME}>
              <Home className='h-4 w-4' />
              {t('notFoundBack')}
            </Link>
          </Button>

          <Button
            size='lg'
            variant='outline'
            onClick={() => window.history.back()}
            className='gap-2 px-3 font-mono transition-all duration-300 border-primary/40 hover:bg-primary/5 hover:text-primary'>
            <RotateCcw className='h-4 w-4' />
            {t('goBack')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
