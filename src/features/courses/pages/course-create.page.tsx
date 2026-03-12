// src/features/courses/pages/course-create.page.tsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Loader2, BookOpen, Layers, Save,
  ChevronUp, ChevronDown, Trash2, FolderOpen, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coursesApi } from '../services/courses.api';
import { ROUTES } from '@/shared/constants';
import type { CourseCreateDto } from '../types/course.types';
import CourseInfoForm, { CourseInfoData, DEFAULT_INFO } from '../components/content-editor/CourseInfoForm';
import TopicEditor, { Topic } from '../components/content-editor/TopicEditor';
import Swal from 'sweetalert2';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
const ACCESSES = ['FREE', 'PRO', 'PREMIUM'] as const;
const COLORS = ['BLUE', 'EMERALD', 'VIOLET', 'ORANGE', 'ROSE', 'CYAN'] as const;
const CONTENT_TYPES = ['MIXED', 'PRACTICAL', 'THEORETICAL'] as const;
const CATEGORIES = [
  'FUNDAMENTALS', 'WEB_SECURITY', 'PENETRATION_TESTING', 'MALWARE_ANALYSIS',
  'CLOUD_SECURITY', 'CRYPTOGRAPHY', 'NETWORK_SECURITY',
  'TOOLS_AND_TECHNIQUES', 'CAREER_AND_INDUSTRY',
] as const;

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type ActiveView = 'course-info' | 'topic';

