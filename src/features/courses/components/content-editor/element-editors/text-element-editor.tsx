// src/features/courses/components/content-editor/element-editors/text-element-editor.tsx
import type { CourseElement } from '../../../types/course-editor.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

export function TextElementEditor({ element, onChange }: Props) {
  return (
    <div className='space-y-4'>
      {/* Title */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (EN)</Label>
          <Input
            value={element.title}
            placeholder='Element title'
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (AR)</Label>
          <Input
            dir='rtl'
            value={element.ar_title ?? ''}
            placeholder='عنوان العنصر'
            onChange={(e) => onChange({ ar_title: e.target.value })}
          />
        </div>
      </div>

      {/* Content */}
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>
          Content (EN) — Markdown supported
        </Label>
        <Textarea
          rows={8}
          value={element.content ?? ''}
          placeholder='Write your content here... (Markdown supported)'
          onChange={(e) => onChange({ content: e.target.value })}
          className='font-mono text-sm resize-y'
        />
      </div>

      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>
          Content (AR) — Markdown
        </Label>
        <Textarea
          dir='rtl'
          rows={6}
          value={element.ar_content ?? ''}
          placeholder='اكتب المحتوى بالعربي...'
          onChange={(e) => onChange({ ar_content: e.target.value })}
          className='font-mono text-sm resize-y'
        />
      </div>
    </div>
  );
}
