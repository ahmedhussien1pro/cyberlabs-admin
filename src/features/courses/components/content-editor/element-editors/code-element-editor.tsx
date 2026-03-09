// src/features/courses/components/content-editor/element-editors/code-element-editor.tsx
import type { CourseElement } from '../../../types/course-editor.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
  'bash',
  'shell',
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c',
  'go',
  'rust',
  'sql',
  'yaml',
  'json',
  'html',
  'css',
  'dockerfile',
  'terraform',
  'powershell',
];

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

export function CodeElementEditor({ element, onChange }: Props) {
  return (
    <div className='space-y-4'>
      {/* Title */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>Title (EN)</Label>
          <Input
            value={element.title}
            placeholder='Code block title'
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

      {/* Language */}
      <div className='space-y-1 w-48'>
        <Label className='text-xs text-muted-foreground'>Language</Label>
        <Select
          value={element.language ?? 'bash'}
          onValueChange={(v) => onChange({ language: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Code */}
      <div className='space-y-1'>
        <Label className='text-xs text-muted-foreground'>Code</Label>
        <Textarea
          rows={10}
          value={element.code ?? ''}
          placeholder={`# Your ${element.language ?? 'bash'} code here...`}
          onChange={(e) => onChange({ code: e.target.value })}
          className='font-mono text-sm resize-y bg-muted/40'
          spellCheck={false}
        />
      </div>

      {/* Explanation */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>
            Explanation (EN)
          </Label>
          <Textarea
            rows={3}
            value={element.codeExplanation ?? ''}
            placeholder='Explain what this code does...'
            onChange={(e) => onChange({ codeExplanation: e.target.value })}
            className='resize-y'
          />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs text-muted-foreground'>
            Explanation (AR)
          </Label>
          <Textarea
            dir='rtl'
            rows={3}
            value={element.ar_codeExplanation ?? ''}
            placeholder='اشرح ماذا يفعل هذا الكود...'
            onChange={(e) => onChange({ ar_codeExplanation: e.target.value })}
            className='resize-y'
          />
        </div>
      </div>
    </div>
  );
}
