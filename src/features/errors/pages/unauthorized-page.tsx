// src/features/errors/pages/unauthorized-page.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShieldAlert, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';

// ── Constants ──────────────────────────────────────────────────────────────
const TERMINAL_LINES: string[] = [
  '> AUTHENTICATING USER...',
  '> ERROR: Invalid credentials',
  '> Checking permissions...',
  '> ACCESS DENIED: Unauthorized',
  '> Security alert triggered.',
];

// ── Glitch Text ─────────────────────────────────────────────────────────────
function GlitchText({ text }: { text: string }) {
  return (
    <div className='relative select-none'>
      <span
        aria-hidden='true'
        className='absolute inset-0 animate-[glitch1_3s_infinite] bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent opacity-70'
        style={{ clipPath: 'polygon(0 30%, 100% 30%, 100% 50%, 0 50%)' }}>
        {text}
      </span>
      <span
        aria-hidden='true'
        className='absolute inset-0 animate-[glitch2_3s_infinite] text-primary/50 opacity-50'
        style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 80%, 0 80%)' }}>
        {text}
      </span>
      <span className='bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-clip-text text-transparent'>
        {text}
      </span>
    </div>
  );
}

// ── Terminal Block ──────────────────────────────────────────────────────────
function TerminalBlock() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const run = () => {
      setLines([]);
      let i = 0;

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
          if (active) setTimeout(run, 2000);
        }
      }, 600);
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const getLineColor = (line: string) => {
    if (line.includes('DENIED') || line.includes('alert'))
      return 'text-red-400';
    if (line.includes('Checking') || line.includes('AUTHENTICATING'))
      return 'text-yellow-400';
    if (line.includes('Invalid')) return 'text-orange-400';
    return 'text-primary/80';
  };

  return (
    <div
      dir='ltr'
      className='w-full overflow-hidden rounded-xl border border-border/40 bg-muted/60 backdrop-blur-sm dark:border-primary/20 dark:bg-black/60'>
      {/* Header */}
      <div className='flex items-center gap-2 border-b border-red-500/10 bg-muted/20 px-4 py-2.5'>
        <div className='h-3 w-3 rounded-full bg-red-500/70' />
        <div className='h-3 w-3 rounded-full bg-yellow-500/70' />
        <div className='h-3 w-3 rounded-full bg-green-500/70' />
        <span className='ms-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
          <Terminal className='h-3 w-3' />
          cyberlabs — auth
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

        {/* Cursor */}
        <p className='text-primary/80'>
          {'> '}
          <span className='inline-block h-[14px] w-[7px] translate-y-[2px] animate-[blink_1s_step-end_infinite] bg-red-400' />
        </p>
      </div>
    </div>
  );
}

// ── Binary Rain ─────────────────────────────────────────────────────────────
function BinaryRain() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]'>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className='absolute top-0 whitespace-pre font-mono text-xs leading-5 text-red-400'
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

// ── Main Page ───────────────────────────────────────────────────────────────
export default function UnauthorizedPage() {
  const { t } = useTranslation('errors');

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16'>
      {/* Binary rain — red tint */}
      <BinaryRain />

      {/* Glow blobs */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-red-500/[0.05] blur-3xl' />
        <div className='absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-orange-500/[0.04] blur-3xl' />
        <div className='absolute bottom-1/4 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/[0.04] blur-3xl' />
        {/* Scan line */}
        <motion.div
          className='absolute inset-x-0 h-px bg-red-500/10'
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
      </div>

      <div className='flex w-full max-w-lg flex-col items-center text-center'>
        {/* Shield icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='relative mb-2'>
          <div className='absolute inset-0 rounded-full bg-red-500/20 blur-2xl' />
          <ShieldAlert className='relative h-16 w-16 text-red-400/80' />
        </motion.div>

        {/* 401 Glitch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='relative text-[6rem] font-black leading-none md:text-[8rem]'>
          <div className='absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/15 blur-3xl' />
          <GlitchText text='401' />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-2 flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs font-semibold text-red-400'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-400' />
          SYSTEM :: UNAUTHORIZED_ACCESS
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className='mt-6 w-full'>
          <TerminalBlock />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-5 text-sm leading-relaxed text-muted-foreground'>
          {t('forbidden')}
        </motion.p>

        {/* Divider */}
        <div className='my-6 h-px w-24 bg-gradient-to-r from-transparent via-red-500/40 to-transparent' />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='flex flex-wrap items-center justify-center gap-3'>
          <Button
            asChild
            size='lg'
            className='gap-2 rounded-full bg-red-500 px-7 font-mono text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-[1.03] hover:bg-red-600 hover:shadow-red-500/40'>
            <Link to={ROUTES.HOME}>
              <Home className='h-4 w-4' />
              {t('forbiddenBack')}
            </Link>
          </Button>

          <Button
            asChild
            size='lg'
            variant='outline'
            className='gap-2 rounded-full border-red-500/20 px-7 font-mono transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400'>
            <Link to={ROUTES.AUTH.LOGIN}>
              <ShieldAlert className='h-4 w-4' />
              {t('forbiddenLogin')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
