import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import CourseElementRenderer, { type CourseElement } from './CourseElementRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BookOpen, ChevronDown, Plus, Trash2, Save, X,
  GripVertical, Pencil, Eye, Edit3, ArrowUp, ArrowDown,
  Upload, FileJson, AlertTriangle, ImageIcon, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface TopicTitle { en: string; ar: string; }

interface Topic {
  id: string;
  title: TopicTitle;
  elements: CourseElement[];
}

function normalizeTitle(raw: any): TopicTitle {
  if (raw && typeof raw === 'object' && ('en' in raw || 'ar' in raw))
    return { en: raw.en ?? '', ar: raw.ar ?? '' };
  const str = typeof raw === 'string' ? raw : '';
  return { en: str, ar: '' };
}

function normalizeTopic(raw: any, idx: number): Topic {
  return {
    id:       raw?.id ?? `topic-${Date.now()}-${idx}`,
    title:    normalizeTitle(raw?.title),
    elements: Array.isArray(raw?.elements) ? raw.elements : [],
  };
}

// ── Element factory ───────────────────────────────────────────────────────
const ELEMENT_TYPES = [
  'text', 'title', 'subtitle', 'note', 'terminal',
  'code', 'image', 'video', 'list', 'orderedList', 'table', 'button', 'hr',
];

const EL_COLORS: Record<string, string> = {
  text:        'bg-blue-500/10 text-blue-400 border-blue-500/30',
  title:       'bg-purple-500/10 text-purple-400 border-purple-500/30',
  subtitle:    'bg-violet-500/10 text-violet-400 border-violet-500/30',
  image:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  note:        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  terminal:    'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  code:        'bg-slate-500/10 text-slate-400 border-slate-500/30',
  table:       'bg-orange-500/10 text-orange-400 border-orange-500/30',
  orderedList: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  list:        'bg-teal-500/10 text-teal-400 border-teal-500/30',
  video:       'bg-pink-500/10 text-pink-400 border-pink-500/30',
  button:      'bg-green-500/10 text-green-400 border-green-500/30',
  hr:          'bg-muted text-muted-foreground border-border',
};

function makeElement(type: string): CourseElement {
  const base: CourseElement = { id: Date.now() + Math.random(), type };
  if (type === 'hr')          return base;
  if (type === 'code')        return { ...base, value: '', language: 'bash' };
  if (type === 'terminal')    return { ...base, value: { en: '', ar: '' }, label: { en: 'Terminal', ar: 'تيرمينال' } };
  if (type === 'image')       return { ...base, imageUrl: '', alt: { en: '', ar: '' }, size: 'full', _localFile: null };
  if (type === 'video')       return { ...base, url: '', title: { en: '', ar: '' } };
  if (type === 'button')      return { ...base, href: '', label: { en: 'Click here', ar: 'اضغط هنا' }, newTab: true };
  if (type === 'note')        return { ...base, noteType: 'info', value: { en: '', ar: '' } };
  if (type === 'list')        return { ...base, title: { en: '', ar: '' }, items: [{ en: '', ar: '' }] };
  if (type === 'orderedList') return { ...base, title: { en: '', ar: '' }, items: [{ subtitle: { en: '', ar: '' }, text: { en: '', ar: '' } }] };
  if (type === 'table')       return { ...base, title: { en: '', ar: '' }, headers: [{ en: 'Header', ar: 'عنوان' }], rows: [[{ en: '', ar: '' }]] };
  return { ...base, value: { en: '', ar: '' } };
}

