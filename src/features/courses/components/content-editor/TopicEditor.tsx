import React from 'react';
import {
  FileText, Heading1, Heading2, Image, Code, Terminal,
  List, ListOrdered, StickyNote, Video, Table, Minus, Plus, Layers,
} from 'lucide-react';
import ElementItem, { ContentElement } from './ElementItem';
import Swal from 'sweetalert2';

export interface Topic {
  id: string;
  title: { en: string; ar: string };
  elements: ContentElement[];
}

interface TopicEditorProps {
  topic: Topic;
  topicIndex: number;
  onTopicChange: (t: Topic) => void;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}

const ELEMENT_TYPES = [
  { type: 'text', icon: FileText, label: 'Text' },
  { type: 'title', icon: Heading1, label: 'Title' },
  { type: 'subtitle', icon: Heading2, label: 'Subtitle' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'code', icon: Code, label: 'Code' },
  { type: 'terminal', icon: Terminal, label: 'Terminal' },
  { type: 'list', icon: List, label: 'List' },
  { type: 'orderedList', icon: ListOrdered, label: 'Ordered List' },
  { type: 'note', icon: StickyNote, label: 'Note' },
  { type: 'video', icon: Video, label: 'Video' },
  { type: 'table', icon: Table, label: 'Table' },
  { type: 'hr', icon: Minus, label: 'Divider' },
];

const createNewElement = (type: string): ContentElement => {
  const base = { id: Date.now() + Math.random(), type };
  switch (type) {
    case 'text': case 'title': case 'subtitle': return { ...base, value: { en: '', ar: '' } };
    case 'image': return { ...base, srcKey: '', size: 'medium', imageMode: 'url', imageUrl: '' };
    case 'code': return { ...base, language: 'javascript', value: '' };
    case 'terminal': return { ...base, label: { en: 'Terminal', ar: 'تيرمينال' }, value: '' };
    case 'list': return { ...base, title: { en: '', ar: '' }, items: { en: [''], ar: [''] } };
    case 'orderedList': return { ...base, title: { en: '', ar: '' }, items: [{ subtitle: { en: '', ar: '' }, text: { en: '', ar: '' }, example: null }] };
    case 'note': return { ...base, noteType: 'info', value: { en: '', ar: '' }, link: '', isLab: false };
    case 'video': return { ...base, url: '', caption: { en: '', ar: '' } };
    case 'table': return { ...base, title: { en: '', ar: '' }, headers: { en: [''], ar: [''] }, rows: [{ en: [''], ar: [''] }] };
    case 'hr': return base;
    default: return base;
  }
};

const TopicEditor: React.FC<TopicEditorProps> = ({ topic, topicIndex, onTopicChange, imageMap, onImageUpload }) => {
  const handleAddElement = (type: string) => {
    onTopicChange({ ...topic, elements: [...topic.elements, createNewElement(type)] });
  };

  const handleElementChange = (index: number, updated: ContentElement) => {
    const els = [...topic.elements];
    els[index] = updated;
    onTopicChange({ ...topic, elements: els });
  };

  const handleDeleteElement = async (index: number) => {
    const res = await Swal.fire({ title: 'Delete Element?', text: 'This cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#ef4444' });
    if (res.isConfirmed) {
      onTopicChange({ ...topic, elements: topic.elements.filter((_, i) => i !== index) });
    }
  };

  const handleMoveElement = (index: number, dir: 'up' | 'down') => {
    const els = [...topic.elements];
    const ni = dir === 'up' ? index - 1 : index + 1;
    if (ni < 0 || ni >= els.length) return;
    [els[index], els[ni]] = [els[ni], els[index]];
    onTopicChange({ ...topic, elements: els });
  };

  const handleDuplicateElement = (index: number) => {
    const dup = { ...JSON.parse(JSON.stringify(topic.elements[index])), id: Date.now() + Math.random() };
    const els = [...topic.elements];
    els.splice(index + 1, 0, dup);
    onTopicChange({ ...topic, elements: els });
  };

  return (
    <div className='space-y-6'>
      {/* Topic Title */}
      <div className='rounded-xl border bg-card p-5 space-y-4'>
        <div className='flex items-center gap-2'>
          <Layers size={16} className='text-primary' />
          <h3 className='text-sm font-semibold'>Topic {topicIndex + 1}</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Topic Title (EN)</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='e.g., Introduction to Access Control' value={topic.title.en} onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, en: e.target.value } })} />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Topic Title (AR)</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='مثال: مقدمة في التحكم بالوصول' value={topic.title.ar} onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, ar: e.target.value } })} />
          </div>
        </div>
      </div>

      {/* Add Element */}
      <div className='rounded-xl border bg-card p-5 space-y-3'>
        <div className='flex items-center gap-2'>
          <Plus size={14} className='text-primary' />
          <span className='text-sm font-semibold'>Add Element</span>
        </div>
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
          {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
            <button key={type} type='button' className='flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border bg-muted/20 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-medium' onClick={() => handleAddElement(type)}>
              <Icon size={16} className='text-primary' />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Elements */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>Elements</span>
          <span className='text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full'>{topic.elements.length}</span>
        </div>
        {topic.elements.length === 0 ? (
          <div className='rounded-xl border border-dashed bg-muted/10 p-10 text-center'>
            <Layers size={28} className='text-muted-foreground mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>No elements yet. Add your first element above.</p>
          </div>
        ) : (
          topic.elements.map((el, i) => (
            <ElementItem key={el.id} element={el} index={i} onChange={(u) => handleElementChange(i, u)} onDelete={() => handleDeleteElement(i)} onMove={handleMoveElement} onDuplicate={() => handleDuplicateElement(i)} isFirst={i === 0} isLast={i === topic.elements.length - 1} imageMap={imageMap} onImageUpload={onImageUpload} />
          ))
        )}
      </div>
    </div>
  );
};

export default TopicEditor;
