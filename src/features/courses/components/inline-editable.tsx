// src/features/courses/components/inline-editable.tsx
import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Pencil } from 'lucide-react';

interface InlineEditableProps {
  value: string;
  // Broadened to accept any Promise return (e.g. mutateAsync) or void
  onSave: (val: string) => Promise<unknown> | void;
  className?: string;
  inputClassName?: string;
  as?: 'input' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditable({
  value,
  onSave,
  className,
  inputClassName,
  as = 'input',
  placeholder = 'Click to edit...',
  disabled = false,
}: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = async () => {
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft.trim());
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && as === 'input') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (disabled) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (!editing) {
    return (
      <span
        className={cn(
          'group/edit inline-flex items-center gap-1 cursor-pointer rounded px-1 -mx-1',
          'hover:bg-primary/10 hover:ring-1 hover:ring-primary/30 transition-all',
          className,
        )}
        onClick={() => setEditing(true)}
        title='Click to edit'
      >
        {value || <span className='text-muted-foreground/50 italic'>{placeholder}</span>}
        <Pencil className='h-3 w-3 shrink-0 opacity-0 group-hover/edit:opacity-60 text-primary transition-opacity' />
      </span>
    );
  }

  const sharedProps = {
    ref: inputRef as any,
    value: draft,
    onChange: (e: any) => setDraft(e.target.value),
    onKeyDown: handleKey,
    disabled: saving,
    placeholder,
    className: cn(
      'w-full bg-background border border-primary/50 rounded px-2 py-0.5 text-sm',
      'focus:outline-none focus:ring-1 focus:ring-primary/60',
      'disabled:opacity-50',
      inputClassName,
    ),
  };

  return (
    <span className='inline-flex w-full items-center gap-1'>
      {as === 'textarea' ? (
        <textarea {...sharedProps} rows={2} className={cn(sharedProps.className, 'resize-none')} />
      ) : (
        <input {...sharedProps} type='text' />
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className='shrink-0 h-6 w-6 flex items-center justify-center rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-colors'
      >
        <Check className='h-3 w-3' />
      </button>
      <button
        onClick={handleCancel}
        disabled={saving}
        className='shrink-0 h-6 w-6 flex items-center justify-center rounded bg-red-500/15 text-red-400 hover:bg-red-500/30 transition-colors'
      >
        <X className='h-3 w-3' />
      </button>
    </span>
  );
}
