import { motion } from 'framer-motion';
import { Logo } from './Logo';

export function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      {/* Container */}
      <div className='relative w-48 h-48'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className='absolute inset-0 rounded-full border-[3px] border-transparent border-r-primary border-b-primary'
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <Logo size='lg' showBadge={false} className='pointer-events-none' />
        </div>
      </div>
    </motion.div>
  );
}

export default Preloader;
