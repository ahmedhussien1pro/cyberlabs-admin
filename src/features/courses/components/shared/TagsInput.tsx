// src/features/courses/components/shared/TagsInput.tsx
// Reusable tag input with Enter-to-add + badge removal.
import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  label:     string;
  value:     string[];
  onChange:  (v: string[]) => void;
  dir?:      'ltr' | 'rtl';
  placeholder?: string;
}

export function TagsInput({ label, value, onChange, dir = 'ltr', placeholder }: Props) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInput(''); }
  };

  const defaultPh = dir === 'rtl' ? 'اكتب واضغط Enter' : 'Type & press Enter';

  return (
    <div className='space-y-1.5'>
      <label className='text-xs font-medium leading-none'>{label}</label>
      <div
        dir={dir}
        className='flex flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2 min-h-[2.5rem] focus-within:ring-1 focus-within:ring-ring'
      >
        {value.map((t) => (
          <Badge key={t} variant='secondary' className='gap-1 text-xs'>
            {t}
            <button type='button' aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
        <input
          dir={dir}
          className='flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          placeholder={placeholder ?? defaultPh}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add}
        />
      </div>
    </div>
  );
}
