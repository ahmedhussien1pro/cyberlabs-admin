// src/features/courses/components/edit-tabs/curriculum-tab.tsx
// ✅ No lbl() helper — uses lang / isAr exactly like course-preview-tab.tsx
// ✅ getText(v, lang) — same helper as CourseElementRenderer
// ✅ CourseElementRenderer used for element preview with correct lang
import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown, ChevronRight, ChevronUp,
  Save, RotateCcw, Upload, FileJson,
  AlertCircle, Edit2, Trash2, Plus,
  ImageIcon, Loader2, Check, X, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { adminCoursesApi } from '../../services/admin-courses.api';
import CourseElementRenderer from '../CourseElementRenderer';
import type { AdminCourse } from '../../types/admin-course.types';
import type { CourseElement } from '../CourseElementRenderer';

type Lang = 'en' | 'ar';

interface Props { course: AdminCourse; onSaved?: () => void; }

interface Element {
  id?: string | number;
  type: string;
  value?: { en: string; ar?: string } | string;
  imageUrl?: string;
  [key: string]: unknown;
}
interface Topic {
  id?: string;
  title: { en: string; ar: string };
  elements: Element[];
}

// ─ Same getText as CourseElementRenderer ─────────────────────────────────
function getText(v: { en: string; ar?: string | null } | string | undefined, lang: Lang): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return lang === 'ar' ? (v.ar ?? v.en) : v.en;
}

