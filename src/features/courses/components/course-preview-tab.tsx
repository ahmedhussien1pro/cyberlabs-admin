// course-preview-tab.tsx — Open in New Window opens the real frontend course page
import { ExternalLink, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminCourse } from '../types/admin-course.types';

const FRONTEND_BASE =
  (import.meta.env.VITE_FRONTEND_URL as string | undefined) ??
  'http://localhost:5173';

interface Props { course: AdminCourse; }

export function CoursePlatformPreviewTab({ course }: Props) {
  const url = `${FRONTEND_BASE}/courses/${course.slug}`;

  return (
    <div className='space-y-6'>
      {/* Actions bar */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold'>Platform Preview</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Opens the live course page on the main platform.
          </p>
        </div>
        <Button
          size='sm'
          className='gap-2'
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
          <ExternalLink className='h-4 w-4' />
          Open in New Window
        </Button>
      </div>

      {/* Inline iframe preview */}
      <div className='rounded-xl border border-border/50 overflow-hidden bg-background'>
        {/* Browser chrome */}
        <div className='flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30'>
          <div className='flex gap-1.5'>
            <span className='h-3 w-3 rounded-full bg-red-500/70' />
            <span className='h-3 w-3 rounded-full bg-yellow-500/70' />
            <span className='h-3 w-3 rounded-full bg-emerald-500/70' />
          </div>
          <Monitor className='h-3.5 w-3.5 text-muted-foreground' />
          <span className='text-xs text-muted-foreground font-mono truncate flex-1'>{url}</span>
        </div>
        {/* iframe */}
        <iframe
          src={url}
          title={`Preview: ${course.title}`}
          className='w-full border-0'
          style={{ height: '75vh', minHeight: '480px' }}
          sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
        />
      </div>
    </div>
  );
}
