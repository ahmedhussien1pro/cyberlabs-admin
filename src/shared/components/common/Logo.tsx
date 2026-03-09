import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

export function Logo({ size = 'md', className, showBadge = true }: LogoProps) {
  const textSizes: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
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
        'flex items-center gap-2 select-none',
        'transition-transform duration-300 ease-in-out hover:scale-105',
        className,
      )}
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--main-color)' }}
      >
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>

      {/* Text */}
      <h2 className={cn('mb-0 font-bold tracking-tight leading-none', textSizes[size])}>
        <span style={{ color: 'var(--main-color)' }}>Cyber</span>
        <span className="text-foreground">Labs</span>
      </h2>

      {/* Badge */}
      {showBadge && (
        <span
          className={cn('rounded border font-semibold flex-shrink-0', badgeSizes[size])}
          style={{
            borderColor: 'var(--main-color)',
            color: 'var(--main-color)',
          }}
        >
          Admin
        </span>
      )}
    </Link>
  );
}

export default Logo;