export default function CourseCreatePage() {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // View
  const [activeView, setActiveView] = useState<ActiveView>('course-info');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(-1);

  // Course meta (for creation)
  const [meta, setMeta] = useState({
    title: '', ar_title: '', slug: '', description: '',
    difficulty: 'BEGINNER' as typeof DIFFICULTIES[number],
    access: 'FREE' as typeof ACCESSES[number],
    category: 'FUNDAMENTALS' as typeof CATEGORIES[number],
    color: 'BLUE' as typeof COLORS[number],
    contentType: 'MIXED' as typeof CONTENT_TYPES[number],
    instructorId: '',
  });
  const setMeta_ = (k: string, v: string) => setMeta((f) => ({ ...f, [k]: v }));
  const handleTitleChange = (v: string) => setMeta((f) => ({
    ...f, title: v, slug: f.slug === slugify(f.title) || f.slug === '' ? slugify(v) : f.slug,
  }));

  // Content data
  const [courseInfo, setCourseInfo] = useState<CourseInfoData>({ ...DEFAULT_INFO });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // Created course id (after first save)
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [createdCourseSlug, setCreatedCourseSlug] = useState<string | null>(null);

  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setImageMap((m) => ({ ...m, [key]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: { en: `Topic ${topics.length + 1}`, ar: `موضوع ${topics.length + 1}` },
      elements: [],
    };
    setTopics((t) => [...t, newTopic]);
    setCurrentTopicIndex(topics.length);
    setActiveView('topic');
  };

  const handleDeleteTopic = async (index: number) => {
    const res = await Swal.fire({
      title: 'Delete Topic?', text: 'All elements inside will be lost!',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
    });
    if (!res.isConfirmed) return;
    setTopics((t) => t.filter((_, i) => i !== index));
    if (currentTopicIndex === index) { setCurrentTopicIndex(-1); setActiveView('course-info'); }
    else if (currentTopicIndex > index) setCurrentTopicIndex((i) => i - 1);
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
    const nt = [...topics];
    nt[currentTopicIndex] = updated;
    setTopics(nt);
  };

  // Create course (step 1)
  const { mutate: createCourse, isPending: isCreating } = useMutation({
    mutationFn: (dto: CourseCreateDto) => coursesApi.create(dto),
    onSuccess: async (course) => {
      setCreatedCourseId(course.id);
      setCreatedCourseSlug(course.slug);
      toast.success(`Course "${course.title}" created! Now add content and save.`);
      // Auto-sync meta title to courseInfo
      setCourseInfo((c) => ({ ...c, title: { en: meta.title, ar: meta.ar_title } }));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create course';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  // Save curriculum (step 2)
  const { mutate: saveCurriculum, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!createdCourseId) throw new Error('Create the course first');
      return coursesApi.saveCurriculum(createdCourseId, topics.map((t) => ({
        ...t, landingData: courseInfo, imageMap,
      })));
    },
    onSuccess: () => {
      toast.success('Content saved successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to save';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meta.title.trim()) return toast.error('Title is required');
    if (!meta.slug.trim()) return toast.error('Slug is required');
    createCourse({
      title: meta.title.trim(),
      ar_title: meta.ar_title.trim() || undefined,
      slug: meta.slug.trim(),
      description: meta.description.trim() || undefined,
      difficulty: meta.difficulty,
      access: meta.access,
      category: meta.category,
      color: meta.color,
      contentType: meta.contentType,
      instructorId: meta.instructorId.trim() || 'default',
    });
  };

  const getTopBarTitle = () => {
    if (activeView === 'course-info') return 'Course Information';
    if (activeView === 'topic' && currentTopicIndex >= 0) return topics[currentTopicIndex]?.title.en || 'Topic';
    return 'New Course';
  };

  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden'>

      {/* ─── Sidebar ─── */}
      <aside className={`flex-shrink-0 flex flex-col border-r bg-card transition-all duration-200 ${sidebarCollapsed ? 'w-12' : 'w-60'}`}>
        {/* Sidebar Header */}
        <div className='flex items-center justify-between px-3 py-3 border-b'>
          {!sidebarCollapsed && <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Content Editor</span>}
          <button className='p-1 rounded hover:bg-muted transition-colors ml-auto' onClick={() => setSidebarCollapsed((v) => !v)}>
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Course Info Nav */}
            <nav className='p-2'>
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeView === 'course-info' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => { setActiveView('course-info'); }}>
                <BookOpen size={14} />
                <span>Course Information</span>
              </button>
            </nav>

            {/* Topics */}
            <div className='flex-1 overflow-y-auto'>
              <div className='flex items-center justify-between px-3 py-2'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs font-semibold text-muted-foreground'>TOPICS</span>
                  <span className='text-xs bg-muted px-1.5 py-0.5 rounded-full'>{topics.length}</span>
                </div>
                <button className='p-1 rounded hover:bg-muted transition-colors' onClick={handleAddTopic} title='Add Topic'>
                  <Plus size={13} />
                </button>
              </div>

              {topics.length === 0 ? (
                <div className='px-4 py-6 text-center'>
                  <FolderOpen size={24} className='text-muted-foreground mx-auto mb-1' />
                  <p className='text-xs text-muted-foreground'>No topics yet.<br />Click + to add one.</p>
                </div>
              ) : (
                <ul className='space-y-0.5 px-2'>
                  {topics.map((topic, i) => (
                    <li key={topic.id}>
                      <div
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${
                          currentTopicIndex === i && activeView === 'topic' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => { setCurrentTopicIndex(i); setActiveView('topic'); }}>
                        <Layers size={12} className='flex-shrink-0 text-muted-foreground' />
                        <span className='text-xs flex-1 truncate'>{topic.title.en || `Topic ${i + 1}`}</span>
                        <div className='hidden group-hover:flex items-center gap-0.5'>
                          <button className='p-0.5 rounded hover:bg-muted-foreground/20 disabled:opacity-30' disabled={i === 0} onClick={(e) => { e.stopPropagation(); handleMoveTopic(i, 'up'); }}><ChevronUp size={10} /></button>
                          <button className='p-0.5 rounded hover:bg-muted-foreground/20 disabled:opacity-30' disabled={i === topics.length - 1} onClick={(e) => { e.stopPropagation(); handleMoveTopic(i, 'down'); }}><ChevronDown size={10} /></button>
                          <button className='p-0.5 rounded hover:bg-destructive/20 text-destructive' onClick={(e) => { e.stopPropagation(); handleDeleteTopic(i); }}><Trash2 size={10} /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className='p-3 border-t space-y-2'>
              {createdCourseId ? (
                <Button size='sm' className='w-full gap-2' onClick={() => saveCurriculum()} disabled={isSaving}>
                  {isSaving ? <Loader2 size={13} className='animate-spin' /> : <Save size={13} />}
                  Save Content
                </Button>
              ) : null}
              {createdCourseSlug && (
                <Button size='sm' variant='outline' className='w-full gap-1 text-xs' onClick={() => navigate(`/courses/${createdCourseSlug}/edit`)}>
                  Open in Editor
                </Button>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ─── Main Area ─── */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Top bar */}
        <div className='flex items-center justify-between px-6 py-3 border-b bg-card shrink-0'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' className='gap-1' onClick={() => navigate(ROUTES.COURSES)}>
              <ArrowLeft size={14} /> Back
            </Button>
            <div className='h-4 w-px bg-border' />
            <span className='text-sm font-medium'>{getTopBarTitle()}</span>
            {createdCourseId && <span className='text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5'>Created ✓</span>}
          </div>
          <div className='flex items-center gap-2'>
            {!createdCourseId ? (
              <span className='text-xs text-muted-foreground'>Fill Course Info below → Create → Add Content</span>
            ) : (
              <Button size='sm' className='gap-2' onClick={() => saveCurriculum()} disabled={isSaving}>
                {isSaving ? <Loader2 size={13} className='animate-spin' /> : <Save size={13} />}
                Save Content
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-4xl mx-auto px-6 py-6 space-y-6'>

            {/* Step 1: Create Course (always visible until created) */}
            {!createdCourseId && (
              <div className='rounded-xl border bg-card p-6 space-y-5'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground'>1</div>
                  <h2 className='text-sm font-semibold'>Create Course</h2>
                  <span className='text-xs text-muted-foreground'>— Define course metadata first</span>
                </div>

                <form onSubmit={handleCreateSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>Title (EN) *</label>
                      <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='e.g., Web Application Hacking' value={meta.title} onChange={(e) => handleTitleChange(e.target.value)} required />
                    </div>
                    <div>
                      <label className='text-xs text-muted-foreground mb-1 block'>Title (AR)</label>
                      <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='العنوان بالعربي' value={meta.ar_title} onChange={(e) => setMeta_('ar_title', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>Slug *</label>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground font-mono'>courses/</span>
                      <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono' placeholder='web-application-hacking' value={meta.slug} onChange={(e) => setMeta_('slug', slugify(e.target.value))} required />
                    </div>
                  </div>

                  <div>
                    <label className='text-xs text-muted-foreground mb-1 block'>Description</label>
                    <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={2} placeholder='Short description...' value={meta.description} onChange={(e) => setMeta_('description', e.target.value)} />
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                    {[
                      { key: 'difficulty', label: 'Difficulty', opts: DIFFICULTIES },
                      { key: 'access', label: 'Access', opts: ACCESSES },
                      { key: 'color', label: 'Color', opts: COLORS },
                      { key: 'contentType', label: 'Content Type', opts: CONTENT_TYPES },
                    ].map(({ key, label, opts }) => (
                      <div key={key}>
                        <label className='text-xs text-muted-foreground mb-1 block'>{label}</label>
                        <select className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={(meta as any)[key]} onChange={(e) => setMeta_(key, e.target.value)}>
                          {opts.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                        </select>
                      </div>
                    ))}
                    <div className='col-span-2'>
                      <label className='text-xs text-muted-foreground mb-1 block'>Category</label>
                      <select className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={meta.category} onChange={(e) => setMeta_('category', e.target.value)}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className='flex justify-end pt-2'>
                    <Button type='submit' disabled={isCreating} className='gap-2'>
                      {isCreating ? <><Loader2 size={14} className='animate-spin' /> Creating...</> : <><Plus size={14} /> Create Course</>}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Content Editor (after course is created) */}
            {createdCourseId && (
              <>
                {activeView === 'course-info' && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground'>2</div>
                      <h2 className='text-sm font-semibold'>Landing Page Content</h2>
                    </div>
                    <CourseInfoForm courseInfo={courseInfo} onChange={setCourseInfo} />
                  </div>
                )}

                {activeView === 'topic' && currentTopicIndex >= 0 && (
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
                    <Button size='sm' className='mt-4 gap-1' onClick={handleAddTopic}><Plus size={13} /> Add Topic</Button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
