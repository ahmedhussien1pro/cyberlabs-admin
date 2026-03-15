// src/features/errors/pages/unauthorized-page.tsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { GlitchText, TerminalBlock, BinaryRain } from '../components';

const TERMINAL_LINES = [
  '> AUTHENTICATING USER...',
  '> ERROR: Invalid credentials',
  '> Checking permissions...',
  '> ACCESS DENIED: Unauthorized',
  '> Security alert triggered.',
];

const getLineColor = (line: string) => {
  if (line.includes('DENIED') || line.includes('alert')) return 'text-red-400';
  if (line.includes('Checking') || line.includes('AUTHENTICATING')) return 'text-yellow-400';
  if (line.includes('Invalid')) return 'text-orange-400';
  return 'text-primary/80';
};

export default function UnauthorizedPage() {
  const { t } = useTranslation('errors');

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16'>
      <BinaryRain color='text-red-400' />

      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-red-500/[0.05] blur-3xl' />
        <div className='absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-orange-500/[0.04] blur-3xl' />
        <div className='absolute bottom-1/4 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/[0.04] blur-3xl' />
        <motion.div
          className='absolute inset-x-0 h-px bg-red-500/10'
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent' />
      </div>

      <div className='flex w-full max-w-lg flex-col items-center text-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className='relative mb-2'>
          <div className='absolute inset-0 rounded-full bg-red-500/20 blur-2xl' />
          <ShieldAlert className='relative h-16 w-16 text-red-400/80' />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='relative text-[6rem] font-black leading-none md:text-[8rem]'>
          <div className='absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/15 blur-3xl' />
          <GlitchText
            text='401'
            gradient='from-red-500 via-orange-400 to-red-500'
            glitch1Gradient='from-red-500 to-orange-400'
            glitch2Color='text-primary/50'
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-2 flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs font-semibold text-red-400'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-400' />
          SYSTEM :: UNAUTHORIZED_ACCESS
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className='mt-6 w-full'>
          <TerminalBlock
            lines={TERMINAL_LINES}
            label='cyberlabs — auth'
            getLineColor={getLineColor}
            cursorColor='bg-red-400'
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='mt-5 text-sm leading-relaxed text-muted-foreground'>
          {t('forbidden')}
        </motion.p>

        <div className='my-6 h-px w-24 bg-gradient-to-r from-transparent via-red-500/40 to-transparent' />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='flex flex-wrap items-center justify-center gap-3'>
          <Button
            asChild size='lg'
            className='gap-2 rounded-full bg-red-500 px-7 font-mono text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-[1.03] hover:bg-red-600 hover:shadow-red-500/40'>
            <Link to={ROUTES.LOGIN}>
              <Home className='h-4 w-4' />
              {t('forbiddenBack')}
            </Link>
          </Button>
          <Button
            asChild size='lg' variant='outline'
            className='gap-2 rounded-full border-red-500/20 px-7 font-mono transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-400'>
            <Link to={ROUTES.LOGIN}>
              <ShieldAlert className='h-4 w-4' />
              {t('forbiddenLogin')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
