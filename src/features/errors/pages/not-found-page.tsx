// src/features/errors/pages/not-found-page.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { GlitchText, TerminalBlock, BinaryRain } from '../components';

const TERMINAL_LINES = [
  '> SYSTEM ERROR: Route not found',
  '> Scanning directories...',
  '> ERROR 404: /page does not exist',
  '> Attempting recovery...',
  '> Access Denied.',
];

const getLineColor = (line: string) => {
  if (line.includes('ERROR') || line.includes('Denied')) return 'text-red-400';
  if (line.includes('recovery') || line.includes('Scanning')) return 'text-yellow-400';
  return 'text-primary/80';
};

export default function NotFoundPage() {
  const { t } = useTranslation('errors');

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16'>
      <BinaryRain color='text-primary' />

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
          <TerminalBlock
            lines={TERMINAL_LINES}
            label='cyberlabs — bash'
            getLineColor={getLineColor}
            cursorColor='bg-primary'
          />
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
            asChild size='lg'
            className='gap-2 px-3 font-mono shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/40'>
            <Link to={ROUTES.DASHBOARD}>
              <Home className='h-4 w-4' />
              {t('notFoundBack')}
            </Link>
          </Button>
          <Button
            size='lg' variant='outline'
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
