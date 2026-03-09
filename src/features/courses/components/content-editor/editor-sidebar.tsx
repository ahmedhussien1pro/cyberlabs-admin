// src/features/courses/components/content-editor/editor-sidebar.tsx
import { useCourseEditorStore } from '../../store/use-course-editor-store';
import type {
  ElementType,
  EditorTopic,
  CourseElement,
} from '../../types/course-editor.types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Trash2,
  ChevronDown,
  FileText,
  ImageIcon,
  Video,
  Code2,
  HelpCircle,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Constants ───────────────────────────────────────────────────────────

const ELEMENT_ICONS: Record<ElementType, React.ReactNode> = {
  TEXT: <FileText className='h-3 w-3' />,
  IMAGE: <ImageIcon className='h-3 w-3' />,
  VIDEO: <Video className='h-3 w-3' />,
  CODE: <Code2 className='h-3 w-3' />,
  QUIZ: <HelpCircle className='h-3 w-3' />,
};

const ELEMENT_LABELS: Record<ElementType, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  VIDEO: 'Video',
  CODE: 'Code',
  QUIZ: 'Quiz',
};

// ── Props ───────────────────────────────────────────────────────────────

interface Props {
  selectedElementId: string | null;
  onSelectElement: (topicId: string, elementId: string) => void;
}

// ── EditorSidebar ────────────────────────────────────────────────────────

export function EditorSidebar({ selectedElementId, onSelectElement }: Props) {
  const {
    topics,
    selectedTopicId,
    addTopic,
    deleteTopic,
    selectTopic,
    addElement,
    deleteElement,
  } = useCourseEditorStore();

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between px-3 py-2.5 border-b border-border/40 shrink-0'>
        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
          Topics
        </span>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6'
          onClick={addTopic}
          title='Add Topic'>
          <Plus className='h-3.5 w-3.5' />
        </Button>
      </div>

      {/* Topics list */}
      <div className='flex-1 overflow-y-auto py-2 space-y-1 px-2'>
        {topics.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-xs text-muted-foreground'>No topics yet</p>
            <Button
              variant='outline'
              size='sm'
              className='mt-3 h-7 text-xs gap-1'
              onClick={addTopic}>
              <Plus className='h-3 w-3' /> Add Topic
            </Button>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              isSelected={selectedTopicId === topic.id}
              selectedElementId={selectedElementId}
              onSelect={() => selectTopic(topic.id)}
              onDelete={() => deleteTopic(topic.id)}
              onAddElement={(type) => addElement(topic.id, type)}
              onDeleteElement={(elId) => deleteElement(topic.id, elId)}
              onSelectElement={(elId) => onSelectElement(topic.id, elId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── TopicItem ───────────────────────────────────────────────────────────

interface TopicItemProps {
  topic: EditorTopic;
  isSelected: boolean;
  selectedElementId: string | null;
  onSelect: () => void;
  onDelete: () => void;
  onAddElement: (type: ElementType) => void;
  onDeleteElement: (elId: string) => void;
  onSelectElement: (elId: string) => void;
}

function TopicItem({
  topic,
  isSelected,
  selectedElementId,
  onSelect,
  onDelete,
  onAddElement,
  onDeleteElement,
  onSelectElement,
}: TopicItemProps) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isSelected
          ? 'border-primary/40 bg-primary/5'
          : 'border-transparent hover:border-border/60 hover:bg-muted/30',
      )}>
      {/* Topic header row */}
      <div
        className='flex items-center gap-1.5 px-2 py-1.5 cursor-pointer group'
        onClick={onSelect}>
        <GripVertical className='h-3 w-3 text-muted-foreground/30 shrink-0' />
        <span className='flex-1 text-xs font-medium truncate'>
          {topic.title || 'Untitled Topic'}
        </span>
        <Badge variant='outline' className='text-[10px] h-4 px-1 shrink-0'>
          {topic.elements.length}
        </Badge>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground shrink-0 transition-opacity'
          title='Delete topic'>
          <Trash2 className='h-3 w-3' />
        </button>
      </div>

      {/* Elements — shown when topic is selected */}
      {isSelected && (
        <div className='pb-2 px-1.5 space-y-0.5'>
          {topic.elements.map((el) => (
            <ElementItem
              key={el.id}
              element={el}
              isSelected={selectedElementId === el.id}
              onSelect={() => onSelectElement(el.id)}
              onDelete={() => onDeleteElement(el.id)}
            />
          ))}

          {/* Add Element dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='w-full h-6 text-xs gap-1 mt-1 text-muted-foreground hover:text-foreground justify-start pl-2'>
                <Plus className='h-3 w-3' />
                Add Element
                <ChevronDown className='h-2.5 w-2.5 ml-auto' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-36'>
              {(Object.keys(ELEMENT_LABELS) as ElementType[]).map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddElement(type)}
                  className='gap-2 text-xs'>
                  {ELEMENT_ICONS[type]}
                  {ELEMENT_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// ── ElementItem ──────────────────────────────────────────────────────────

interface ElementItemProps {
  element: CourseElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ElementItem({
  element,
  isSelected,
  onSelect,
  onDelete,
}: ElementItemProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer group text-xs transition-colors',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}>
      <span className='shrink-0'>{ELEMENT_ICONS[element.type]}</span>
      <span className='flex-1 truncate'>
        {element.title || `${ELEMENT_LABELS[element.type]} element`}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className='opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0 transition-opacity'
        title='Delete element'>
        <Trash2 className='h-2.5 w-2.5' />
      </button>
    </div>
  );
}
