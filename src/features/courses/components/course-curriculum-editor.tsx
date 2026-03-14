// src/features/courses/components/course-curriculum-editor.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import type {
  CurriculumTopic,
  CurriculumElement,
  CurriculumElementType,
} from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ELEMENT_TYPES: CurriculumElementType[] = [
  'text', 'title', 'image', 'note', 'terminal',
  'table', 'orderedList', 'list', 'quiz', 'hr',
  'code', 'video', 'lab',
];

const ELEMENT_COLORS: Record<CurriculumElementType, string> = {
  text:        'bg-blue-500/10 text-blue-400',
  title:       'bg-purple-500/10 text-purple-400',
  image:       'bg-emerald-500/10 text-emerald-400',
  note:        'bg-yellow-500/10 text-yellow-400',
  terminal:    'bg-zinc-500/10 text-zinc-400',
  table:       'bg-orange-500/10 text-orange-400',
  orderedList: 'bg-cyan-500/10 text-cyan-400',
  list:        'bg-cyan-500/10 text-cyan-300',
  quiz:        'bg-rose-500/10 text-rose-400',
  hr:          'bg-muted text-muted-foreground',
  code:        'bg-green-500/10 text-green-400',
  video:       'bg-pink-500/10 text-pink-400',
  lab:         'bg-indigo-500/10 text-indigo-400',
};

interface CurriculumData {
  topics: CurriculumTopic[];
}

interface Props {
  courseId: string;
  courseSlug: string;
}

