// CurriculumTab — Curriculum Editor (Step 1: view + JSON import + save)
import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  Upload,
  FileJson,
  AlertCircle,
  Edit2,
  ChevronUp,
  Trash2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { coursesApi } from '../../services/courses.api';
import type { Course } from '../../types/course.types';

interface Props {
  course: Course;
}

interface Element {
  id?: string | number;
  type: string;
  value?: { en: string; ar: string } | string;
  [key: string]: unknown;
}
interface Topic {
  id?: string;
  title: { en: string; ar: string };
  elements: Element[];
}

// ── JSON Import Panel ─────────────────────────────────────────────────
function JsonImportPanel({
  onImport,
}: {
  onImport: (topics: Topic[]) => void;
}) {
  const [pasteValue, setPasteValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const topics: Topic[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.topics)
          ? parsed.topics
          : (null as any);
      if (!topics)
        throw new Error('Expected array of topics or { topics: [...] }');
      setError(null);
      onImport(topics);
      setPasteValue('');
      toast.success(`Imported ${topics.length} topics — click Save to persist`);
    } catch (e: any) {
      setError(e.message ?? 'Invalid JSON');
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parse(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-sm'>
          <FileJson className='h-4 w-4 text-primary' /> Import JSON
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2 h-9'
            onClick={() => fileRef.current?.click()}>
            <Upload className='h-4 w-4' /> Choose .json file
          </Button>
          <input
            ref={fileRef}
            type='file'
            accept='.json'
            className='hidden'
            onChange={onFile}
          />
          <span className='text-xs text-muted-foreground'>
            or paste JSON below
          </span>
        </div>
        <Textarea
          rows={5}
          placeholder='{"topics": [...]} or [...]'
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          className='font-mono text-xs'
        />
        {error && (
          <Alert variant='destructive' className='py-2'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='text-xs'>{error}</AlertDescription>
          </Alert>
        )}
        {pasteValue.trim() && (
          <Button size='sm' onClick={() => parse(pasteValue)} className='gap-2'>
            <FileJson className='h-4 w-4' /> Import from Paste
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Element row (minimal inline edit) ────────────────────────────────
function ElementRow({
  el,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  el: Element;
  onUpdate: (el: Element) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const val =
    typeof el.value === 'object'
      ? ((el.value as any)?.en ?? '')
      : (el.value ?? '');

  return (
    <div className='flex items-start gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2'>
      <span className='mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary'>
        {el.type}
      </span>
      <div className='flex-1 min-w-0'>
        {editing ? (
          <textarea
            className='w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono resize-y min-h-[3rem]'
            defaultValue={JSON.stringify(el, null, 2)}
            onBlur={(e) => {
              try {
                const updated = JSON.parse(e.target.value);
                onUpdate(updated);
                setEditing(false);
              } catch {
                toast.error('Invalid JSON for element');
              }
            }}
            autoFocus
          />
        ) : (
          <p className='text-xs text-muted-foreground line-clamp-2'>
            {val || `(${el.type})`}
          </p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-0.5'>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0'
          disabled={isFirst}
          onClick={onMoveUp}>
          <ChevronUp className='h-3 w-3' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0'
          disabled={isLast}
          onClick={onMoveDown}>
          <ChevronDown className='h-3 w-3' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0'
          onClick={() => setEditing(!editing)}>
          <Edit2 className='h-3 w-3' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='h-6 w-6 p-0 text-destructive hover:text-destructive'
          onClick={onDelete}>
          <Trash2 className='h-3 w-3' />
        </Button>
      </div>
    </div>
  );
}

// ── TopicBlock ─────────────────────────────────────────────────────────
function TopicBlock({
  topic,
  topicIndex,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  topic: Topic;
  topicIndex: number;
  total: number;
  onChange: (t: Topic) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);

  const updateElement = (idx: number, el: Element) => {
    const els = [...topic.elements];
    els[idx] = el;
    onChange({ ...topic, elements: els });
  };
  const deleteElement = (idx: number) => {
    onChange({
      ...topic,
      elements: topic.elements.filter((_, i) => i !== idx),
    });
  };
  const moveEl = (idx: number, dir: -1 | 1) => {
    const els = [...topic.elements];
    const to = idx + dir;
    if (to < 0 || to >= els.length) return;
    [els[idx], els[to]] = [els[to], els[idx]];
    onChange({ ...topic, elements: els });
  };

  return (
    <div className='rounded-xl border border-border/60 bg-card overflow-hidden'>
      {/* Topic header */}
      <div
        className='flex items-center gap-2 px-4 py-3 bg-muted/30 cursor-pointer'
        onClick={() => setOpen(!open)}>
        {open ? (
          <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
        ) : (
          <ChevronRight className='h-4 w-4 text-muted-foreground shrink-0' />
        )}
        <span className='text-sm font-semibold flex-1 truncate'>
          {topicIndex + 1}. {topic.title?.en ?? 'Untitled Topic'}
        </span>
        <span className='text-xs text-muted-foreground'>
          {topic.elements.length} elements
        </span>
        <div
          className='flex items-center gap-0.5 ms-2'
          onClick={(e) => e.stopPropagation()}>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={topicIndex === 0}
            onClick={onMoveUp}>
            <ChevronUp className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={topicIndex === total - 1}
            onClick={onMoveDown}>
            <ChevronDown className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0 text-destructive hover:text-destructive'
            onClick={onDelete}>
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Elements */}
      {open && (
        <div className='p-3 space-y-2'>
          {topic.elements.map((el, idx) => (
            <ElementRow
              key={idx}
              el={el}
              isFirst={idx === 0}
              isLast={idx === topic.elements.length - 1}
              onUpdate={(updated) => updateElement(idx, updated)}
              onDelete={() => deleteElement(idx)}
              onMoveUp={() => moveEl(idx, -1)}
              onMoveDown={() => moveEl(idx, 1)}
            />
          ))}
          <Button
            variant='outline'
            size='sm'
            className='w-full gap-2 h-8 mt-1'
            onClick={() =>
              onChange({
                ...topic,
                elements: [
                  ...topic.elements,
                  { type: 'text', value: { en: '', ar: '' } },
                ],
              })
            }>
            <Plus className='h-3.5 w-3.5' /> Add Element
          </Button>
        </div>
      )}
    </div>
  );
}

// ═══ CurriculumTab ═══════════════════════════════════════════════════
export function CurriculumTab({ course }: Props) {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['courses', 'curriculum', course.id],
    queryFn: () => coursesApi.getCurriculum(course.id),
  });

  // ── init local state once data loads ──
  const serverTopics: Topic[] = data?.topics ?? [];
  const localTopics = topics ?? serverTopics;

  const save = useMutation({
    mutationFn: () => coursesApi.saveCurriculum(course.id, localTopics),
    onSuccess: () => {
      toast.success('Curriculum saved');
      setDirty(false);
      setTopics(null);
    },
    onError: () => toast.error('Failed to save curriculum'),
  });

  const update = (newTopics: Topic[]) => {
    setTopics(newTopics);
    setDirty(true);
  };

  const moveTopic = (idx: number, dir: -1 | 1) => {
    const arr = [...localTopics];
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    update(arr);
  };

  if (isLoading)
    return (
      <div className='space-y-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-14 rounded-xl' />
        ))}
      </div>
    );

  if (error)
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>Failed to load curriculum</AlertDescription>
      </Alert>
    );

  return (
    <div className='space-y-6'>
      {/* JSON Import */}
      <JsonImportPanel onImport={(imported) => update(imported)} />

      {/* Topics */}
      <div className='space-y-3'>
        {localTopics.length === 0 && (
          <Card className='p-8 text-center'>
            <p className='text-muted-foreground'>
              No topics yet. Import JSON or add one below.
            </p>
          </Card>
        )}
        {localTopics.map((topic, idx) => (
          <TopicBlock
            key={idx}
            topic={topic}
            topicIndex={idx}
            total={localTopics.length}
            onChange={(t) => {
              const arr = [...localTopics];
              arr[idx] = t;
              update(arr);
            }}
            onDelete={() => update(localTopics.filter((_, i) => i !== idx))}
            onMoveUp={() => moveTopic(idx, -1)}
            onMoveDown={() => moveTopic(idx, 1)}
          />
        ))}

        <Button
          variant='outline'
          className='w-full gap-2'
          onClick={() =>
            update([
              ...localTopics,
              {
                title: { en: 'New Topic', ar: 'موضوع جديد' },
                elements: [],
              },
            ])
          }>
          <Plus className='h-4 w-4' /> Add Topic
        </Button>
      </div>

      {/* Save / Discard */}
      {dirty && (
        <div className='flex items-center justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background py-4'>
          <Button
            variant='outline'
            className='gap-2'
            onClick={() => {
              setTopics(null);
              setDirty(false);
            }}>
            <RotateCcw className='h-4 w-4' /> Discard
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className='gap-2'>
            <Save className='h-4 w-4' />{' '}
            {save.isPending ? 'Saving...' : 'Save Curriculum'}
          </Button>
        </div>
      )}
    </div>
  );
}
