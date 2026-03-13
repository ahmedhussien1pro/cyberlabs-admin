// src/features/courses/pages/course-create.page.tsx
import { useRef, useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast }            from 'sonner';
import { useTranslation }   from 'react-i18next';
import {
  ArrowLeft, Plus, Loader2, BookOpen, Layers, Save,
  ChevronUp, ChevronDown, Trash2, FolderOpen,
  PanelLeftClose, PanelLeftOpen, User, Search,
  Upload, FileJson, X, AlertCircle, CheckCircle2,
  GlobeIcon,
} from 'lucide-react';
import { Button }         from '@/components/ui/button';
import { coursesApi }     from '../services/courses.api';
import { usersService }   from '@/core/api/services';
import { ROUTES }         from '@/shared/constants';
import type { CourseCreateDto } from '../types/course.types';
import CourseInfoForm, { DEFAULT_INFO } from '../components/content-editor/CourseInfoForm';
import type { CourseInfoData }  from '../components/content-editor/CourseInfoForm';
import TopicEditor              from '../components/content-editor/TopicEditor';
import type { Topic }           from '../components/content-editor/TopicEditor';
import {
  COURSE_DIFFICULTIES,
  COURSE_ACCESSES,
  COURSE_COLORS,
  COURSE_CONTENT_TYPES,
  COURSE_CATEGORIES,
  COURSE_STATES,
  enumLabel,
} from '../constants/course-enums';

// ─── Slug helper ────────────────────────────────────────────────────────────
function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type ActiveView = 'course-info' | 'topic';

// ─── JSON Import types ───────────────────────────────────────────────────────
interface ImportPreview {
  topics:       Topic[];
  landingData?: CourseInfoData;
  meta?: Partial<{
    title: string; ar_title: string; slug: string;
    description: string; difficulty: string;
    access: string; color: string; contentType: string; category: string;
  }>;
  topicCount:   number;
  elementCount: number;
  warnings:     string[];
}

function normalizeImportedTopics(raw: any[]): { topics: Topic[]; warnings: string[] } {
  const warnings: string[] = [];
  const topics: Topic[] = raw
    .map((t: any, ti: number) => {
      if (!t || typeof t !== 'object') {
        warnings.push(`Topic ${ti + 1}: invalid format, skipped`);
        return null as any;
      }
      const title =
        typeof t.title === 'object'
          ? { en: t.title?.en ?? '', ar: t.title?.ar ?? '' }
          : { en: String(t.title ?? `Topic ${ti + 1}`), ar: '' };

      const elements = Array.isArray(t.elements)
        ? t.elements
            .map((el: any, ei: number) => {
              if (!el?.type) {
                warnings.push(`Topic ${ti + 1}, Element ${ei + 1}: missing type`);
                return null;
              }
              return { ...el, id: el.id ?? Date.now() + Math.random() };
            })
            .filter(Boolean)
        : [];

      return { id: t.id ?? `imported-${ti}-${Date.now()}`, title, elements };
    })
    .filter(Boolean);

  return { topics, warnings };
}

function parseJsonFile(content: string): ImportPreview {
  const parsed = JSON.parse(content);
  const warnings: string[] = [];

  let rawTopics: any[]          = [];
  let meta: ImportPreview['meta']          = {};
  let landingData: ImportPreview['landingData'] | undefined;

  if (Array.isArray(parsed)) {
    rawTopics = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (parsed.landingData && typeof parsed.landingData === 'object') {
      landingData = parsed.landingData as CourseInfoData;
      const ld = parsed.landingData;
      const enTitle = typeof ld.title === 'object' ? ld.title.en : ld.title;
      const arTitle = typeof ld.title === 'object' ? ld.title.ar : '';
      if (enTitle) meta = { ...meta, title: enTitle, ar_title: arTitle ?? '' };
    }
    if (Array.isArray(parsed.topics)) {
      rawTopics = parsed.topics;
    } else if (Array.isArray(parsed.curriculum)) {
      rawTopics = parsed.curriculum;
    } else {
      warnings.push('No "topics" or "curriculum" array found — treating file as single topic');
      rawTopics = [parsed];
    }
    const m = parsed.meta ?? parsed.course ?? parsed.metadata ?? {};
    if (m.title || m.slug) meta = { ...meta, ...m };
  }

  const { topics, warnings: tw } = normalizeImportedTopics(rawTopics);
  const elementCount = topics.reduce((s, t) => s + t.elements.length, 0);

  return {
    topics,
    landingData,
    meta: Object.keys(meta ?? {}).length ? meta : undefined,
    topicCount:   topics.length,
    elementCount,
    warnings: [...warnings, ...tw],
  };
}