// ── Image Element Editor (with local file upload support) ─────────────────────
function ImageElementEditor({
  el, onChange,
}: {
  el: CourseElement;
  onChange: (u: CourseElement) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>((el.imageUrl as string) || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to R2
    setUploading(true);
    try {
      const { url } = await adminCoursesApi.uploadImage(file);
      onChange({ ...el, imageUrl: url, _localFile: null });
      setPreview(url);
      toast.success('Image uploaded to Cloudflare ✓');
    } catch {
      toast.error('Image upload failed — check your connection');
      setPreview((el.imageUrl as string) || null);
    } finally {
      setUploading(false);
    }
  };

  const setBI = (field: string, lng: 'en' | 'ar', val: string) =>
    onChange({ ...el, [field]: { ...((el[field] as any) ?? {}), [lng]: val } });

  return (
    <div className='space-y-3'>
      {/* Preview */}
      {preview && (
        <div className='relative overflow-hidden rounded-lg border border-border/50 bg-muted/20'>
          <img src={preview} alt='preview' className='max-h-48 w-full object-contain' />
          {uploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
              <Loader2 className='h-6 w-6 animate-spin text-white' />
            </div>
          )}
        </div>
      )}

      {/* URL input OR upload button */}
      <div className='flex gap-2'>
        <Input
          placeholder='Image URL (paste or upload file ↑)'
          value={(el.imageUrl as string) ?? ''}
          onChange={(e) => {
            onChange({ ...el, imageUrl: e.target.value });
            setPreview(e.target.value || null);
          }}
          className='text-xs h-8 flex-1'
          disabled={uploading}
        />
        <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
        <Button
          variant='outline' size='sm'
          className='h-8 gap-1.5 shrink-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title='Upload image to Cloudflare R2'
        >
          {uploading
            ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
            : <ImageIcon className='h-3.5 w-3.5' />}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {/* Alt text bilingual */}
      <div className='grid grid-cols-2 gap-2'>
        {(['en', 'ar'] as const).map((lng) => (
          <Input key={lng} dir={lng === 'ar' ? 'rtl' : 'ltr'}
            placeholder={`Alt text (${lng.toUpperCase()})`}
            value={((el.alt as any)?.[lng]) ?? ''}
            onChange={(e) => setBI('alt', lng, e.target.value)}
            className='text-xs h-8' />
        ))}
      </div>

      {/* Size */}
      <select
        value={(el.size as string) ?? 'full'}
        onChange={(e) => onChange({ ...el, size: e.target.value })}
        className='text-xs h-8 w-full rounded-md border border-border bg-background px-2'
      >
        {['small', 'medium', 'large', 'full'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// ── Element Inline Editor ──────────────────────────────────────────────────
function ElementEditor({ el, onChange }: { el: CourseElement; onChange: (u: CourseElement) => void }) {
  const setBI = (field: string, lng: 'en' | 'ar', val: string) =>
    onChange({ ...el, [field]: { ...((el[field] as any) ?? {}), [lng]: val } });

  const BiField = ({ field, label, rows = 0 }: { field: string; label: string; rows?: number }) => (
    <div className='grid grid-cols-2 gap-2'>
      {(['en', 'ar'] as const).map((lng) =>
        rows > 0
          ? <Textarea key={lng} rows={rows} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setBI(field, lng, e.target.value)}
              className='text-xs resize-none' />
          : <Input key={lng} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setBI(field, lng, e.target.value)}
              className='text-xs h-8' />
      )}
    </div>
  );

  if (el.type === 'hr')
    return <p className='text-xs italic text-muted-foreground'>Horizontal Rule — no content</p>;

  // ✅ image now handled by dedicated component with upload support
  if (el.type === 'image')
    return <ImageElementEditor el={el} onChange={onChange} />;

  if (el.type === 'video') return (
    <div className='space-y-2'>
      <Input placeholder='Video embed URL' value={(el.url as string) ?? ''}
        onChange={(e) => onChange({ ...el, url: e.target.value })} className='text-xs h-8' />
      <BiField field='title' label='Title' />
    </div>
  );

  if (el.type === 'code') return (
    <div className='space-y-2'>
      <Input placeholder='Language (bash, python, js...)' value={(el.language as string) ?? ''}
        onChange={(e) => onChange({ ...el, language: e.target.value })} className='text-xs h-8 font-mono' />
      <Textarea rows={5} placeholder='Code...' value={(el.value as string) ?? ''}
        onChange={(e) => onChange({ ...el, value: e.target.value })} className='text-xs font-mono resize-none' />
    </div>
  );

  if (el.type === 'note') return (
    <div className='space-y-2'>
      <select value={(el.noteType as string) ?? 'info'}
        onChange={(e) => onChange({ ...el, noteType: e.target.value as any })}
        className='text-xs h-8 w-full rounded-md border border-border bg-background px-2'>
        {['info', 'warning', 'danger', 'success'].map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <BiField field='value' label='Content' rows={3} />
      <Input placeholder='Link URL (optional)' value={(el.link as string) ?? ''}
        onChange={(e) => onChange({ ...el, link: e.target.value })} className='text-xs h-8' />
    </div>
  );

  if (el.type === 'terminal') return (
    <div className='space-y-2'>
      <BiField field='label' label='Label' />
      <BiField field='value' label='Command' rows={3} />
    </div>
  );

  if (el.type === 'button') return (
    <div className='space-y-2'>
      <BiField field='label' label='Button text' />
      <Input placeholder='URL' value={(el.href as string) ?? ''}
        onChange={(e) => onChange({ ...el, href: e.target.value })} className='text-xs h-8' />
    </div>
  );

  if (el.type === 'list') {
    const items: { en: string; ar: string }[] = Array.isArray(el.items)
      ? (el.items as any[]).map((i) => (typeof i === 'object' && 'en' in i ? i : { en: String(i), ar: '' }))
      : [];
    return (
      <div className='space-y-2'>
        <BiField field='title' label='List title (optional)' />
        <div className='space-y-1.5'>
          {items.map((item, i) => (
            <div key={i} className='flex gap-1.5'>
              <Input placeholder='Item (EN)' value={item.en} className='text-xs h-7'
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], en: e.target.value }; onChange({ ...el, items: n }); }} />
              <Input placeholder='عنصر (AR)' value={item.ar} dir='rtl' className='text-xs h-7'
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], ar: e.target.value }; onChange({ ...el, items: n }); }} />
              <button onClick={() => onChange({ ...el, items: items.filter((_, j) => j !== i) })}
                className='shrink-0 text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
            </div>
          ))}
          <button onClick={() => onChange({ ...el, items: [...items, { en: '', ar: '' }] })}
            className='text-xs text-primary hover:underline'>+ Add item</button>
        </div>
      </div>
    );
  }

  if (el.type === 'orderedList') {
    const items: { subtitle: { en: string; ar: string }; text: { en: string; ar: string } }[] =
      Array.isArray(el.items)
        ? (el.items as any[]).map((i) =>
            'subtitle' in i ? i : { subtitle: { en: String(i), ar: '' }, text: { en: '', ar: '' } })
        : [];
    return (
      <div className='space-y-2'>
        <BiField field='title' label='Title (optional)' />
        <div className='space-y-3'>
          {items.map((item, i) => (
            <div key={i} className='rounded-lg border border-border/50 bg-muted/20 p-2 space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground font-semibold'>Item {i + 1}</span>
                <button onClick={() => onChange({ ...el, items: items.filter((_, j) => j !== i) })}
                  className='text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
              </div>
              <div className='grid grid-cols-2 gap-1.5'>
                <Input placeholder='Subtitle (EN)' value={item.subtitle.en} className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], subtitle: { ...n[i].subtitle, en: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='العنوان (AR)' value={item.subtitle.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], subtitle: { ...n[i].subtitle, ar: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='Text (EN)' value={item.text.en} className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: { ...n[i].text, en: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='النص (AR)' value={item.text.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: { ...n[i].text, ar: e.target.value } }; onChange({ ...el, items: n }); }} />
              </div>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...el, items: [...items, { subtitle: { en: '', ar: '' }, text: { en: '', ar: '' } }] })}
            className='text-xs text-primary hover:underline'>+ Add item</button>
        </div>
      </div>
    );
  }

  if (el.type === 'table') {
    const headers: { en: string; ar: string }[] = Array.isArray(el.headers)
      ? (el.headers as any[]).map((h) => (typeof h === 'object' && 'en' in h ? h : { en: String(h), ar: '' }))
      : [];
    const rows: { en: string; ar: string }[][] = (el.rows ?? []).map((r) =>
      Array.isArray(r)
        ? (r as any[]).map((c) => (typeof c === 'object' && 'en' in c ? c : { en: String(c), ar: '' }))
        : []
    );
    const updateHeaders = (nh: typeof headers) => onChange({ ...el, headers: nh });
    const updateRows    = (nr: typeof rows)    => onChange({ ...el, rows: nr });
    return (
      <div className='space-y-2'>
        <BiField field='title' label='Table title (optional)' />
        <p className='text-xs font-semibold text-muted-foreground'>Headers</p>
        {headers.map((h, i) => (
          <div key={i} className='flex gap-1.5'>
            <Input placeholder='Header (EN)' value={h.en} className='text-xs h-7'
              onChange={(e) => { const n = [...headers]; n[i] = { ...n[i], en: e.target.value }; updateHeaders(n); }} />
            <Input placeholder='العنوان (AR)' value={h.ar} dir='rtl' className='text-xs h-7'
              onChange={(e) => { const n = [...headers]; n[i] = { ...n[i], ar: e.target.value }; updateHeaders(n); }} />
            <button onClick={() => updateHeaders(headers.filter((_, j) => j !== i))}
              className='shrink-0 text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
          </div>
        ))}
        <button onClick={() => updateHeaders([...headers, { en: '', ar: '' }])}
          className='text-xs text-primary hover:underline'>+ Add header</button>
        <p className='text-xs font-semibold text-muted-foreground mt-2'>Rows</p>
        {rows.map((row, ri) => (
          <div key={ri} className='rounded border border-border/40 bg-muted/10 p-1.5 space-y-1'>
            <div className='flex justify-between items-center'>
              <span className='text-xs text-muted-foreground'>Row {ri + 1}</span>
              <button onClick={() => updateRows(rows.filter((_, j) => j !== ri))}
                className='text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
            </div>
            {row.map((cell, ci) => (
              <div key={ci} className='grid grid-cols-2 gap-1.5'>
                <Input placeholder={`Cell ${ci + 1} (EN)`} value={cell.en} className='text-xs h-7'
                  onChange={(e) => { const nr = rows.map((r, ri2) => ri2 === ri ? r.map((c, ci2) => ci2 === ci ? { ...c, en: e.target.value } : c) : r); updateRows(nr); }} />
                <Input placeholder={`خلية ${ci + 1} (AR)`} value={cell.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const nr = rows.map((r, ri2) => ri2 === ri ? r.map((c, ci2) => ci2 === ci ? { ...c, ar: e.target.value } : c) : r); updateRows(nr); }} />
              </div>
            ))}
          </div>
        ))}
        <button onClick={() => updateRows([...rows, headers.map(() => ({ en: '', ar: '' }))])}
          className='text-xs text-primary hover:underline'>+ Add row</button>
      </div>
    );
  }

  return <BiField field='value' label='Content' rows={['text', 'orderedList'].includes(el.type) ? 3 : 0} />;
}

