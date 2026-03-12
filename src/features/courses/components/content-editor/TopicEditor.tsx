import React, { useState } from 'react';
import {
  FileText, Heading1, Heading2, Image, Code, Terminal,
  List, ListOrdered, StickyNote, Video, Table, Minus, Plus, Layers,
  Trash2, ChevronUp, ChevronDown, Copy, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';

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

const BADGE_COLORS: Record<string, string> = {
  text:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  title:       'bg-purple-500/20 text-purple-400 border-purple-500/30',
  subtitle:    'bg-violet-500/20 text-violet-400 border-violet-500/30',
  image:       'bg-green-500/20 text-green-400 border-green-500/30',
  code:        'bg-orange-500/20 text-orange-400 border-orange-500/30',
  terminal:    'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  list:        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  orderedList: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  note:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  video:       'bg-red-500/20 text-red-400 border-red-500/30',
  table:       'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  hr:          'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const createNewElement = (type: string): ContentElement => {
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

// ─── Element Fields (inline, tab-based) ───────────────────────────────────────
const ElementFields: React.FC<{
  element: ContentElement;
  onChange: (el: ContentElement) => void;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}> = ({ element, onChange, imageMap, onImageUpload }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const LangTabs = () => (
    <div className="flex gap-1 mb-3">
      <button
        type="button"
        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
          lang === 'en' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-transparent'
        }`}
        onClick={() => setLang('en')}
      >
        English
      </button>
      <button
        type="button"
        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
          lang === 'ar' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-transparent'
        }`}
        onClick={() => setLang('ar')}
      >
        العربية
      </button>
    </div>
  );

  switch (element.type) {
    case 'text':
    case 'title':
    case 'subtitle':
      return (
        <div>
          <LangTabs />
          {lang === 'en' ? (
            <RichTextEditor
              value={element.value?.en ?? ''}
              onChange={(v) => onChange({ ...element, value: { ...element.value, en: v } })}
              dir="ltr"
            />
          ) : (
            <RichTextEditor
              value={element.value?.ar ?? ''}
              onChange={(v) => onChange({ ...element, value: { ...element.value, ar: v } })}
              dir="rtl"
            />
          )}
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Image Key</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g., IntroImage"
                value={element.srcKey ?? ''}
                onChange={(e) => onChange({ ...element, srcKey: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Size</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={element.size ?? 'medium'}
                onChange={(e) => onChange({ ...element, size: e.target.value })}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                element.imageMode !== 'upload' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => onChange({ ...element, imageMode: 'url', imageUrl: '' })}
            >
              URL
            </button>
            <button
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                element.imageMode === 'upload' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              }`}
              onClick={() => onChange({ ...element, imageMode: 'upload' })}
            >
              Upload
            </button>
          </div>
          {(!element.imageMode || element.imageMode === 'url') && (
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="https://example.com/image.jpg"
              value={element.imageUrl ?? ''}
              onChange={(e) => onChange({ ...element, imageUrl: e.target.value })}
            />
          )}
          {element.imageMode === 'upload' && (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
                  if (!element.srcKey) { toast.error('Set an Image Key first'); return; }
                  onImageUpload(element.srcKey, file);
                }}
              />
              <span className="text-xs text-muted-foreground">Click to upload (PNG, JPG, WEBP, max 5MB)</span>
            </label>
          )}
          {(imageMap[element.srcKey ?? ''] || element.imageUrl) && (
            <img
              src={imageMap[element.srcKey ?? ''] || element.imageUrl}
              alt="preview"
              className="rounded-md max-h-48 object-contain w-full border mt-2"
            />
          )}
        </div>
      );

    case 'code':
      return (
        <div className="space-y-3">
          <select
            className="w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
            value={element.language ?? 'javascript'}
            onChange={(e) => onChange({ ...element, language: e.target.value })}
          >
            {['javascript','python','java','html','css','bash','sql','json','php','cpp'].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <textarea
            className="w-full rounded-md border bg-black text-green-400 px-3 py-2 text-sm font-mono"
            rows={10}
            placeholder="Enter code here..."
            value={element.value ?? ''}
            onChange={(e) => onChange({ ...element, value: e.target.value })}
          />
        </div>
      );

    case 'terminal':
      return (
        <div className="space-y-3">
          <LangTabs />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Label</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={lang === 'en' ? 'Terminal' : 'تيرمينال'}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.label?.en ?? '') : (element.label?.ar ?? '')}
              onChange={(e) => onChange({
                ...element,
                label: lang === 'en'
                  ? { en: e.target.value, ar: element.label?.ar ?? '' }
                  : { en: element.label?.en ?? '', ar: e.target.value },
              })}
            />
          </div>
          <textarea
            className="w-full rounded-md border bg-zinc-900 text-green-400 px-3 py-2 text-sm font-mono"
            rows={4}
            placeholder="$ command here..."
            value={element.value ?? ''}
            onChange={(e) => onChange({ ...element, value: e.target.value })}
          />
        </div>
      );

    case 'note': {
      const NOTE_COLORS: Record<string, string> = {
        info:    'border-blue-500/40 bg-blue-500/10',
        warning: 'border-yellow-500/40 bg-yellow-500/10',
        success: 'border-green-500/40 bg-green-500/10',
        danger:  'border-red-500/40 bg-red-500/10',
      };
      return (
        <div className={`space-y-3 p-3 rounded-md border ${NOTE_COLORS[element.noteType ?? 'info']}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Note Type</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={element.noteType ?? 'info'}
                onChange={(e) => onChange({ ...element, noteType: e.target.value })}
              >
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="success">Success (Green)</option>
                <option value="danger">Danger (Red)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Link (optional)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="https://..."
                value={element.link ?? ''}
                onChange={(e) => onChange({ ...element, link: e.target.value })}
              />
            </div>
          </div>
          <LangTabs />
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder={lang === 'en' ? 'Note text...' : 'نص الملاحظة...'}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            value={lang === 'en' ? (element.value?.en ?? '') : (element.value?.ar ?? '')}
            onChange={(e) => onChange({
              ...element,
              value: lang === 'en'
                ? { ...element.value, en: e.target.value }
                : { ...element.value, ar: e.target.value },
            })}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={element.isLab ?? false}
              onChange={(e) => onChange({ ...element, isLab: e.target.checked })}
            />
            This is a Lab Link
          </label>
        </div>
      );
    }

    case 'hr':
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 border-t border-dashed border-muted-foreground/40" />
          <span className="text-xs text-muted-foreground">Divider</span>
          <div className="flex-1 border-t border-dashed border-muted-foreground/40" />
        </div>
      );

    case 'video':
      return (
        <div className="space-y-3">
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="https://youtube.com/embed/..."
            value={element.url ?? ''}
            onChange={(e) => onChange({ ...element, url: e.target.value })}
          />
          <LangTabs />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Caption</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={lang === 'en' ? 'Video caption' : 'عنوان الفيديو'}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.caption?.en ?? '') : (element.caption?.ar ?? '')}
              onChange={(e) => onChange({
                ...element,
                caption: lang === 'en'
                  ? { en: e.target.value, ar: element.caption?.ar ?? '' }
                  : { en: element.caption?.en ?? '', ar: e.target.value },
              })}
            />
          </div>
          {element.url && (
            <iframe
              src={element.url}
              width="100%"
              height="240"
              className="rounded-md border"
              allowFullScreen
              title="video preview"
            />
          )}
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3">
          <LangTabs />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title (optional)</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={lang === 'en' ? 'Optional title' : 'عنوان اختياري'}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({
                ...element,
                title: lang === 'en'
                  ? { en: e.target.value, ar: element.title?.ar ?? '' }
                  : { en: element.title?.en ?? '', ar: e.target.value },
              })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Items</label>
            {(element.items?.[lang] ?? []).map((item: string, i: number) => (
              <div key={i} className="flex gap-1 mb-1">
                <input
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  value={item}
                  onChange={(e) => {
                    const ne = [...element.items[lang]];
                    ne[i] = e.target.value;
                    onChange({ ...element, items: { ...element.items, [lang]: ne } });
                  }}
                />
                <button
                  type="button"
                  className="text-destructive hover:bg-destructive/10 rounded p-1"
                  onClick={() => onChange({
                    ...element,
                    items: {
                      en: element.items.en.filter((_: any, idx: number) => idx !== i),
                      ar: element.items.ar.filter((_: any, idx: number) => idx !== i),
                    },
                  })}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-primary mt-1"
              onClick={() => onChange({
                ...element,
                items: {
                  en: [...(element.items?.en ?? []), ''],
                  ar: [...(element.items?.ar ?? []), ''],
                },
              })}
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
        </div>
      );

    case 'orderedList':
      return (
        <div className="space-y-3">
          <LangTabs />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({
                ...element,
                title: lang === 'en'
                  ? { en: e.target.value, ar: element.title?.ar ?? '' }
                  : { en: element.title?.en ?? '', ar: e.target.value },
              })}
            />
          </div>
          {(element.items ?? []).map((item: any, i: number) => (
            <div key={i} className="border rounded-md p-3 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {i + 1}</span>
                <button
                  type="button"
                  className="text-destructive hover:bg-destructive/10 rounded p-1"
                  onClick={() => onChange({ ...element, items: element.items.filter((_: any, idx: number) => idx !== i) })}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
                <input
                  className="rounded-md border bg-background px-2 py-1.5 text-sm w-full"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={lang === 'en' ? 'Subtitle' : 'العنوان الفرعي'}
                  value={item.subtitle?.[lang] ?? ''}
                  onChange={(e) => {
                    const ni = [...element.items];
                    ni[i] = { ...ni[i], subtitle: { ...ni[i].subtitle, [lang]: e.target.value } };
                    onChange({ ...element, items: ni });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Text</label>
                <textarea
                  className="rounded-md border bg-background px-2 py-1.5 text-sm w-full"
                  rows={2}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={lang === 'en' ? 'Text' : 'النص'}
                  value={item.text?.[lang] ?? ''}
                  onChange={(e) => {
                    const ni = [...element.items];
                    ni[i] = { ...ni[i], text: { ...ni[i].text, [lang]: e.target.value } };
                    onChange({ ...element, items: ni });
                  }}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-primary"
            onClick={() => onChange({
              ...element,
              items: [...(element.items ?? []), { subtitle: { en: '', ar: '' }, text: { en: '', ar: '' }, example: null }],
            })}
          >
            <Plus size={12} /> Add Item
          </button>
        </div>
      );

    case 'table':
      return (
        <div className="space-y-3">
          <LangTabs />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Table Title</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              placeholder={lang === 'en' ? 'Table Title' : 'عنوان الجدول'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({
                ...element,
                title: lang === 'en'
                  ? { en: e.target.value, ar: element.title?.ar ?? '' }
                  : { en: element.title?.en ?? '', ar: e.target.value },
              })}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Headers:</span>
            {(element.headers?.[lang] ?? []).map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className="w-24 rounded-md border bg-background px-2 py-1.5 text-xs"
                  placeholder={`Header ${i + 1}`}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  value={h}
                  onChange={(e) => {
                    const nh = { en: [...(element.headers?.en ?? [])], ar: [...(element.headers?.ar ?? [])] };
                    nh[lang][i] = e.target.value;
                    onChange({ ...element, headers: nh });
                  }}
                />
                <button
                  type="button"
                  className="text-destructive"
                  onClick={() => onChange({
                    ...element,
                    headers: {
                      en: element.headers!.en.filter((_: any, idx: number) => idx !== i),
                      ar: element.headers!.ar.filter((_: any, idx: number) => idx !== i),
                    },
                    rows: (element.rows ?? []).map(r => ({
                      en: r.en.filter((_: any, idx: number) => idx !== i),
                      ar: r.ar.filter((_: any, idx: number) => idx !== i),
                    })),
                  })}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-primary border rounded px-2 py-1"
              onClick={() => onChange({
                ...element,
                headers: {
                  en: [...(element.headers?.en ?? []), ''],
                  ar: [...(element.headers?.ar ?? []), ''],
                },
                rows: (element.rows ?? []).map(r => ({ en: [...r.en, ''], ar: [...r.ar, ''] })),
              })}
            >
              <Plus size={10} /> Col
            </button>
          </div>
          {(element.rows ?? []).map((row: any, ri: number) => (
            <div key={ri} className="border rounded-md p-2 space-y-1 bg-muted/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Row {ri + 1}</span>
                <button
                  type="button"
                  className="text-destructive"
                  onClick={() => onChange({ ...element, rows: element.rows!.filter((_: any, idx: number) => idx !== ri) })}
                >
                  <Trash2 size={10} />
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {row[lang].map((cell: string, ci: number) => (
                  <input
                    key={ci}
                    className="flex-1 min-w-20 rounded border bg-background px-2 py-1 text-xs"
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    placeholder={element.headers?.[lang][ci] ?? `Col${ci + 1}`}
                    value={cell}
                    onChange={(e) => {
                      const nr = [...element.rows!];
                      nr[ri] = { ...nr[ri], [lang]: [...nr[ri][lang]] };
                      nr[ri][lang][ci] = e.target.value;
                      onChange({ ...element, rows: nr });
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-primary border rounded px-2 py-1"
            onClick={() => onChange({
              ...element,
              rows: [...(element.rows ?? []), {
                en: (element.headers?.en ?? []).map(() => ''),
                ar: (element.headers?.ar ?? []).map(() => ''),
              }],
            })}
          >
            <Plus size={12} /> Add Row
          </button>
        </div>
      );

    default:
      return <p className="text-xs text-muted-foreground">Element type "{element.type}" not supported yet.</p>;
  }
};

// ─── Element Card ──────────────────────────────────────────────────────────────
const ElementCard: React.FC<{
  element: ContentElement;
  index: number;
  total: number;
  onChange: (el: ContentElement) => void;
  onDelete: () => void;
  onMove: (index: number, dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}> = ({ element, index, total, onChange, onDelete, onMove, onDuplicate, imageMap, onImageUpload }) => {
  const [collapsed, setCollapsed] = useState(false);
  const badgeCls = BADGE_COLORS[element.type] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-muted/30 hover:bg-muted/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <ChevronDown size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeCls}`}>{element.type}</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1.5 rounded hover:bg-muted disabled:opacity-30" disabled={index === 0} onClick={() => onMove(index, 'up')}><ChevronUp size={13} /></button>
          <button className="p-1.5 rounded hover:bg-muted disabled:opacity-30" disabled={index === total - 1} onClick={() => onMove(index, 'down')}><ChevronDown size={13} /></button>
          <button className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400" onClick={onDuplicate}><Copy size={13} /></button>
          <button className="p-1.5 rounded hover:bg-destructive/10 text-destructive" onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4">
          <ElementFields element={element} onChange={onChange} imageMap={imageMap} onImageUpload={onImageUpload} />
        </div>
      )}
    </div>
  );
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
    { id: 'add',      label: 'Add Element', icon: <Plus size={13} /> },
    { id: 'elements', label: `Elements (${topic.elements.length})`, icon: <Layers size={13} /> },
    { id: 'settings', label: 'Settings',    icon: <Settings size={13} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Add Element Tab */}
      {tab === 'add' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              className="flex flex-col items-center gap-1.5 px-2 py-4 rounded-lg border bg-card hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-medium"
              onClick={() => handleAddElement(type)}
            >
              <Icon size={18} className="text-primary" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Elements Tab */}
      {tab === 'elements' && (
        <div className="space-y-3">
          {topic.elements.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/10 p-10 text-center">
              <Layers size={28} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No elements yet.</p>
              <button
                type="button"
                className="mt-3 text-xs text-primary flex items-center gap-1 mx-auto"
                onClick={() => setTab('add')}
              >
                <Plus size={12} /> Add Element
              </button>
            </div>
          ) : (
            topic.elements.map((el, i) => (
              <ElementCard
                key={el.id}
                element={el}
                index={i}
                total={topic.elements.length}
                onChange={(u) => handleElementChange(i, u)}
                onDelete={() => handleDeleteElement(i)}
                onMove={handleMoveElement}
                onDuplicate={() => handleDuplicateElement(i)}
                imageMap={imageMap}
                onImageUpload={onImageUpload}
              />
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={15} className="text-primary" />
            <span className="text-sm font-semibold">Topic {topicIndex + 1} Settings</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic Title (EN)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g., Introduction to Access Control"
                value={topic.title.en}
                onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, en: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic Title (AR)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                dir="rtl"
                placeholder="مثال: مقدمة في التحكم بالوصول"
                value={topic.title.ar}
                onChange={(e) => onTopicChange({ ...topic, title: { ...topic.title, ar: e.target.value } })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicEditor;