// ─── JSON Import Modal ───────────────────────────────────────────────────────
function JsonImportModal({
  onImport,
  onClose,
}: {
  onImport: (preview: ImportPreview) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('courses');
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview,    setPreview]   = useState<ImportPreview | null>(null);
  const [error,      setError]     = useState<string | null>(null);
  const [fileName,   setFileName]  = useState('');
  const [applyMeta,  setApplyMeta] = useState(true);
  const [mode,       setMode]      = useState<'replace' | 'append'>('replace');

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) { setError('Only .json files are supported'); return; }
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const p = parseJsonFile(e.target!.result as string);
        if (p.topicCount === 0) { setError('No valid topics found in this file'); return; }
        setPreview(p);
      } catch (err: any) {
        setError(`JSON parse error: ${err?.message ?? 'invalid JSON'}`);
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    if (!preview) return;
    onImport({
      ...preview,
      meta:        applyMeta ? preview.meta        : undefined,
      landingData: applyMeta ? preview.landingData : undefined,
      topics: preview.topics.map((tp) => ({ ...tp, _importMode: mode }) as any),
    });
    onClose();
  };

  const hasLandingData = !!preview?.landingData;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-xl border bg-card shadow-2xl'>
        <div className='flex items-center justify-between px-5 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <FileJson size={18} className='text-primary' />
            <span className='font-semibold text-sm'>{t('importJson')}</span>
          </div>
          <button className='p-1 rounded hover:bg-muted' onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className='p-5 space-y-4'>
          <label
            className='flex flex-col items-center justify-center gap-3 w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-all'
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}>
            <input ref={fileRef} type='file' accept='.json' className='hidden'
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Upload size={22} className='text-muted-foreground' />
            <div className='text-center'>
              <p className='text-sm font-medium'>
                {fileName || 'Drop .json file here or click to browse'}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Supports: topics array, curriculum object, or full course export
              </p>
            </div>
          </label>

          {error && (
            <div className='flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400'>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {preview && (
            <div className='space-y-3'>
              <div className='rounded-md border bg-muted/20 p-3 space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium text-emerald-400'>
                  <CheckCircle2 size={14} /> File parsed successfully
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='rounded border bg-background px-3 py-2'>
                    <span className='text-muted-foreground'>Topics</span>
                    <p className='text-lg font-bold mt-0.5'>{preview.topicCount}</p>
                  </div>
                  <div className='rounded border bg-background px-3 py-2'>
                    <span className='text-muted-foreground'>Elements</span>
                    <p className='text-lg font-bold mt-0.5'>{preview.elementCount}</p>
                  </div>
                </div>

                {hasLandingData && (
                  <div className='flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1'>
                    <GlobeIcon size={11} />
                    Landing page data detected — will be applied automatically
                  </div>
                )}

                <ul className='space-y-0.5 max-h-24 overflow-y-auto'>
                  {preview.topics.map((tp, i) => (
                    <li key={i} className='flex items-center gap-2 text-xs px-1'>
                      <Layers size={10} className='text-muted-foreground flex-shrink-0' />
                      <span className='truncate'>{tp.title.en || `Topic ${i + 1}`}</span>
                      <span className='ml-auto text-muted-foreground'>{tp.elements.length} el.</span>
                    </li>
                  ))}
                </ul>
              </div>

              {preview.warnings.length > 0 && (
                <div className='rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 space-y-1'>
                  <p className='text-xs font-medium text-yellow-400'>Warnings ({preview.warnings.length})</p>
                  {preview.warnings.map((w, i) => (
                    <p key={i} className='text-xs text-yellow-300/80'>• {w}</p>
                  ))}
                </div>
              )}

              <div className='space-y-2'>
                <div className='flex gap-2'>
                  {(['replace', 'append'] as const).map((m) => (
                    <button key={m} type='button' onClick={() => setMode(m)}
                      className={`flex-1 py-1.5 rounded-md text-xs border font-medium transition-colors ${
                        mode === m ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                      }`}>
                      {m === 'replace' ? 'Replace existing topics' : 'Append to existing'}
                    </button>
                  ))}
                </div>
                {(preview.meta || hasLandingData) && (
                  <label className='flex items-center gap-2 text-xs cursor-pointer'>
                    <input type='checkbox' checked={applyMeta}
                      onChange={(e) => setApplyMeta(e.target.checked)} />
                    Apply course metadata &amp; landing data from file
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 px-5 py-3 border-t'>
          <Button variant='ghost' size='sm' onClick={onClose}>Cancel</Button>
          <Button size='sm' disabled={!preview} onClick={handleConfirm} className='gap-1'>
            <Upload size={13} />
            Import{preview ? ` ${preview.topicCount} topic${preview.topicCount !== 1 ? 's' : ''}` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Instructor Picker ───────────────────────────────────────────────────────
function InstructorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, name: string) => void;
}) {
  const { t } = useTranslation('courses');
  const [search, setSearch]           = useState('');
  const [open,   setOpen]             = useState(false);
  const [selectedName, setSelectedName] = useState('');

  const { data: adminData } = useQuery({
    queryKey: ['users', 'instructors', 'ADMIN'],
    queryFn:  () => usersService.getAll({ page: 1, limit: 100, role: 'ADMIN' as any }),
  });
  const { data: instructorData } = useQuery({
    queryKey: ['users', 'instructors', 'INSTRUCTOR'],
    queryFn:  () => usersService.getAll({ page: 1, limit: 100, role: 'INSTRUCTOR' as any }),
  });

  const allUsers = [
    ...(adminData?.data ?? []),
    ...(instructorData?.data ?? []),
  ].filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

  const filtered = allUsers.filter((u) => {
    const user = u as any;
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''} ${user.email ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleSelect = (u: any) => {
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
    onChange(u.id, name);
    setSelectedName(name);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className='relative'>
      <label className='text-xs text-muted-foreground mb-1 block'>{t('form.instructor')}</label>
      <button type='button'
        className='w-full flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-left hover:bg-muted/30 transition-colors'
        onClick={() => setOpen((v) => !v)}>
        <User size={14} className='text-muted-foreground flex-shrink-0' />
        <span className={selectedName ? '' : 'text-muted-foreground'}>
          {selectedName || t('form.selectInstructor')}
        </span>
        {value && (
          <span className='ml-auto text-xs font-mono text-muted-foreground truncate max-w-[120px]'>
            {value.slice(0, 8)}...
          </span>
        )}
      </button>

      {open && (
        <div className='absolute z-50 mt-1 w-full rounded-md border bg-card shadow-lg'>
          <div className='p-2 border-b'>
            <div className='flex items-center gap-2 px-2 py-1 rounded border bg-background'>
              <Search size={12} className='text-muted-foreground' />
              <input autoFocus className='flex-1 bg-transparent text-sm outline-none'
                placeholder='Search by name or email...'
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <ul className='max-h-48 overflow-y-auto py-1'>
            {filtered.length === 0 ? (
              <li className='px-4 py-3 text-xs text-muted-foreground text-center'>No users found</li>
            ) : (
              filtered.map((u: any) => (
                <li key={u.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                    u.id === value ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => handleSelect(u)}>
                  <div className='w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0'>
                    {(u.firstName?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'No name'}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>{u.email}</p>
                  </div>
                  <span className='ml-auto text-xs bg-muted px-1.5 py-0.5 rounded flex-shrink-0'>{u.role}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── State badge colours ─────────────────────────────────────────────────────
const STATE_STYLES: Record<string, string> = {
  PUBLISHED:   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  DRAFT:       'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  COMING_SOON: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

// ─── Helper: strip UI-only keys before sending topics to backend ───────────────
function cleanTopicsForApi(topics: Topic[]): object[] {
  return topics.map(({ id, title, elements }) => ({ id, title, elements }));
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CourseCreatePage() {
  const navigate        = useNavigate();
  const { t }           = useTranslation('courses');

  const [sidebarCollapsed,   setSidebarCollapsed]   = useState(false);
  const [activeView,         setActiveView]          = useState<ActiveView>('course-info');
  const [currentTopicIndex,  setCurrentTopicIndex]   = useState(-1);
  const [showImport,         setShowImport]          = useState(false);

  const [meta, setMeta] = useState({
    title:         '',
    ar_title:      '',
    slug:          '',
    description:   '',
    difficulty:    'BEGINNER' as (typeof COURSE_DIFFICULTIES)[number],
    access:        'FREE'     as (typeof COURSE_ACCESSES)[number],
    category:      'FUNDAMENTALS' as (typeof COURSE_CATEGORIES)[number],
    color:         'BLUE'     as (typeof COURSE_COLORS)[number],
    contentType:   'MIXED'    as (typeof COURSE_CONTENT_TYPES)[number],
    state:         'DRAFT'    as (typeof COURSE_STATES)[number],
    instructorId:  '',
    instructorName: '',
  });

  const setMeta_          = (k: string, v: string) => setMeta((f) => ({ ...f, [k]: v }));
  const handleTitleChange = (v: string) =>
    setMeta((f) => ({
      ...f,
      title: v,
      slug:  f.slug === slugify(f.title) || f.slug === '' ? slugify(v) : f.slug,
    }));

  const [courseInfo,        setCourseInfo]        = useState<CourseInfoData>({ ...DEFAULT_INFO });
  const [topics,            setTopics]            = useState<Topic[]>([]);
  const [imageMap,          setImageMap]          = useState<Record<string, string>>({});
  const [createdCourseId,   setCreatedCourseId]   = useState<string | null>(null);
  const [createdCourseSlug, setCreatedCourseSlug] = useState<string | null>(null);

  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setImageMap((m) => ({ ...m, [key]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleImport = (preview: ImportPreview) => {
    const isAppend   = (preview.topics[0] as any)?._importMode === 'append';
    const cleanTopics = preview.topics.map(({ _importMode, ...tp }: any) => tp as Topic);

    if (isAppend) {
      setTopics((prev) => [...prev, ...cleanTopics]);
      toast.success(`Appended ${cleanTopics.length} topics`);
    } else {
      setTopics(cleanTopics);
      toast.success(`Imported ${cleanTopics.length} topics`);
    }

    if (preview.landingData) {
      setCourseInfo(preview.landingData);
      toast.info('Landing page content loaded from JSON');
    }

    if (preview.meta) {
      setMeta((f) => ({
        ...f,
        title:       preview.meta!.title       ?? f.title,
        ar_title:    preview.meta!.ar_title    ?? f.ar_title,
        slug:        preview.meta!.slug        ?? f.slug,
        description: preview.meta!.description ?? f.description,
        difficulty:  (preview.meta!.difficulty  as any) ?? f.difficulty,
        access:      (preview.meta!.access      as any) ?? f.access,
        color:       (preview.meta!.color       as any) ?? f.color,
        contentType: (preview.meta!.contentType as any) ?? f.contentType,
        category:    (preview.meta!.category    as any) ?? f.category,
      }));
      toast.info('Course metadata applied from JSON');
    }

    if (cleanTopics.length > 0) {
      setCurrentTopicIndex(isAppend ? topics.length : 0);
      setActiveView('topic');
    }
  };

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: { en: `Topic ${topics.length + 1}`, ar: `\u0645\u0648\u0636\u0648\u0639 ${topics.length + 1}` },
      elements: [],
    };
    setTopics((tp) => [...tp, newTopic]);
    setCurrentTopicIndex(topics.length);
    setActiveView('topic');
  };

  const handleDeleteTopic = (index: number) => {
    const topicTitle = topics[index]?.title.en || `Topic ${index + 1}`;
    toast(`Delete "${topicTitle}"?`, {
      description: 'All elements inside will be lost.',
      action: {
        label: 'Delete',
        onClick: () => {
          setTopics((tp) => tp.filter((_, i) => i !== index));
          if (currentTopicIndex === index) {
            setCurrentTopicIndex(-1); setActiveView('course-info');
          } else if (currentTopicIndex > index) setCurrentTopicIndex((i) => i - 1);
          toast.success('Topic deleted');
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const handleMoveTopic = (index: number, dir: 'up' | 'down') => {
    const ni = dir === 'up' ? index - 1 : index + 1;
    if (ni < 0 || ni >= topics.length) return;
    const nt = [...topics];
    [nt[index], nt[ni]] = [nt[ni], nt[index]];
    setTopics(nt);
    if (currentTopicIndex === index) setCurrentTopicIndex(ni);
    else if (currentTopicIndex === ni) setCurrentTopicIndex(index);
  };

  const handleTopicChange = (updated: Topic) => {
    const nt = [...topics]; nt[currentTopicIndex] = updated; setTopics(nt);
  };

  const { mutate: createCourse, isPending: isCreating } = useMutation({
    mutationFn: (dto: CourseCreateDto) => coursesApi.create(dto),
    onSuccess: (course) => {
      setCreatedCourseId(course.id);
      setCreatedCourseSlug(course.slug);
      toast.success(t('toast.stateUpdated'), { description: `"${course.title}" created!` });
      setCourseInfo((c) => ({ ...c, title: { en: meta.title, ar: meta.ar_title } }));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' \u00b7 ') : msg);
    },
  });

  // ─── Save: topics via saveCurriculum (Sections+Lessons) ─────────────────
  // landingData (courseInfo) is frontend-only rich content — not persisted to DB here.
  // It travels inside the topics elements via the curriculum editor.
  const { mutate: saveCurriculum, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!createdCourseId) throw new Error('Create the course first');
      await coursesApi.saveCurriculum(createdCourseId, cleanTopicsForApi(topics));
    },
    onSuccess: () => toast.success('Content saved successfully!'),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to save';
      toast.error(Array.isArray(msg) ? msg.join(' \u00b7 ') : msg);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta.title.trim()) return toast.error('Title is required');
    if (!meta.slug.trim())  return toast.error('Slug is required');
    const dto: CourseCreateDto = {
      title:        meta.title.trim(),
      ar_title:     meta.ar_title.trim() || undefined,
      slug:         meta.slug.trim(),
      description:  meta.description.trim() || undefined,
      difficulty:   meta.difficulty,
      access:       meta.access,
      category:     meta.category,
      color:        meta.color,
      contentType:  meta.contentType,
      state:        meta.state as any,
      instructorId: meta.instructorId.trim(),
    };
    createCourse(dto);
  };

  const getTopBarTitle = () => {
    if (activeView === 'topic' && currentTopicIndex >= 0)
      return topics[currentTopicIndex]?.title.en || 'Topic';
    return t('form.createTitle');
  };

  const showTopicEditor = activeView === 'topic' && currentTopicIndex >= 0;
  const showCourseInfo  = activeView === 'course-info';

  const SELECT_FIELDS = [
    { key: 'difficulty', label: t('form.difficulty') ?? 'Difficulty', opts: COURSE_DIFFICULTIES },
    { key: 'access',     label: t('form.access')     ?? 'Access',     opts: COURSE_ACCESSES     },
    { key: 'color',      label: t('form.color')      ?? 'Color',      opts: COURSE_COLORS       },
    { key: 'contentType',label: t('form.contentType')?? 'Content Type', opts: COURSE_CONTENT_TYPES },
  ] as const;

  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden'>
      {showImport && (
        <JsonImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className={`flex-shrink-0 flex flex-col border-r bg-card transition-all duration-200 ${
        sidebarCollapsed ? 'w-12' : 'w-64'
      }`}>
        <div className='flex items-center justify-between px-3 py-3 border-b'>
          {!sidebarCollapsed && (
            <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
              Content Editor
            </span>
          )}
          <button className='p-1 rounded hover:bg-muted transition-colors ml-auto'
            onClick={() => setSidebarCollapsed((v) => !v)}>
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <nav className='p-2 space-y-1'>
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeView === 'course-info'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setActiveView('course-info')}>
                <BookOpen size={14} />
                <span>{t('form.createTitle')}</span>
                {!createdCourseId && (
                  <span className='ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-1.5 rounded'>Step 1</span>
                )}
              </button>

              <button
                className='w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                onClick={() => setShowImport(true)}>
                <FileJson size={14} />
                <span>{t('importJson')}</span>
                {topics.length > 0 && (
                  <span className='ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 rounded'>
                    {topics.length}
                  </span>
                )}
              </button>
            </nav>

            <div className='flex-1 overflow-y-auto'>
              <div className='flex items-center justify-between px-3 py-2'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs font-semibold text-muted-foreground'>TOPICS</span>
                  <span className='text-xs bg-muted px-1.5 py-0.5 rounded-full'>{topics.length}</span>
                </div>
                <button className='p-1 rounded hover:bg-muted transition-colors'
                  onClick={handleAddTopic} title='Add Topic'>
                  <Plus size={13} />
                </button>
              </div>

              {topics.length === 0 ? (
                <div className='px-4 py-6 text-center'>
                  <FolderOpen size={24} className='text-muted-foreground mx-auto mb-1' />
                  <p className='text-xs text-muted-foreground'>No topics yet.</p>
                  <button className='mt-2 flex items-center gap-1 text-xs text-primary mx-auto'
                    onClick={() => setShowImport(true)}>
                    <Upload size={11} /> Import from JSON
                  </button>
                </div>
              ) : (
                <ul className='space-y-0.5 px-2'>
                  {topics.map((topic, i) => (
                    <li key={topic.id}>
                      <div
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
                          currentTopicIndex === i && activeView === 'topic'
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => { setCurrentTopicIndex(i); setActiveView('topic'); }}>
                        <Layers size={12} className='flex-shrink-0 text-muted-foreground' />
                        <span className='text-xs flex-1 truncate'>{topic.title.en || `Topic ${i + 1}`}</span>
                        <span className='text-xs text-muted-foreground flex-shrink-0'>{topic.elements.length}</span>
                        <div className='hidden group-hover:flex items-center gap-0.5'>
                          <button className='p-0.5 rounded hover:bg-muted-foreground/20 disabled:opacity-30'
                            disabled={i === 0}
                            onClick={(e) => { e.stopPropagation(); handleMoveTopic(i, 'up'); }}>
                            <ChevronUp size={10} />
                          </button>
                          <button className='p-0.5 rounded hover:bg-muted-foreground/20 disabled:opacity-30'
                            disabled={i === topics.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMoveTopic(i, 'down'); }}>
                            <ChevronDown size={10} />
                          </button>
                          <button className='p-0.5 rounded hover:bg-destructive/20 text-destructive'
                            onClick={(e) => { e.stopPropagation(); handleDeleteTopic(i); }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='p-3 border-t space-y-2'>
              {createdCourseId && (
                <Button size='sm' className='w-full gap-2'
                  onClick={() => saveCurriculum()} disabled={isSaving}>
                  {isSaving ? <Loader2 size={13} className='animate-spin' /> : <Save size={13} />}
                  Save Content
                </Button>
              )}
              {createdCourseSlug && (
                <Button size='sm' variant='outline' className='w-full gap-1 text-xs'
                  onClick={() => navigate(`/courses/${createdCourseSlug}/edit`)}>
                  Open in Editor
                </Button>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-3 border-b bg-card shrink-0'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' className='gap-1'
              onClick={() => navigate(ROUTES.COURSES)}>
              <ArrowLeft size={14} /> Back
            </Button>
            <div className='h-4 w-px bg-border' />
            <span className='text-sm font-medium'>{getTopBarTitle()}</span>
            {createdCourseId && (
              <span className={`text-xs border rounded-full px-2 py-0.5 ${
                STATE_STYLES[meta.state] ?? STATE_STYLES.DRAFT
              }`}>
                {enumLabel(meta.state)} ✓
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' className='gap-1.5'
              onClick={() => setShowImport(true)}>
              <FileJson size={13} /> {t('importJson')}
            </Button>
            {createdCourseId ? (
              <Button size='sm' className='gap-2'
                onClick={() => saveCurriculum()} disabled={isSaving}>
                {isSaving ? <Loader2 size={13} className='animate-spin' /> : <Save size={13} />}
                Save Content
              </Button>
            ) : (
              <span className='text-xs text-muted-foreground'>
                Fill info → Create → Add Topics
              </span>
            )}
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-4xl mx-auto px-6 py-6 space-y-6'>

            {showCourseInfo && (
              <>
                {!createdCourseId && (
                  <div className='rounded-xl border bg-card p-6 space-y-5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground'>1</div>
                      <h2 className='text-sm font-semibold'>{t('form.createTitle')}</h2>
                      <span className='text-xs text-muted-foreground'>— Define course metadata first</span>
                    </div>

                    <form onSubmit={handleCreateSubmit} className='space-y-4'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                          <label className='text-xs text-muted-foreground mb-1 block'>{t('form.title')} (EN) *</label>
                          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                            placeholder='e.g., Web Application Hacking'
                            value={meta.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            required />
                        </div>
                        <div>
                          <label className='text-xs text-muted-foreground mb-1 block'>{t('form.title')} (AR)</label>
                          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                            dir='rtl' placeholder='العنوان بالعربي'
                            value={meta.ar_title}
                            onChange={(e) => setMeta_('ar_title', e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label className='text-xs text-muted-foreground mb-1 block'>{t('form.slug')} *</label>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground font-mono'>courses/</span>
                          <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono'
                            placeholder='web-application-hacking'
                            value={meta.slug}
                            onChange={(e) => setMeta_('slug', slugify(e.target.value))}
                            required />
                        </div>
                      </div>

                      <div>
                        <label className='text-xs text-muted-foreground mb-1 block'>{t('form.description')}</label>
                        <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                          rows={2} placeholder='Short description...'
                          value={meta.description}
                          onChange={(e) => setMeta_('description', e.target.value)} />
                      </div>

                      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                        {SELECT_FIELDS.map(({ key, label, opts }) => (
                          <div key={key}>
                            <label className='text-xs text-muted-foreground mb-1 block'>{label}</label>
                            <select className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                              value={(meta as any)[key]}
                              onChange={(e) => setMeta_(key, e.target.value)}>
                              {(opts as readonly string[]).map((o) => (
                                <option key={o} value={o}>{enumLabel(o)}</option>
                              ))}
                            </select>
                          </div>
                        ))}

                        <div>
                          <label className='text-xs text-muted-foreground mb-1 block'>{t('form.state')}</label>
                          <select className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                            value={meta.state}
                            onChange={(e) => setMeta_('state', e.target.value)}>
                            {COURSE_STATES.map((s) => (
                              <option key={s} value={s}>{t(`state.${s}`)}</option>
                            ))}
                          </select>
                        </div>

                        <div className='col-span-2'>
                          <label className='text-xs text-muted-foreground mb-1 block'>{t('form.category')}</label>
                          <select className='w-full rounded-md border bg-background px-3 py-2 text-sm'
                            value={meta.category}
                            onChange={(e) => setMeta_('category', e.target.value)}>
                            {COURSE_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{enumLabel(c)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <InstructorPicker
                        value={meta.instructorId}
                        onChange={(id, name) =>
                          setMeta((f) => ({ ...f, instructorId: id, instructorName: name }))
                        }
                      />

                      <div className='flex justify-end pt-2'>
                        <Button type='submit' disabled={isCreating} className='gap-2'>
                          {isCreating ? (
                            <><Loader2 size={14} className='animate-spin' /> Creating...</>
                          ) : (
                            <><Plus size={14} /> {t('form.createCourse')}</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {createdCourseId && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground'>2</div>
                      <h2 className='text-sm font-semibold'>Landing Page Content</h2>
                      <span className='text-xs text-muted-foreground'>— Preview only, saved with curriculum topics</span>
                    </div>
                    <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />
                  </div>
                )}
              </>
            )}

            {showTopicEditor && (
              <TopicEditor
                topic={topics[currentTopicIndex]}
                topicIndex={currentTopicIndex}
                onTopicChange={handleTopicChange}
                imageMap={imageMap}
                onImageUpload={handleImageUpload}
              />
            )}

            {activeView === 'topic' && currentTopicIndex < 0 && (
              <div className='rounded-xl border border-dashed p-16 text-center'>
                <Layers size={32} className='text-muted-foreground mx-auto mb-3' />
                <p className='text-sm text-muted-foreground'>Select a topic from the sidebar or add a new one.</p>
                <div className='flex items-center justify-center gap-2 mt-4'>
                  <Button size='sm' className='gap-1' onClick={handleAddTopic}>
                    <Plus size={13} /> Add Topic
                  </Button>
                  <Button size='sm' variant='outline' className='gap-1' onClick={() => setShowImport(true)}>
                    <FileJson size={13} /> {t('importJson')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
