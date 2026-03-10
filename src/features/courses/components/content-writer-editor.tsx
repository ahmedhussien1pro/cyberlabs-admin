// src/features/courses/components/content-writer-editor.tsx
// ✅ Content Writer: rendered preview (frontend-accurate) + inline edit mode
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import CourseElementRenderer, { type CourseElement } from './CourseElementRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Edit3, Save, X, Plus, Trash2, ChevronDown,
  ChevronRight, GripVertical, Eye, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  title: { en: string; ar: string };
  elements: CourseElement[];
}

const ELEMENT_TYPES = [
  'text', 'title', 'subtitle', 'image', 'note', 'terminal',
  'code', 'table', 'orderedList', 'list', 'video', 'button', 'hr',
];

const EL_COLORS: Record<string, string> = {
  text: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  title: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  subtitle: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  image: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  note: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  terminal: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  code: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  table: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  orderedList: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  list: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  video: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  button: 'bg-green-500/10 text-green-400 border-green-500/30',
  hr: 'bg-muted text-muted-foreground border-border',
};

function makeElement(type: string): CourseElement {
  const base: CourseElement = { id: Date.now(), type };
  if (type === 'hr') return base;
  if (type === 'code') return { ...base, value: '', language: 'bash' };
  if (type === 'terminal') return { ...base, value: { en: '', ar: '' }, label: { en: 'Terminal', ar: 'تيرمينال' } };
  if (type === 'image') return { ...base, imageUrl: '', alt: { en: '', ar: '' }, size: 'full' };
  if (type === 'video') return { ...base, url: '', title: { en: '', ar: '' } };
  if (type === 'button') return { ...base, href: '', label: { en: 'Click here', ar: 'اضغط هنا' }, newTab: true };
  if (type === 'note') return { ...base, noteType: 'info', value: { en: '', ar: '' } };
  if (type === 'list') return { ...base, title: { en: '', ar: '' }, items: [{ en: '', ar: '' }] };
  if (type === 'orderedList') return { ...base, title: { en: '', ar: '' }, items: [{ subtitle: { en: '', ar: '' }, text: { en: '', ar: '' } }] };
  if (type === 'table') return { ...base, title: { en: '', ar: '' }, headers: [{ en: 'Header', ar: 'عنوان' }], rows: [[{ en: '', ar: '' }]] };
  return { ...base, value: { en: '', ar: '' } };
}

