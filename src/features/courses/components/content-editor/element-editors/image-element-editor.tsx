// src/features/courses/components/content-editor/element-editors/image-element-editor.tsx
import type { CourseElement } from '../../../types/course-editor.types';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

export function ImageElementEditor({ element, onChange }: Props) {
  return (
    <div className='space-y-4'>
      {/* Title */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (EN)</Label>
          <Input
            value={element.title}
            placeholder='Image title'
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (AR)</Label>
          <Input
            dir='rtl'
            value={element.ar_title ?? ''}
            placeholder='عنوان'
            onChange={(e) => onChange({ ar_title: e.target.value })}
          />
        </div>
      </div>

      {/* Image URL */}
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>Image URL</Label>
        <Input
          value={element.imageUrl ?? ''}
          placeholder='https://example.com/image.png'
          onChange={(e) => onChange({ imageUrl: e.target.value })}
        />
      </div>

      {/* Live preview */}
      {element.imageUrl && (
        <div className='rounded-lg border border-border/40 overflow-hidden bg-muted/20 p-2'>
          <img
            src={element.imageUrl}
            alt={element.altText || 'preview'}
            className='max-h-48 mx-auto rounded object-contain'
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Alt text */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Alt Text (EN)</Label>
          <Input
            value={element.altText ?? ''}
            placeholder='Describe the image'
            onChange={(e) => onChange({ altText: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Alt Text (AR)</Label>
          <Input
            dir='rtl'
            value={element.ar_altText ?? ''}
            placeholder='وصف الصورة'
            onChange={(e) => onChange({ ar_altText: e.target.value })}
          />
        </div>
      </div>

      {/* Caption */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Caption (EN)</Label>
          <Input
            value={element.caption ?? ''}
            placeholder='Optional caption'
            onChange={(e) => onChange({ caption: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Caption (AR)</Label>
          <Input
            dir='rtl'
            value={element.ar_caption ?? ''}
            placeholder='تعليق اختياري'
            onChange={(e) => onChange({ ar_caption: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
