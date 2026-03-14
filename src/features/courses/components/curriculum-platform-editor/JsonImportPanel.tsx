// ── JSON Import Panel ──────────────────────────────────────────────────────
import { useRef, useState } from 'react';
import { FileJson, Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { normalizeTopic } from './types';
import type { Topic } from './types';

interface Props {
  onImport: (topics: Topic[]) => void;
  onClose: () => void;
}

export function JsonImportPanel({ onImport, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState('');
  const [parseError, setParseError] = useState('');

  const tryParse = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const arr: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.topics)
          ? parsed.topics
          : null;
      if (!arr) throw new Error('Expected array of topics or { topics: [...] }');
      const normalized = arr.map((t, i) => normalizeTopic(t, i));
      onImport(normalized);
      toast.success(`Imported ${normalized.length} topics — click Save to persist`);
      onClose();
    } catch (e: any) {
      setParseError(e.message ?? 'Invalid JSON');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setRaw(ev.target?.result as string ?? ''); setParseError(''); };
    reader.readAsText(file);
  };

  return (
    <div className='rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <FileJson className='h-4 w-4 text-primary' />
          <span className='text-sm font-semibold'>Import Curriculum from JSON</span>
        </div>
        <button onClick={onClose} className='text-muted-foreground hover:text-foreground'><X className='h-4 w-4' /></button>
      </div>
      <p className='text-xs text-muted-foreground'>
        Upload a <code className='text-primary'>.json</code> file or paste JSON directly.
        Format: <code className='text-primary'>{'{'}[{'{'}id, title:{'{'}en,ar{'}'}, elements:[...]{'}'}]{'}' }</code>
      </p>
      <div>
        <input ref={fileRef} type='file' accept='.json,application/json' className='hidden' onChange={handleFile} />
        <Button variant='outline' size='sm' className='gap-1.5 h-8' onClick={() => fileRef.current?.click()}>
          <Upload className='h-3.5 w-3.5' /> Choose JSON file
        </Button>
      </div>
      <Textarea rows={6} placeholder='Or paste JSON here...'
        value={raw} onChange={(e) => { setRaw(e.target.value); setParseError(''); }}
        className='font-mono text-xs resize-none' />
      {parseError && (
        <div className='flex items-center gap-2 text-xs text-destructive'>
          <AlertTriangle className='h-3.5 w-3.5 shrink-0' />{parseError}
        </div>
      )}
      <div className='flex gap-2'>
        <Button size='sm' className='gap-1.5 h-8' onClick={() => tryParse(raw)} disabled={!raw.trim()}>
          <FileJson className='h-3.5 w-3.5' /> Parse & Replace
        </Button>
        <Button size='sm' variant='ghost' className='h-8' onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