// ── JSON Import Panel ─────────────────────────────────────────────────────
function JsonImportPanel({
  onImport,
  lang,
}: {
  onImport: (topics: Topic[]) => void;
  lang: Lang;
}) {
  const isAr = lang === 'ar';
  const [pasteValue, setPasteValue] = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [open, setOpen]             = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parse = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const topics: Topic[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.topics)
          ? parsed.topics
          : (null as any);
      if (!topics) throw new Error('Expected array of topics or { topics: [...] }');
      setError(null);
      onImport(topics);
      setPasteValue('');
      setOpen(false);
      toast.success(
        isAr
          ? `تم استيراد ${topics.length} موضوع — احفظ لتثبيتها`
          : `Imported ${topics.length} topics — click Save to persist`,
      );
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
      <CardHeader className='cursor-pointer select-none' onClick={() => setOpen(!open)}>
        <CardTitle className='flex items-center justify-between text-sm'>
          <span className='flex items-center gap-2'>
            <FileJson className='h-4 w-4 text-primary' />
            {isAr ? 'استيراد JSON' : 'Import JSON'}
          </span>
          {open
            ? <ChevronDown className='h-4 w-4 text-muted-foreground' />
            : <ChevronRight className='h-4 w-4 text-muted-foreground' />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' className='gap-2 h-9'
              onClick={() => fileRef.current?.click()}>
              <Upload className='h-4 w-4' />
              {isAr ? 'اختر ملف JSON' : 'Choose .json file'}
            </Button>
            <input ref={fileRef} type='file' accept='.json' className='hidden' onChange={onFile} />
            <span className='text-xs text-muted-foreground'>
              {isAr ? 'أو ألصق JSON أدناه' : 'or paste JSON below'}
            </span>
          </div>
          <Textarea
            dir='ltr' rows={5}
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
              <FileJson className='h-4 w-4' />
              {isAr ? 'استيراد من النص' : 'Import from Paste'}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Image Upload Button ─────────────────────────────────────────────────────
function ImageUploadButton({
  currentUrl,
  onUploaded,
  isAr,
}: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  isAr: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminCoursesApi.uploadImage(file);
      onUploaded(url);
      toast.success(isAr ? 'تم رفع الصورة' : 'Image uploaded');
    } catch {
      toast.error(isAr ? 'فشل الرفع' : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-2'>
        <Button type='button' variant='outline' size='sm' className='gap-2 h-8 text-xs'
          disabled={uploading} onClick={() => ref.current?.click()}>
          {uploading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ImageIcon className='h-3.5 w-3.5' />}
          {uploading
            ? (isAr ? 'جاري الرفع…' : 'Uploading…')
            : (isAr ? 'رفع صورة' : 'Upload Image')}
        </Button>
        <input ref={ref} type='file' accept='image/*' className='hidden' onChange={handleFile} />
        {currentUrl && (
          <span className='text-[10px] text-emerald-500 flex items-center gap-1'>
            <Check className='h-3 w-3' />
            {isAr ? 'تم الرفع' : 'Uploaded'}
          </span>
        )}
      </div>
      {currentUrl && (
        <img src={currentUrl} alt=''
          className='h-24 rounded-lg border border-border object-contain bg-muted/20' />
      )}
    </div>
  );
}

// ── Element row ───────────────────────────────────────────────────────────
function ElementRow({
  el, lang, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  el: Element;
  lang: Lang;
  onUpdate: (el: Element) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isAr     = lang === 'ar';
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draft,   setDraft]   = useState('');

  const isImage    = el.type === 'image';
  const displayVal = getText(el.value as any, lang);

  const startEdit  = () => { setDraft(JSON.stringify(el, null, 2)); setEditing(true); setPreview(false); };
  const commitEdit = () => {
    try { onUpdate(JSON.parse(draft)); setEditing(false); }
    catch { toast.error(isAr ? 'JSON غير صحيح للعنصر' : 'Invalid JSON for element'); }
  };

  return (
    <div className='rounded-lg border border-border/40 bg-muted/20'>
      {/* header */}
      <div className='flex items-center gap-2 px-3 py-2'>
        <Badge variant='outline' className='shrink-0 font-mono text-[10px] text-primary border-primary/30'>
          {el.type}
        </Badge>
        {!editing && !preview && (
          <div className='flex-1 min-w-0'>
            {isImage && el.imageUrl ? (
              <img src={el.imageUrl as string} alt=''
                className='h-10 rounded border border-border/40 object-contain bg-muted/10' />
            ) : (
              <p className='text-xs text-muted-foreground line-clamp-1'>
                {displayVal || `(${el.type})`}
              </p>
            )}
          </div>
        )}
        {(editing || preview) && <div className='flex-1' />}
        <div className='flex shrink-0 items-center gap-0.5'>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0' disabled={isFirst} onClick={onMoveUp}>
            <ChevronUp className='h-3 w-3' />
          </Button>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0' disabled={isLast} onClick={onMoveDown}>
            <ChevronDown className='h-3 w-3' />
          </Button>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0'
            title={isAr ? 'معاينة' : 'Preview'}
            onClick={() => { setPreview(!preview); setEditing(false); }}>
            <Eye className='h-3 w-3' />
          </Button>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0' onClick={startEdit}>
            <Edit2 className='h-3 w-3' />
          </Button>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0 text-destructive hover:text-destructive' onClick={onDelete}>
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      </div>

      {/* edit mode */}
      {editing && (
        <div className='px-3 pb-3 space-y-2 border-t border-border/30 pt-2'>
          <textarea
            dir='ltr'
            className='w-full rounded border border-border bg-background px-2 py-1.5 text-xs font-mono resize-y min-h-[5rem]'
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          {isImage && (
            <ImageUploadButton
              isAr={isAr}
              currentUrl={el.imageUrl as string | undefined}
              onUploaded={(url) => {
                try { setDraft(JSON.stringify({ ...JSON.parse(draft), imageUrl: url }, null, 2)); }
                catch { /* keep */ }
              }}
            />
          )}
          <div className='flex gap-2'>
            <Button size='sm' className='h-7 gap-1 text-xs' onClick={commitEdit}>
              <Check className='h-3 w-3' /> {isAr ? 'تطبيق' : 'Apply'}
            </Button>
            <Button size='sm' variant='ghost' className='h-7 gap-1 text-xs' onClick={() => setEditing(false)}>
              <X className='h-3 w-3' /> {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* preview mode — CourseElementRenderer with lang */}
      {preview && (
        <div className='px-4 pb-4 border-t border-border/30 pt-3' dir={isAr ? 'rtl' : 'ltr'}>
          <CourseElementRenderer elements={[el as CourseElement]} lang={lang} />
        </div>
      )}
    </div>
  );
}

// ── TopicBlock ─────────────────────────────────────────────────────────────
function TopicBlock({
  topic, topicIndex, total, lang, onChange, onDelete, onMoveUp, onMoveDown,
}: {
  topic: Topic;
  topicIndex: number;
  total: number;
  lang: Lang;
  onChange: (t: Topic) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const isAr = lang === 'ar';
  const [open,         setOpen]         = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleEn,      setTitleEn]      = useState(topic.title?.en ?? '');
  const [titleAr,      setTitleAr]      = useState(topic.title?.ar ?? '');

  const commitTitle = () => {
    onChange({ ...topic, title: { en: titleEn.trim() || 'Untitled', ar: titleAr.trim() } });
    setEditingTitle(false);
  };

  const updateElement = (idx: number, el: Element) => {
    const els = [...topic.elements]; els[idx] = el;
    onChange({ ...topic, elements: els });
  };
  const deleteElement = (idx: number) =>
    onChange({ ...topic, elements: topic.elements.filter((_, i) => i !== idx) });
  const moveEl = (idx: number, dir: -1 | 1) => {
    const els = [...topic.elements];
    const to  = idx + dir;
    if (to < 0 || to >= els.length) return;
    [els[idx], els[to]] = [els[to], els[idx]];
    onChange({ ...topic, elements: els });
  };

  // ─ Exact same logic as TopicRow in course-preview-tab.tsx ─
  const titleText = lang === 'ar'
    ? topic.title.ar || topic.title.en || 'Untitled Topic'
    : topic.title.en || topic.title.ar || 'Untitled Topic';

  return (
    <div className='rounded-xl border border-border/60 bg-card overflow-hidden'>
      <div className='flex items-center gap-2 px-4 py-3 bg-muted/30'>
        <button className='shrink-0 text-muted-foreground' onClick={() => setOpen(!open)}>
          {open ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
        </button>

        {editingTitle ? (
          <div className='flex-1 flex flex-col gap-1.5 min-w-0'>
            <div className='flex gap-2'>
              <Input dir='ltr' value={titleEn} onChange={(e) => setTitleEn(e.target.value)}
                placeholder='Title EN' className='h-7 text-xs' autoFocus />
              <Input dir='rtl' value={titleAr} onChange={(e) => setTitleAr(e.target.value)}
                placeholder='عنوان AR' className='h-7 text-xs' />
            </div>
            <div className='flex gap-1.5'>
              <Button size='sm' className='h-6 text-xs gap-1 px-2' onClick={commitTitle}>
                <Check className='h-3 w-3' /> {isAr ? 'حفظ' : 'Save'}
              </Button>
              <Button size='sm' variant='ghost' className='h-6 text-xs gap-1 px-2'
                onClick={() => { setTitleEn(topic.title?.en ?? ''); setTitleAr(topic.title?.ar ?? ''); setEditingTitle(false); }}>
                <X className='h-3 w-3' /> {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        ) : (
          <button className='flex-1 text-start min-w-0' onClick={() => setOpen(!open)}>
            <span className='text-sm font-semibold truncate block'>
              {topicIndex + 1}. {titleText}
            </span>
          </button>
        )}

        <span className='text-xs text-muted-foreground shrink-0'>
          {topic.elements.length} {isAr ? 'عنصر' : 'elements'}
        </span>

        <div className='flex items-center gap-0.5 ms-1' onClick={(e) => e.stopPropagation()}>
          <Button variant='ghost' size='sm' className='h-7 w-7 p-0'
            onClick={() => setEditingTitle(!editingTitle)}>
            <Edit2 className='h-3.5 w-3.5' />
          </Button>
          <Button variant='ghost' size='sm' className='h-7 w-7 p-0'
            disabled={topicIndex === 0} onClick={onMoveUp}>
            <ChevronUp className='h-3.5 w-3.5' />
          </Button>
          <Button variant='ghost' size='sm' className='h-7 w-7 p-0'
            disabled={topicIndex === total - 1} onClick={onMoveDown}>
            <ChevronDown className='h-3.5 w-3.5' />
          </Button>
          <Button variant='ghost' size='sm' className='h-7 w-7 p-0 text-destructive hover:text-destructive'
            onClick={onDelete}>
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {open && (
        <div className='p-3 space-y-2'>
          {topic.elements.length === 0 && (
            <p className='text-center text-xs text-muted-foreground py-3'>
              {isAr ? 'لا يوجد عناصر بعد' : 'No elements yet'}
            </p>
          )}
          {topic.elements.map((el, idx) => (
            <ElementRow
              key={idx}
              el={el}
              lang={lang}
              isFirst={idx === 0}
              isLast={idx === topic.elements.length - 1}
              onUpdate={(updated) => updateElement(idx, updated)}
              onDelete={() => deleteElement(idx)}
              onMoveUp={() => moveEl(idx, -1)}
              onMoveDown={() => moveEl(idx, 1)}
            />
          ))}
          <div className='flex flex-wrap gap-2 pt-1'>
            {(['text', 'image', 'video', 'code', 'quiz', 'lab'] as const).map((type) => (
              <Button key={type} variant='outline' size='sm' className='h-7 gap-1 text-xs'
                onClick={() =>
                  onChange({
                    ...topic,
                    elements: [
                      ...topic.elements,
                      type === 'image'
                        ? { type, imageUrl: '', value: { en: '', ar: '' } }
                        : { type, value: { en: '', ar: '' } },
                    ],
                  })
                }>
                <Plus className='h-3 w-3' /> {type}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ CurriculumTab ══════════════════════════════════════════════════════════
export function CurriculumTab({ course, onSaved }: Props) {
  // ─ Same 3 lines as course-preview-tab.tsx ─
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'ar' ? 'ar' : 'en';
  const isAr = lang === 'ar';

  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [dirty,  setDirty]  = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'curriculum', course.id],
    queryFn:  () => adminCoursesApi.getCurriculum(course.id),
  });

  const serverTopics: Topic[] = (data?.topics as Topic[]) ?? [];
  const localTopics            = topics ?? serverTopics;

  const save = useMutation({
    mutationFn: () => adminCoursesApi.saveCurriculum(course.id, localTopics),
    onSuccess: () => {
      toast.success(isAr ? 'تم حفظ المنهج ✔' : 'Curriculum saved ✔');
      setDirty(false);
      setTopics(null);
      onSaved?.();
    },
    onError: () => toast.error(isAr ? 'فشل حفظ المنهج' : 'Failed to save curriculum'),
  });

  const update = (newTopics: Topic[]) => { setTopics(newTopics); setDirty(true); };

  const moveTopic = (idx: number, dir: -1 | 1) => {
    const arr = [...localTopics];
    const to  = idx + dir;
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
        <AlertDescription>
          {isAr ? 'فشل تحميل المنهج' : 'Failed to load curriculum'}
        </AlertDescription>
      </Alert>
    );

  return (
    <div className='space-y-6' dir={isAr ? 'rtl' : 'ltr'}>

      {/* Stats bar */}
      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
        <span>
          <span className='font-semibold text-foreground'>{localTopics.length}</span>
          {' '}{isAr ? 'موضوع' : 'topics'}
        </span>
        <span>
          <span className='font-semibold text-foreground'>
            {localTopics.reduce((s, t) => s + t.elements.length, 0)}
          </span>
          {' '}{isAr ? 'عنصر إجمالي' : 'elements total'}
        </span>
        {dirty && (
          <Badge variant='outline' className='text-amber-500 border-amber-500/40 bg-amber-500/5'>
            {isAr ? 'تغييرات غير محفوظة' : 'Unsaved changes'}
          </Badge>
        )}
      </div>

      <JsonImportPanel onImport={(imported) => update(imported)} lang={lang} />

      <div className='space-y-3'>
        {localTopics.length === 0 && (
          <Card className='p-8 text-center'>
            <p className='text-muted-foreground text-sm'>
              {isAr
                ? 'لا يوجد مواضيع. استورد JSON أو أضف موضوعاً أدناه.'
                : 'No topics yet. Import JSON or add one below.'}
            </p>
          </Card>
        )}

        {localTopics.map((topic, idx) => (
          <TopicBlock
            key={idx}
            topic={topic}
            topicIndex={idx}
            total={localTopics.length}
            lang={lang}
            onChange={(t) => { const arr = [...localTopics]; arr[idx] = t; update(arr); }}
            onDelete={() => update(localTopics.filter((_, i) => i !== idx))}
            onMoveUp={() => moveTopic(idx, -1)}
            onMoveDown={() => moveTopic(idx, 1)}
          />
        ))}

        <Button variant='outline' className='w-full gap-2'
          onClick={() =>
            update([
              ...localTopics,
              { title: { en: 'New Topic', ar: 'موضوع جديد' }, elements: [] },
            ])
          }>
          <Plus className='h-4 w-4' />
          {isAr ? 'إضافة موضوع' : 'Add Topic'}
        </Button>
      </div>

      {dirty && (
        <div className='flex items-center justify-end gap-3 border-t pt-4 sticky bottom-0 bg-background/95 backdrop-blur py-4'>
          <Button variant='outline' className='gap-2'
            onClick={() => { setTopics(null); setDirty(false); }}>
            <RotateCcw className='h-4 w-4' />
            {isAr ? 'تجاهل' : 'Discard'}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending} className='gap-2'>
            {save.isPending
              ? <Loader2 className='h-4 w-4 animate-spin' />
              : <Save className='h-4 w-4' />}
            {save.isPending
              ? (isAr ? 'جاري الحفظ…' : 'Saving…')
              : (isAr ? 'حفظ المنهج' : 'Save Curriculum')}
          </Button>
        </div>
      )}
    </div>
  );
}