export function CourseCurriculumEditor({ courseId, courseSlug }: Props) {
  const queryClient = useQueryClient();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [localTopics, setLocalTopics] = useState<CurriculumTopic[] | null>(null);

  const { data, isLoading } = useQuery<CurriculumData>({
    queryKey: ['admin', 'curriculum', courseSlug],
    queryFn:  () => adminCoursesApi.getCurriculum(courseSlug) as Promise<CurriculumData>,
  });

  useEffect(() => {
    if (data?.topics && localTopics === null) {
      setLocalTopics(data.topics);
    }
  }, [data, localTopics]);

  const topics: CurriculumTopic[] = localTopics ?? data?.topics ?? [];

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => adminCoursesApi.saveCurriculum(courseId, topics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum', courseSlug] });
      toast.success('Curriculum saved');
    },
    onError: () => toast.error('Failed to save curriculum'),
  });

  const toggleTopic = (id: string) =>
    setExpandedTopics((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const addTopic = () => {
    const newTopic: CurriculumTopic = {
      id: `topic-${Date.now()}`,
      title: { en: 'New Topic', ar: 'موضوع جديد' },
      elements: [],
    };
    setLocalTopics([...topics, newTopic]);
    setExpandedTopics((s) => new Set(s).add(newTopic.id));
  };

  const updateTopic = (id: string, updates: Partial<CurriculumTopic>) =>
    setLocalTopics(topics.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  const deleteTopic = (id: string) =>
    setLocalTopics(topics.filter((t) => t.id !== id));

  const addElement = (topicId: string, type: CurriculumElementType) => {
    const newEl: CurriculumElement = {
      id: Date.now(),
      type,
      value: type !== 'hr' ? { en: '', ar: '' } : undefined,
    };
    setLocalTopics(
      topics.map((t) =>
        t.id === topicId ? { ...t, elements: [...t.elements, newEl] } : t,
      ),
    );
  };

  const updateElement = (
    topicId: string,
    elId: string | number,
    updates: Partial<CurriculumElement>,
  ) =>
    setLocalTopics(
      topics.map((t) =>
        t.id === topicId
          ? { ...t, elements: t.elements.map((e) => e.id === elId ? { ...e, ...updates } : e) }
          : t,
      ),
    );

  const deleteElement = (topicId: string, elId: string | number) =>
    setLocalTopics(
      topics.map((t) =>
        t.id === topicId
          ? { ...t, elements: t.elements.filter((e) => e.id !== elId) }
          : t,
      ),
    );

  if (isLoading)
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-lg' />
        ))}
      </div>
    );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>{topics.length} topics</p>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={addTopic} className='gap-1.5'>
            <Plus className='h-3.5 w-3.5' /> Add Topic
          </Button>
          <Button size='sm' onClick={() => save()} disabled={saving} className='gap-1.5'>
            <Save className='h-3.5 w-3.5' />{saving ? 'Saving...' : 'Save Curriculum'}
          </Button>
        </div>
      </div>

      {topics.length === 0 && (
        <Card className='p-12 text-center text-muted-foreground'>
          No topics yet. Click "Add Topic" to start building the curriculum.
        </Card>
      )}

      {topics.map((topic, ti) => (
        <Card key={topic.id} className='overflow-hidden'>
          <div
            className='flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors'
            onClick={() => toggleTopic(topic.id)}
          >
            <GripVertical className='h-4 w-4 text-muted-foreground/50 shrink-0' />
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
              {ti + 1}
            </span>
            <div className='flex-1 min-w-0'>
              <p className='font-medium truncate'>{topic.title.en || 'Untitled Topic'}</p>
              <p className='text-xs text-muted-foreground truncate' dir='rtl'>{topic.title.ar}</p>
            </div>
            <Badge variant='outline' className='text-xs shrink-0'>
              {topic.elements.length} elements
            </Badge>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTopic(topic.id); }}
              className='shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
            {expandedTopics.has(topic.id)
              ? <ChevronDown className='h-4 w-4 shrink-0' />
              : <ChevronRight className='h-4 w-4 shrink-0' />}
          </div>

          {expandedTopics.has(topic.id) && (
            <div className='border-t px-4 py-4 space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <Input
                  placeholder='Topic title (EN)'
                  value={topic.title.en}
                  onChange={(e) => updateTopic(topic.id, { title: { ...topic.title, en: e.target.value } })}
                />
                <Input
                  dir='rtl'
                  placeholder='عنوان الموضوع (AR)'
                  value={topic.title.ar}
                  onChange={(e) => updateTopic(topic.id, { title: { ...topic.title, ar: e.target.value } })}
                />
              </div>

              <div className='space-y-2'>
                {topic.elements.map((el: CurriculumElement) => {
                  const elId   = el.id as string | number;
                  const elType = el.type as CurriculumElementType;
                  const elVal  = typeof el.value === 'object' && el.value !== null
                    ? (el.value as { en: string; ar?: string | null })
                    : null;

                  return (
                    <div key={elId} className='rounded-lg border bg-muted/20 p-3 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Badge className={cn('text-xs', ELEMENT_COLORS[elType])}>
                          {el.type}
                        </Badge>
                        <button
                          onClick={() => deleteElement(topic.id, elId)}
                          className='ml-auto rounded p-1 text-muted-foreground hover:text-destructive'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                      </div>
                      {el.type !== 'hr' && elVal !== null && (
                        <div className='grid grid-cols-2 gap-2'>
                          <Textarea
                            rows={3}
                            placeholder='Content (EN)'
                            value={elVal.en ?? ''}
                            onChange={(e) => updateElement(topic.id, elId, {
                              value: { ...elVal, en: e.target.value },
                            })}
                            className='text-xs'
                          />
                          <Textarea
                            rows={3}
                            dir='rtl'
                            placeholder='المحتوى (AR)'
                            value={elVal.ar ?? ''}
                            onChange={(e) => updateElement(topic.id, elId, {
                              value: { ...elVal, ar: e.target.value },
                            })}
                            className='text-xs'
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className='flex flex-wrap gap-1.5 border-t pt-3'>
                <span className='text-xs text-muted-foreground self-center'>Add element:</span>
                {ELEMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addElement(topic.id, type)}
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80',
                      ELEMENT_COLORS[type],
                    )}
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
