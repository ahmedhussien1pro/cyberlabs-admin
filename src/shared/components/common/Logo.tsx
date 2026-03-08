import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

export function Logo({ size = 'md', className, showBadge = true }: LogoProps) {
  const textSizes: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-[1.2rem]',
    md: 'text-[1.4rem]',
    lg: 'text-[1.8rem]',
  };

  const badgeSizes: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2 py-1',
  };

  return (
    <Link
      to='/'
      className={cn(
        'flex items-center gap-2',
        'transition-transform duration-300 ease-in-out hover:scale-105',
        className,
      )}>
      <h2
        className={cn(
          'cyberlabs-logo-title',
          'mb-0 mx-2 font-bold',
          textSizes[size],
          'transition-colors duration-300 ease-in-out',
        )}>
        Cyber <span>Labs</span>
      </h2>

      {showBadge && (
        <span
          className={cn('rounded border font-medium', badgeSizes[size])}
          style={{
            borderColor: 'var(--main-color)',
            color: 'var(--main-color)',
          }}>
          Admin
        </span>
      )}
    </Link>
  );
}

export default Logo;
