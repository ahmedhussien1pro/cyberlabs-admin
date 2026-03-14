// TopicEditor.tsx — orchestrator only (elements logic in ElementFields / ElementCard)
import React, { useState } from 'react';
import {
  FileText, Heading1, Heading2, Image, Code, Terminal,
  List, ListOrdered, StickyNote, Video, Table, Minus, Plus, Layers, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { ElementCard } from './ElementCard';

// ── Re-exported types (kept here so callers import from one place) ──────────
export interface ContentElement {
  id: number;
  type: string;
  value?: any;
  srcKey?: string;
  size?: string;
  imageMode?: string;
  imageUrl?: string;
  language?: string;
  label?: { en: string; ar: string };
  title?: { en: string; ar: string };
  items?: any;
  noteType?: string;
  link?: string;
  isLab?: boolean;
  url?: string;
  caption?: { en: string; ar: string };
  headers?: { en: string[]; ar: string[] };
  rows?: { en: string[]; ar: string[] }[];
}

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
  { type: 'text',        icon: FileText,     label: 'Text' },
  { type: 'title',       icon: Heading1,     label: 'Title' },
  { type: 'subtitle',    icon: Heading2,     label: 'Subtitle' },
  { type: 'image',       icon: Image,        label: 'Image' },
  { type: 'code',        icon: Code,         label: 'Code' },
  { type: 'terminal',    icon: Terminal,     label: 'Terminal' },
  { type: 'list',        icon: List,         label: 'List' },
  { type: 'orderedList', icon: ListOrdered,  label: 'Ordered List' },
  { type: 'note',        icon: StickyNote,   label: 'Note' },
  { type: 'video',       icon: Video,        label: 'Video' },
  { type: 'table',       icon: Table,        label: 'Table' },
  { type: 'hr',          icon: Minus,        label: 'Divider' },
];

export const createNewElement = (type: string): ContentElement => {
  const base = { id: Date.now() + Math.random(), type };
  switch (type) {
    case 'text': case 'title': case 'subtitle':
      return { ...base, value: { en: '', ar: '' } };
    case 'image':
      return { ...base, srcKey: '', size: 'medium', imageMode: 'url', imageUrl: '' };
    case 'code':
      return { ...base, language: 'javascript', value: '' };
    case 'terminal':
      return { ...base, label: { en: 'Terminal', ar: 'تيرمينال' }, value: '' };
    case 'list':
      return { ...base, title: { en: '', ar: '' }, items: { en: [''], ar: [''] } };
    case 'orderedList':
      return { ...base, title: { en: '', ar: '' }, items: [{ subtitle: { en: '', ar: '' }, text: { en: '', ar: '' }, example: null }] };
    case 'note':
      return { ...base, noteType: 'info', value: { en: '', ar: '' }, link: '', isLab: false };
    case 'video':
      return { ...base, url: '', caption: { en: '', ar: '' } };
    case 'table':
      return { ...base, title: { en: '', ar: '' }, headers: { en: [''], ar: [''] }, rows: [{ en: [''], ar: [''] }] };
    case 'hr':
      return base;
    default:
      return base;
  }
};

// ─── TopicEditor ───────────────────────────────────────────────────────────────
type EditorTab = 'add' | 'elements' | 'settings';

const TopicEditor: React.FC<TopicEditorProps> = ({ topic, topicIndex, onTopicChange, imageMap, onImageUpload }) => {
  const [tab, setTab] = useState<EditorTab>('add');

  const handleAddElement = (type: string) => {
    onTopicChange({ ...topic, elements: [...topic.elements, createNewElement(type)] });
    setTab('elements');
  };

  const handleElementChange = (index: number, updated: ContentElement) => {
    const els = [...topic.elements];
    els[index] = updated;
    onTopicChange({ ...topic, elements: els });
  };

  const handleDeleteElement = (index: number) => {
    const elementType = topic.elements[index].type;
    toast(`Delete "${elementType}" element?`, {
      description: 'This action cannot be undone.',
      action: { label: 'Delete', onClick: () => { onTopicChange({ ...topic, elements: topic.elements.filter((_, i) => i !== index) }); toast.success('Element deleted'); } },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
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
    toast.success('Element duplicated');
  };

  const TABS: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'add',      label: 'Add Element',              icon: <Plus size={13} /> },
    { id: 'elements', label: `Elements (${topic.elements.length})`, icon: <Layers size={13} /> },
    { id: 'settings', label: 'Settings',                 icon: <Settings size={13} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} type="button"
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab(id)}>
            {icon}{label}
          </button>
        ))}
      </div>

      {tab === 'add' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
            <button key={type} type="button"
              className="flex flex-col items-center gap-1.5 px-2 py-4 rounded-lg border bg-card hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-medium"
              onClick={() => handleAddElement(type)}>
              <Icon size={18} className="text-primary" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'elements' && (
        <div className="space-y-3">
          {topic.elements.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/10 p-10 text-center">
              <Layers size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No elements yet.</p>
              <button type="button" className="mt-3 text-xs text-primary flex items-center gap-1 mx-auto" onClick={() => setTab('add')}>
                <Plus size={12} /> Add Element
              </button>
            </div>
          ) : (
            topic.elements.map((el, i) => (
              <ElementCard
                key={el.id} element={el} index={i} total={topic.elements.length}
                onChange={(u) => handleElementChange(i, u)}
                onDelete={() => handleDeleteElement(i)}
                onMove={handleMoveElement}
                onDuplicate={() => handleDuplicateElement(i)}
                imageMap={imageMap} onImageUpload={onImageUpload}
              />
            ))
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={15} className="text-primary" />
            <span className="text-sm font-semibold">Topic {topicIndex + 1} Settings</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic Title (EN)</label>
              <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g., Introduction to Access Control"
                value={topic.title.en} onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, en: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic Title (AR)</label>
              <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" dir="rtl" placeholder="مثال: مقدمة في التحكم بالوصول"
                value={topic.title.ar} onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, ar: e.target.value } })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicEditor;
