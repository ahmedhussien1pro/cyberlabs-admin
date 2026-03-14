// ── TopicRow ───────────────────────────────────────────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import CourseElementRenderer from '../CourseElementRenderer';
import { ElementEditor } from './ElementEditor';
import { makeElement, ELEMENT_TYPES, EL_COLORS } from './element-factory';
import type { Topic } from './types';
import type { CourseElement } from '../CourseElementRenderer';

interface TopicRowProps {
  topic: Topic;
  topicIndex: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  editMode: boolean;
  onUpdate: (t: Topic) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function TopicRow({
  topic, topicIndex, total, isOpen, onToggle,
  editMode, onUpdate, onDelete, onMoveUp, onMoveDown,
}: TopicRowProps) {
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
    if (dir === 'up'   && idx > 0)              { [els[idx - 1], els[idx]]     = [els[idx], els[idx - 1]]; }
    if (dir === 'down' && idx < els.length - 1) { [els[idx],     els[idx + 1]] = [els[idx + 1], els[idx]]; }
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
