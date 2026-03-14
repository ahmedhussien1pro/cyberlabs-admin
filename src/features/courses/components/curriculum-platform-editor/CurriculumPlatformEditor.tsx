// ── CurriculumPlatformEditor — Main Component ─────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCoursesApi } from '../../services/admin-courses.api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Plus, Save, X, FileJson, Eye, Edit3, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopicRow } from './TopicRow';
import { JsonImportPanel } from './JsonImportPanel';
import { normalizeTopic, sanitizeTopicsForSave } from './types';
import type { Topic } from './types';

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

interface Props { courseId: string; courseSlug: string; }

export function CurriculumPlatformEditor({ courseId, courseSlug }: Props) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode]       = useState(false);
  const [localTopics, setLocalTopics] = useState<Topic[] | null>(null);
  const [openId, setOpenId]           = useState<string | null>(null);
  const [showImport, setShowImport]   = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'curriculum', courseId],
    queryFn:  () => adminCoursesApi.getCurriculum(courseId),
  });

  useEffect(() => {
    if (!data?.topics) return;
    if (localTopics === null) {
      const normalized = (data.topics as any[]).map((t, i) => normalizeTopic(t, i));
      setLocalTopics(normalized);
      if (normalized.length > 0) setOpenId(normalized[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const topics: Topic[] = localTopics ?? [];
  const total = topics.length;
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => adminCoursesApi.saveCurriculum(courseId, sanitizeTopicsForSave(topics)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum', courseId] });
      setLocalTopics(null);
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
                onClick={() => { setLocalTopics(null); setEditMode(false); }}
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