// ── Inline Element Editor ─────────────────────────────────────────────
function ElementEditor({ el, onChange }: { el: CourseElement; onChange: (updated: CourseElement) => void }) {
  const setVal = (field: string, lang: 'en' | 'ar', val: string) =>
    onChange({ ...el, [field]: { ...((el[field] as any) ?? {}), [lang]: val } });

  const BiField = ({ field, label, multiline = false }: { field: string; label: string; multiline?: boolean }) => (
    <div className='grid grid-cols-2 gap-2'>
      {(['en', 'ar'] as const).map((lng) => (
        multiline
          ? <Textarea key={lng} rows={3} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setVal(field, lng, e.target.value)}
              className='text-xs resize-none' />
          : <Input key={lng} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setVal(field, lng, e.target.value)}
              className='text-xs h-8' />
      ))}
    </div>
  );

  if (el.type === 'hr') return <p className='text-xs text-muted-foreground italic'>Horizontal Rule — no content</p>;

  if (el.type === 'image')
    return (
      <div className='space-y-2'>
        <Input placeholder='Image URL' value={(el.imageUrl as string) ?? ''}
          onChange={(e) => onChange({ ...el, imageUrl: e.target.value })} className='text-xs h-8' />
        <BiField field='alt' label='Alt text' />
        <select value={(el.size as string) ?? 'full'}
          onChange={(e) => onChange({ ...el, size: e.target.value })}
          className='text-xs h-8 rounded-md border border-border bg-background px-2 w-full'>
          {['small', 'medium', 'large', 'full'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    );

  if (el.type === 'video')
    return (
      <div className='space-y-2'>
        <Input placeholder='Video URL (embed)' value={(el.url as string) ?? ''}
          onChange={(e) => onChange({ ...el, url: e.target.value })} className='text-xs h-8' />
        <BiField field='title' label='Title' />
      </div>
    );

  if (el.type === 'code')
    return (
      <div className='space-y-2'>
        <Input placeholder='Language (bash, python...)' value={(el.language as string) ?? ''}
          onChange={(e) => onChange({ ...el, language: e.target.value })} className='text-xs h-8 font-mono' />
        <Textarea rows={5} placeholder='Code...' value={(el.value as string) ?? ''}
          onChange={(e) => onChange({ ...el, value: e.target.value })}
          className='text-xs font-mono resize-none' />
      </div>
    );

  if (el.type === 'note')
    return (
      <div className='space-y-2'>
        <select value={(el.noteType as string) ?? 'info'}
          onChange={(e) => onChange({ ...el, noteType: e.target.value as any })}
          className='text-xs h-8 rounded-md border border-border bg-background px-2 w-full'>
          {['info', 'warning', 'danger', 'success'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <BiField field='value' label='Content' multiline />
        <Input placeholder='Link URL (optional)' value={(el.link as string) ?? ''}
          onChange={(e) => onChange({ ...el, link: e.target.value })} className='text-xs h-8' />
      </div>
    );

  if (el.type === 'terminal')
    return (
      <div className='space-y-2'>
        <BiField field='label' label='Label' />
        <BiField field='value' label='Command' multiline />
      </div>
    );

  if (el.type === 'button')
    return (
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

  return <BiField field='value' label='Content' multiline={['text', 'orderedList'].includes(el.type)} />;
}

// ── Topic Row in Content Writer ───────────────────────────────────────
function TopicContentRow({
  topic, index, editMode,
  onUpdate, onDelete,
}: {
  topic: Topic;
  index: number;
  editMode: boolean;
  onUpdate: (t: Topic) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [editingEl, setEditingEl] = useState<string | number | null>(null);

  const updateEl = (elId: string | number, updated: CourseElement) =>
    onUpdate({ ...topic, elements: topic.elements.map((e) => e.id === elId ? updated : e) });
  const deleteEl = (elId: string | number) =>
    onUpdate({ ...topic, elements: topic.elements.filter((e) => e.id !== elId) });
  const addEl = (type: string) =>
    onUpdate({ ...topic, elements: [...topic.elements, makeElement(type)] });

  return (
    <div className='rounded-xl border border-border/50 overflow-hidden'>
      {/* Topic header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
          open ? 'bg-primary/5 border-b border-border/50' : 'hover:bg-muted/30',
        )}
        onClick={() => setOpen((o) => !o)}>
        <GripVertical className='h-4 w-4 text-muted-foreground/40 shrink-0' />
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary'>
          {index + 1}
        </span>
        <div className='flex-1 min-w-0'>
          {editMode ? (
            <div className='flex gap-2' onClick={(e) => e.stopPropagation()}>
              <Input value={topic.title.en} placeholder='Topic title (EN)'
                onChange={(e) => onUpdate({ ...topic, title: { ...topic.title, en: e.target.value } })}
                className='h-7 text-sm' />
              <Input value={topic.title.ar} placeholder='العنوان (AR)' dir='rtl'
                onChange={(e) => onUpdate({ ...topic, title: { ...topic.title, ar: e.target.value } })}
                className='h-7 text-sm' />
            </div>
          ) : (
            <p className='font-semibold text-sm truncate'>{topic.title.en || 'Untitled Topic'}</p>
          )}
        </div>
        <Badge variant='outline' className='text-xs shrink-0'>{topic.elements.length} elements</Badge>
        {editMode && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className='shrink-0 text-muted-foreground hover:text-destructive p-1 rounded'>
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        )}
        {open ? <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
               : <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground' />}
      </div>

      {/* Topic body */}
      {open && (
        <div className='px-5 py-4 space-y-4'>
          {editMode ? (
            <div className='space-y-3'>
              {topic.elements.length === 0 && (
                <p className='text-sm text-muted-foreground italic text-center py-4'>No elements yet. Add one below.</p>
              )}
              {topic.elements.map((el) => (
                <div key={el.id} className='rounded-lg border bg-muted/20 overflow-hidden'>
                  <div className='flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30'>
                    <Badge className={cn('text-[11px] border', EL_COLORS[el.type] ?? 'bg-muted')}>{el.type}</Badge>
                    <div className='flex-1' />
                    <button onClick={() => setEditingEl(editingEl === el.id ? null : el.id)}
                      className='text-xs text-muted-foreground hover:text-primary flex items-center gap-1'>
                      <Pencil className='h-3 w-3' />
                      {editingEl === el.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => deleteEl(el.id!)}
                      className='text-muted-foreground hover:text-destructive'>
                      <Trash2 className='h-3.5 w-3.5' />
                    </button>
                  </div>
                  {editingEl === el.id && (
                    <div className='p-3'>
                      <ElementEditor el={el} onChange={(updated) => updateEl(el.id!, updated)} />
                    </div>
                  )}
                  {editingEl !== el.id && (
                    <div className='px-3 py-2 opacity-70 pointer-events-none text-xs'>
                      <CourseElementRenderer elements={[el]} lang='en' />
                    </div>
                  )}
                </div>
              ))}

              {/* Add element bar */}
              <div className='flex flex-wrap gap-1.5 border-t pt-3'>
                <span className='text-xs text-muted-foreground self-center'>+ Add:</span>
                {ELEMENT_TYPES.map((type) => (
                  <button key={type} onClick={() => addEl(type)}
                    className={cn('rounded-md border px-2 py-0.5 text-[11px] font-medium hover:opacity-80 transition-opacity', EL_COLORS[type] ?? 'bg-muted border-border text-muted-foreground')}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            topic.elements.length === 0
              ? <p className='text-sm text-muted-foreground italic'>No content yet.</p>
              : <CourseElementRenderer elements={topic.elements} lang='en' />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
interface Props {
  courseId: string;
  courseSlug: string;
}

export function ContentWriterEditor({ courseId, courseSlug }: Props) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [localTopics, setLocalTopics] = useState<Topic[] | null>(null);

  const { data, isLoading } = useQuery<{ topics: Topic[] }>({
    queryKey: ['admin', 'curriculum', courseSlug],
    queryFn: () => adminCoursesApi.getCurriculum(courseSlug) as any,
  });

  // Sync localTopics when data loads (only if not yet set)
  useEffect(() => {
    if (data?.topics && localTopics === null) {
      setLocalTopics(data.topics);
    }
  }, [data]);

  const topics: Topic[] = localTopics ?? data?.topics ?? [];

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => adminCoursesApi.saveCurriculum(courseId, topics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum', courseSlug] });
      toast.success('Curriculum saved successfully');
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
  };

  if (isLoading)
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => <Skeleton key={i} className='h-24 rounded-xl' />)}
      </div>
    );

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setEditMode(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              !editMode ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
            )}>
            <Eye className='h-3.5 w-3.5' /> Preview
          </button>
          <button
            onClick={() => setEditMode(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              editMode ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
            )}>
            <Edit3 className='h-3.5 w-3.5' /> Edit Mode
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>{topics.length} topics</span>
          {editMode && (
            <>
              <Button variant='outline' size='sm' onClick={addTopic} className='gap-1.5 h-8'>
                <Plus className='h-3.5 w-3.5' /> Add Topic
              </Button>
              <Button size='sm' onClick={() => save()} disabled={saving} className='gap-1.5 h-8'>
                {saving ? <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        : <Save className='h-3.5 w-3.5' />}
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant='ghost' size='sm' onClick={() => { setLocalTopics(data?.topics ?? []); setEditMode(false); }}
                className='h-8 gap-1.5 text-muted-foreground'>
                <X className='h-3.5 w-3.5' /> Discard
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Topics */}
      {topics.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed rounded-xl'>
          <p className='text-muted-foreground text-sm'>No topics yet.</p>
          <Button variant='outline' size='sm' onClick={() => { setEditMode(true); addTopic(); }} className='gap-1.5'>
            <Plus className='h-3.5 w-3.5' /> Add First Topic
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {topics.map((topic, i) => (
            <TopicContentRow
              key={topic.id}
              topic={topic}
              index={i}
              editMode={editMode}
              onUpdate={(updated) => setLocalTopics(topics.map((t) => t.id === updated.id ? updated : t))}
              onDelete={() => setLocalTopics(topics.filter((t) => t.id !== topic.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