// ── Topic Row ───────────────────────────────────────────────────────────────
function TopicRow({
  topic, topicIndex, total, isOpen, onToggle,
  editMode, onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
  topic: Topic; topicIndex: number; total: number;
  isOpen: boolean; onToggle: () => void; editMode: boolean;
  onUpdate: (t: Topic) => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [editingElId, setEditingElId] = useState<string | number | null>(null);
  const topicNum = String(topicIndex + 1).padStart(2, '0');
  const isLast = topicIndex === total - 1;

  const updateEl = (elId: string | number, updated: CourseElement) =>
    onUpdate({ ...topic, elements: topic.elements.map((e) => e.id === elId ? updated : e) });
  const deleteEl = (elId: string | number) =>
    onUpdate({ ...topic, elements: topic.elements.filter((e) => e.id !== elId) });
  const addEl = (type: string) =>
    onUpdate({ ...topic, elements: [...topic.elements, makeElement(type)] });
  const moveEl = (elId: string | number, dir: 'up' | 'down') => {
    const els = [...topic.elements];
    const idx = els.findIndex((e) => e.id === elId);
    if (dir === 'up'   && idx > 0)               { [els[idx - 1], els[idx]]     = [els[idx], els[idx - 1]]; }
    if (dir === 'down' && idx < els.length - 1)  { [els[idx],     els[idx + 1]] = [els[idx + 1], els[idx]]; }
    onUpdate({ ...topic, elements: els });
  };

  return (
    <motion.li
      id={`topic-row-${topicIndex}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: topicIndex * 0.04 }}
      className='relative'>
      <div className='flex gap-4'>
        {/* Timeline dot */}
        <div className='relative flex shrink-0 flex-col items-center'>
          <div className={cn(
            'relative z-10 flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
            isOpen ? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/20'
                   : 'border-border/60 bg-muted/50 text-muted-foreground',
          )}>
            <span className='font-black'>{topicNum}</span>
          </div>
          {!isLast && <div className='mt-1 min-h-[16px] w-px flex-1 bg-border/30' />}
        </div>

        {/* Card */}
        <div className={cn(
          'mb-2 min-w-0 flex-1 rounded-xl border bg-card transition-all duration-300',
          isOpen ? 'border-primary/30 shadow-sm' : 'cursor-pointer border-border/50 hover:border-border',
          editMode && 'ring-1 ring-primary/10',
        )}>
          {/* Header */}
          <div className='flex w-full items-center gap-3 px-4 py-3.5 text-start'
            onClick={!editMode ? onToggle : undefined}>
            {editMode && <GripVertical className='h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab' />}
            <span className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
              isOpen ? 'border-primary/30 bg-primary/10 text-primary'
                     : 'border-border bg-muted text-muted-foreground',
            )}>
              <BookOpen className='h-4 w-4' />
            </span>
            <div className='min-w-0 flex-1'>
              <span className={cn(
                'inline-flex rounded-full border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide mb-0.5',
                isOpen ? 'border-primary/25 bg-primary/10 text-primary'
                       : 'border-border bg-muted text-muted-foreground',
              )}>TOPIC {topicNum}</span>
              {editMode ? (
                <div className='flex gap-2 mt-0.5' onClick={(e) => e.stopPropagation()}>
                  <Input value={topic.title.en} placeholder='Topic title (EN)'
                    onChange={(e) => onUpdate({ ...topic, title: { ...topic.title, en: e.target.value } })}
                    className='h-7 text-sm font-semibold' onClick={(e) => e.stopPropagation()} />
                  <Input value={topic.title.ar} placeholder='العنوان (AR)' dir='rtl'
                    onChange={(e) => onUpdate({ ...topic, title: { ...topic.title, ar: e.target.value } })}
                    className='h-7 text-sm font-semibold' onClick={(e) => e.stopPropagation()} />
                </div>
              ) : (
                <p className='text-sm font-semibold leading-snug text-foreground'>
                  {topic.title.en || 'Untitled Topic'}
                  {topic.title.ar && (
                    <span className='ms-2 text-xs text-muted-foreground/60 font-normal' dir='rtl'>
                      {topic.title.ar}
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className='flex shrink-0 items-center gap-1.5'>
              <Badge variant='outline' className='text-xs'>{topic.elements.length} el</Badge>
              {editMode ? (
                <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                  <button onClick={onMoveUp} disabled={topicIndex === 0}
                    className='p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30'>
                    <ArrowUp className='h-3.5 w-3.5' /></button>
                  <button onClick={onMoveDown} disabled={isLast}
                    className='p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30'>
                    <ArrowDown className='h-3.5 w-3.5' /></button>
                  <button onClick={onToggle}
                    className='p-1 rounded text-muted-foreground hover:text-primary'>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} /></button>
                  <button onClick={onDelete}
                    className='p-1 rounded text-muted-foreground hover:text-destructive'>
                    <Trash2 className='h-3.5 w-3.5' /></button>
                </div>
              ) : (
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200 ms-1', isOpen && 'rotate-180')} />
              )}
            </div>
          </div>

          {/* Body */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div key='body'
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='overflow-hidden'>
                <div className='border-t border-border/40 px-5 pb-5 pt-4 space-y-4'>
                  {editMode ? (
                    <div className='space-y-3'>
                      {topic.elements.length === 0 && (
                        <p className='text-sm italic text-muted-foreground text-center py-4'>
                          No elements yet. Add one below.
                        </p>
                      )}
                      {topic.elements.map((el, elIdx) => (
                        <div key={el.id} className='rounded-lg border bg-muted/20 overflow-hidden'>
                          <div className='flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30'>
                            <Badge className={cn('text-[11px] border shrink-0', EL_COLORS[el.type] ?? 'bg-muted')}>
                              {el.type}
                            </Badge>
                            <div className='flex-1' />
                            <button onClick={() => moveEl(el.id!, 'up')} disabled={elIdx === 0}
                              className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30'>
                              <ArrowUp className='h-3 w-3' /></button>
                            <button onClick={() => moveEl(el.id!, 'down')} disabled={elIdx === topic.elements.length - 1}
                              className='p-1 text-muted-foreground hover:text-foreground disabled:opacity-30'>
                              <ArrowDown className='h-3 w-3' /></button>
                            <button
                              onClick={() => setEditingElId(editingElId === el.id ? null : el.id!)}
                              className='text-xs text-muted-foreground hover:text-primary flex items-center gap-1'>
                              <Pencil className='h-3 w-3' />
                              {editingElId === el.id ? 'Close' : 'Edit'}
                            </button>
                            <button onClick={() => deleteEl(el.id!)}
                              className='text-muted-foreground hover:text-destructive'>
                              <Trash2 className='h-3.5 w-3.5' /></button>
                          </div>
                          {editingElId === el.id ? (
                            <div className='p-3'>
                              <ElementEditor el={el} onChange={(u) => updateEl(el.id!, u)} />
                            </div>
                          ) : (
                            <div className='px-3 py-2 opacity-70 pointer-events-none text-xs'>
                              <CourseElementRenderer elements={[el]} lang='en' />
                            </div>
                          )}
                        </div>
                      ))}
                      <div className='flex flex-wrap gap-1.5 border-t pt-3'>
                        <span className='text-xs text-muted-foreground self-center'>+ Add:</span>
                        {ELEMENT_TYPES.map((type) => (
                          <button key={type} onClick={() => addEl(type)}
                            className={cn(
                              'rounded-md border px-2 py-0.5 text-[11px] font-medium hover:opacity-80 transition-opacity',
                              EL_COLORS[type] ?? 'bg-muted border-border text-muted-foreground',
                            )}>{type}</button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    topic.elements.length === 0
                      ? <p className='text-sm italic text-muted-foreground'>No content yet.</p>
                      : <CourseElementRenderer elements={topic.elements} lang='en' />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CurriculumSkeleton() {
  return (
    <div className='space-y-3'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='flex gap-4'>
          <div className='h-[50px] w-[50px] shrink-0 rounded-full bg-muted animate-pulse' />
          <div className='flex-1 rounded-xl border border-border/30 bg-muted/20 h-16 animate-pulse' />
        </div>
      ))}
    </div>
  );
}

// ── JSON Import Panel ─────────────────────────────────────────────────────
function JsonImportPanel({ onImport, onClose }: { onImport: (topics: Topic[]) => void; onClose: () => void }) {
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

// ── Strip internal-only fields before sending to backend ─────────────────────
function sanitizeTopicsForSave(topics: Topic[]): object[] {
  return topics.map((t) => ({
    ...t,
    elements: t.elements.map(({ _localFile, ...el }: any) => el),
  }));
}

// ── Source badge ────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source?: 'json' | 'db' }) {
  if (!source) return null;
  return source === 'json' ? (
    <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400'>
      <FileJson className='h-3 w-3' /> JSON file
    </span>
  ) : (
    <span className='inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400'>
      DB fallback
    </span>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
interface Props { courseId: string; courseSlug: string; }

export function CurriculumPlatformEditor({ courseId, courseSlug }: Props) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode]     = useState(false);
  const [localTopics, setLocalTopics] = useState<Topic[] | null>(null);
  const [openId, setOpenId]         = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'curriculum', courseSlug],
    queryFn:  () => adminCoursesApi.getCurriculum(courseSlug),
  });

  useEffect(() => {
    if (data?.topics && localTopics === null) {
      const normalized = (data.topics as any[]).map((t, i) => normalizeTopic(t, i));
      setLocalTopics(normalized);
      if (normalized.length > 0) setOpenId(normalized[0].id);
    }
  }, [data]);

  const topics: Topic[] = localTopics ?? [];
  const total = topics.length;
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => adminCoursesApi.saveCurriculum(courseId, sanitizeTopicsForSave(topics)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum', courseSlug] });
      toast.success('Curriculum saved!');
      setEditMode(false);
    },
    onError: () => toast.error('Failed to save curriculum'),
  });

  const addTopic = () => {
    const newT: Topic = {
      id: `topic-${Date.now()}`,
      title: { en: 'New Topic', ar: 'موضوع جديد' },
      elements: [],
    };
    setLocalTopics([...topics, newT]);
    setOpenId(newT.id);
  };

  const updateTopic = (updated: Topic) =>
    setLocalTopics(topics.map((t) => t.id === updated.id ? updated : t));
  const deleteTopic = (id: string) =>
    setLocalTopics(topics.filter((t) => t.id !== id));
  const moveTopic = (id: string, dir: 'up' | 'down') => {
    const arr = [...topics];
    const idx = arr.findIndex((t) => t.id === id);
    if (dir === 'up'   && idx > 0)              { [arr[idx - 1], arr[idx]]     = [arr[idx], arr[idx - 1]]; }
    if (dir === 'down' && idx < arr.length - 1) { [arr[idx],     arr[idx + 1]] = [arr[idx + 1], arr[idx]]; }
    setLocalTopics(arr);
  };

  const handleJsonImport = (imported: Topic[]) => {
    setLocalTopics(imported);
    if (imported.length > 0) setOpenId(imported[0].id);
    setEditMode(true);
  };

  if (isLoading) return <CurriculumSkeleton />;

  return (
    <section id='course-curriculum' className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 flex-wrap'>
            <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>Course Curriculum</h2>
            <SourceBadge source={data?.source} />
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {total} Topics · Follow the order for best results
          </p>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Button variant='outline' size='sm' className='gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/10'
            onClick={() => setShowImport((v) => !v)}>
            <FileJson className='h-3.5 w-3.5' />
            {showImport ? 'Close Import' : 'Import JSON'}
          </Button>
          <div className='flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5'>
            <button onClick={() => setEditMode(false)}
              className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                !editMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <Eye className='h-3.5 w-3.5' /> Preview
            </button>
            <button onClick={() => setEditMode(true)}
              className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                editMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <Edit3 className='h-3.5 w-3.5' /> Edit
            </button>
          </div>
          {editMode && (
            <>
              <Button variant='outline' size='sm' onClick={addTopic} className='gap-1.5 h-8'>
                <Plus className='h-3.5 w-3.5' /> Add Topic
              </Button>
              <Button size='sm' onClick={() => save()} disabled={saving} className='gap-1.5 h-8'>
                {saving
                  ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  : <Save className='h-3.5 w-3.5' />}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant='ghost' size='sm'
                onClick={() => {
                  const normalized = ((data?.topics ?? []) as any[]).map((t, i) => normalizeTopic(t, i));
                  setLocalTopics(normalized);
                  setEditMode(false);
                }}
                className='h-8 gap-1.5 text-muted-foreground'>
                <X className='h-3.5 w-3.5' /> Discard
              </Button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className='overflow-hidden'>
            <JsonImportPanel onImport={handleJsonImport} onClose={() => setShowImport(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {topics.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed rounded-xl'>
          <p className='text-muted-foreground text-sm'>No topics yet.</p>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => { setEditMode(true); addTopic(); }} className='gap-1.5'>
              <Plus className='h-3.5 w-3.5' /> Add First Topic
            </Button>
            <Button variant='outline' size='sm' onClick={() => setShowImport(true)} className='gap-1.5 border-primary/30 text-primary'>
              <FileJson className='h-3.5 w-3.5' /> Import JSON
            </Button>
          </div>
        </div>
      ) : (
        <div className='relative'>
          <div aria-hidden='true' className='absolute top-5 bottom-5 start-[25px] w-px bg-border/40' />
          <ol className='space-y-2'>
            {topics.map((topic, idx) => (
              <TopicRow
                key={topic.id} topic={topic} topicIndex={idx} total={total}
                isOpen={openId === topic.id} onToggle={() => toggle(topic.id)}
                editMode={editMode} onUpdate={updateTopic}
                onDelete={() => deleteTopic(topic.id)}
                onMoveUp={() => moveTopic(topic.id, 'up')}
                onMoveDown={() => moveTopic(topic.id, 'down')}
              />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
