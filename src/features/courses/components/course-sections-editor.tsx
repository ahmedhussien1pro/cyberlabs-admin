// src/features/courses/components/course-sections-editor.tsx
// Sections -> Modules -> Lessons editor that saves via PUT /admin/courses/:id/curriculum
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/core/api/admin-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Save, BookOpen, FileText, Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Lesson = { id?: string; tempId?: string; title: string; order: number; content?: string; videoUrl?: string };
type Module = { id?: string; tempId?: string; title: string; order: number; type?: string; lessons: Lesson[] };
type Section = { id?: string; tempId?: string; title: string; order: number; modules: Module[] };

function uid() { return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function unwrap(res: any) {
  const raw = res?.status !== undefined && res?.data !== undefined ? res.data : res;
  return raw?.data ?? raw;
}

interface Props { courseId: string }

export function CourseSectionsEditor({ courseId }: Props) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules]   = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['admin', 'courses', courseId, 'detail-full'],
    queryFn: async () => {
      const res = await adminApiClient.get(`/admin/courses/${courseId}`);
      return unwrap(res);
    },
    enabled: !!courseId,
    onSuccess: (data: any) => {
      const raw = (data?.sections ?? []) as any[];
      setSections(
        raw.map((s: any, si: number) => ({
          id:      s.id,
          tempId:  s.id ?? uid(),
          title:   s.title ?? '',
          order:   s.order ?? si,
          modules: (s.modules ?? []).map((m: any, mi: number) => ({
            id:      m.id,
            tempId:  m.id ?? uid(),
            title:   m.title ?? '',
            order:   m.order ?? mi,
            type:    m.type ?? 'TEXT',
            lessons: (m.lessons ?? []).map((l: any, li: number) => ({
              id:       l.id,
              tempId:   l.id ?? uid(),
              title:    l.title ?? '',
              order:    l.order ?? li,
              content:  l.content ?? '',
              videoUrl: l.videoUrl ?? '',
            })),
          })),
        }))
      );
      setDirty(false);
    },
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      const payload = {
        sections: sections.map((s, si) => ({
          title: s.title,
          order: si,
          modules: (s.modules ?? []).map((m, mi) => ({
            title: m.title,
            order: mi,
            type:  m.type ?? 'TEXT',
            lessons: (m.lessons ?? []).map((l, li) => ({
              title:    l.title,
              order:    li,
              content:  l.content  || null,
              videoUrl: l.videoUrl || null,
            })),
          })),
        })),
      };
      const res = await adminApiClient.put(`/admin/courses/${courseId}/curriculum`, payload);
      return unwrap(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses', courseId] });
      setDirty(false);
      toast.success('Curriculum saved successfully');
    },
    onError: () => toast.error('Failed to save curriculum'),
  });

  const mark = () => setDirty(true);

  // ── Section ops ──
  const addSection = () => {
    const t = uid();
    setSections(prev => [...prev, { tempId: t, title: 'New Section', order: prev.length, modules: [] }]);
    setExpandedSections(s => new Set(s).add(t));
    mark();
  };
  const updateSection = (key: string, title: string) => {
    setSections(prev => prev.map(s => (s.tempId === key || s.id === key) ? { ...s, title } : s));
    mark();
  };
  const deleteSection = (key: string) => {
    setSections(prev => prev.filter(s => s.tempId !== key && s.id !== key));
    mark();
  };

  // ── Module ops ──
  const addModule = (sectionKey: string) => {
    const t = uid();
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return { ...s, modules: [...s.modules, { tempId: t, title: 'New Module', order: s.modules.length, type: 'TEXT', lessons: [] }] };
    }));
    setExpandedModules(m => new Set(m).add(t));
    mark();
  };
  const updateModule = (sectionKey: string, modKey: string, title: string) => {
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return { ...s, modules: s.modules.map(m => (m.tempId === modKey || m.id === modKey) ? { ...m, title } : m) };
    }));
    mark();
  };
  const deleteModule = (sectionKey: string, modKey: string) => {
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return { ...s, modules: s.modules.filter(m => m.tempId !== modKey && m.id !== modKey) };
    }));
    mark();
  };

  // ── Lesson ops ──
  const addLesson = (sectionKey: string, modKey: string) => {
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return {
        ...s, modules: s.modules.map(m => {
          if (m.tempId !== modKey && m.id !== modKey) return m;
          return { ...m, lessons: [...m.lessons, { tempId: uid(), title: 'New Lesson', order: m.lessons.length }] };
        })
      };
    }));
    mark();
  };
  const updateLesson = (sectionKey: string, modKey: string, lessonKey: string, patch: Partial<Lesson>) => {
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return {
        ...s, modules: s.modules.map(m => {
          if (m.tempId !== modKey && m.id !== modKey) return m;
          return {
            ...m, lessons: m.lessons.map(l =>
              (l.tempId === lessonKey || l.id === lessonKey) ? { ...l, ...patch } : l
            )
          };
        })
      };
    }));
    mark();
  };
  const deleteLesson = (sectionKey: string, modKey: string, lessonKey: string) => {
    setSections(prev => prev.map(s => {
      if (s.tempId !== sectionKey && s.id !== sectionKey) return s;
      return {
        ...s, modules: s.modules.map(m => {
          if (m.tempId !== modKey && m.id !== modKey) return m;
          return { ...m, lessons: m.lessons.filter(l => l.tempId !== lessonKey && l.id !== lessonKey) };
        })
      };
    }));
    mark();
  };

  const toggleSection = (key: string) =>
    setExpandedSections(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleModule = (key: string) =>
    setExpandedModules(m => { const n = new Set(m); n.has(key) ? n.delete(key) : n.add(key); return n; });

  if (isLoading)
    return (
      <div className='space-y-3'>
        {[1,2,3].map(i => <Skeleton key={i} className='h-16 rounded-lg' />)}
      </div>
    );

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {sections.length} section{sections.length !== 1 ? 's' : ''}
          {dirty && <span className='ml-2 text-yellow-400'>• Unsaved changes</span>}
        </p>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={addSection} className='gap-1.5'>
            <Plus className='h-3.5 w-3.5' /> Add Section
          </Button>
          <Button size='sm' onClick={() => save()} disabled={saving || !dirty} className='gap-1.5'>
            <Save className='h-3.5 w-3.5' />
            {saving ? 'Saving…' : 'Save Curriculum'}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {sections.length === 0 && (
        <Card className='p-12 text-center text-muted-foreground'>
          No sections yet. Click "Add Section" to start building the curriculum.
        </Card>
      )}

      {/* Sections */}
      {sections.map((section, si) => {
        const sKey = section.tempId ?? section.id!;
        const sExpanded = expandedSections.has(sKey);
        return (
          <Card key={sKey} className='overflow-hidden'>
            {/* Section Row */}
            <div
              className='flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors'
              onClick={() => toggleSection(sKey)}
            >
              <GripVertical className='h-4 w-4 text-muted-foreground/40 shrink-0' />
              <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                {si + 1}
              </span>
              <div className='flex-1 min-w-0' onClick={e => e.stopPropagation()}>
                <Input
                  value={section.title}
                  onChange={e => updateSection(sKey, e.target.value)}
                  className='h-7 border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0 focus-visible:bg-muted/30 rounded px-1'
                  placeholder='Section title'
                />
              </div>
              <Badge variant='outline' className='text-xs shrink-0'>
                {section.modules.length} module{section.modules.length !== 1 ? 's' : ''}
              </Badge>
              <button
                onClick={e => { e.stopPropagation(); deleteSection(sKey); }}
                className='shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
              {sExpanded
                ? <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
                : <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground' />}
            </div>

            {/* Modules */}
            {sExpanded && (
              <div className='border-t px-4 py-3 space-y-2 bg-muted/10'>
                {section.modules.map((mod, mi) => {
                  const mKey = mod.tempId ?? mod.id!;
                  const mExpanded = expandedModules.has(mKey);
                  return (
                    <div key={mKey} className='rounded-lg border bg-card overflow-hidden'>
                      {/* Module Row */}
                      <div
                        className='flex cursor-pointer items-center gap-2 px-3 py-2.5 hover:bg-muted/20 transition-colors'
                        onClick={() => toggleModule(mKey)}
                      >
                        <GripVertical className='h-3.5 w-3.5 text-muted-foreground/40 shrink-0' />
                        <BookOpen className='h-3.5 w-3.5 text-muted-foreground/60 shrink-0' />
                        <div className='flex-1 min-w-0' onClick={e => e.stopPropagation()}>
                          <Input
                            value={mod.title}
                            onChange={e => updateModule(sKey, mKey, e.target.value)}
                            className='h-6 border-0 bg-transparent p-0 text-xs font-medium focus-visible:ring-0 focus-visible:bg-muted/30 rounded px-1'
                            placeholder='Module title'
                          />
                        </div>
                        <Badge variant='outline' className='text-xs shrink-0'>
                          {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                        </Badge>
                        <button
                          onClick={e => { e.stopPropagation(); deleteModule(sKey, mKey); }}
                          className='shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                        {mExpanded
                          ? <ChevronDown className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
                          : <ChevronRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />}
                      </div>

                      {/* Lessons */}
                      {mExpanded && (
                        <div className='border-t px-3 py-2 space-y-2 bg-muted/5'>
                          {mod.lessons.map((lesson) => {
                            const lKey = lesson.tempId ?? lesson.id!;
                            return (
                              <div key={lKey} className='flex items-center gap-2 rounded border bg-card px-3 py-2'>
                                <FileText className='h-3 w-3 text-muted-foreground/50 shrink-0' />
                                <Input
                                  value={lesson.title}
                                  onChange={e => updateLesson(sKey, mKey, lKey, { title: e.target.value })}
                                  className='h-6 flex-1 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:bg-muted/20 rounded px-1'
                                  placeholder='Lesson title'
                                />
                                <Input
                                  value={lesson.videoUrl ?? ''}
                                  onChange={e => updateLesson(sKey, mKey, lKey, { videoUrl: e.target.value })}
                                  className='h-6 w-40 border-0 bg-transparent p-0 text-xs text-muted-foreground focus-visible:ring-0 focus-visible:bg-muted/20 rounded px-1'
                                  placeholder='Video URL'
                                />
                                <button
                                  onClick={() => deleteLesson(sKey, mKey, lKey)}
                                  className='shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                                >
                                  <Trash2 className='h-3 w-3' />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => addLesson(sKey, mKey)}
                            className='flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors'
                          >
                            <Plus className='h-3 w-3' /> Add Lesson
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Add Module button */}
                <button
                  onClick={() => addModule(sKey)}
                  className='flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors'
                >
                  <Plus className='h-3 w-3' /> Add Module
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
