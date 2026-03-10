import { useEffect, useCallback } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4'
          onClick={onClose}>
          <button
            onClick={onClose}
            className='absolute top-4 end-4 z-10 h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors'>
            <X className='h-5 w-5' />
          </button>

          <motion.img
            src={src}
            alt={alt ?? ''}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className='max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl'
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Wrapper — use on any <img> to make it zoomable ──────────────────
interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  onZoom: (src: string, alt?: string) => void;
}

export function ZoomableImage({
  src,
  alt,
  className,
  wrapperClassName,
  onZoom,
}: ZoomableImageProps) {
  return (
    <div
      className={cn('group relative cursor-zoom-in', wrapperClassName)}
      onClick={() => onZoom(src, alt)}>
      <img src={src} alt={alt ?? ''} loading='lazy' className={className} />
      <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-xl'>
        <ZoomIn className='h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg' />
      </div>
    </div>
  );
}
