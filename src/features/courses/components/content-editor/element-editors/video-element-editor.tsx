// src/features/courses/components/content-editor/element-editors/video-element-editor.tsx
import type { CourseElement } from '../../../types/course-editor.types';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

/** Converts YouTube / Vimeo watch URL to embed URL */
function toEmbedUrl(url: string): string | null {
  try {
    // YouTube: https://www.youtube.com/watch?v=ID  or  https://youtu.be/ID
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo: https://vimeo.com/ID
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    return null;
  } catch {
    return null;
  }
}

export function VideoElementEditor({ element, onChange }: Props) {
  const embedUrl = element.videoUrl ? toEmbedUrl(element.videoUrl) : null;

  return (
    <div className='space-y-4'>
      {/* Title */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (EN)</Label>
          <Input
            value={element.title}
            placeholder='Video title'
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (AR)</Label>
          <Input
            dir='rtl'
            value={element.ar_title ?? ''}
            placeholder='عنوان الفيديو'
            onChange={(e) => onChange({ ar_title: e.target.value })}
          />
        </div>
      </div>

      {/* Video URL */}
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>
          Video URL (YouTube / Vimeo)
        </Label>
        <Input
          value={element.videoUrl ?? ''}
          placeholder='https://www.youtube.com/watch?v=...'
          onChange={(e) => onChange({ videoUrl: e.target.value })}
        />
      </div>

      {/* Embed preview */}
      {embedUrl && (
        <div className='rounded-lg overflow-hidden border border-border/40 aspect-video'>
          <iframe
            src={embedUrl}
            title='Video preview'
            className='w-full h-full'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      )}

      {/* Duration */}
      <div className='space-y-1 w-40'>
        <Label className='text-xs text-muted-foreground'>
          Duration (seconds)
        </Label>
        <Input
          type='number'
          min={0}
          value={element.videoDuration ?? ''}
          placeholder='e.g. 300'
          onChange={(e) =>
            onChange({ videoDuration: Number(e.target.value) || undefined })
          }
        />
      </div>
    </div>
  );
}
