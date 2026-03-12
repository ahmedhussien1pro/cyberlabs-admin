import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, Trash2, Copy, Plus, Link, Upload, X,
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { toast } from 'sonner';

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

interface ElementItemProps {
  element: ContentElement;
  index: number;
  onChange: (el: ContentElement) => void;
  onDelete: () => void;
  onMove: (index: number, dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  isFirst: boolean;
  isLast: boolean;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}

const BADGE_COLORS: Record<string, string> = {
  text: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  title: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  subtitle: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  image: 'bg-green-500/20 text-green-400 border-green-500/30',
  code: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  terminal: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  list: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  orderedList: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  note: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  video: 'bg-red-500/20 text-red-400 border-red-500/30',
  table: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  hr: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const ElementItem: React.FC<ElementItemProps> = ({
  element, index, onChange, onDelete, onMove, onDuplicate,
  isFirst, isLast, imageMap, onImageUpload,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const badgeCls = BADGE_COLORS[element.type] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

  const handleImageFile = (file: File) => {
    if (!['image/jpeg','image/png','image/jpg','image/webp'].includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    if (element.srcKey) onImageUpload(element.srcKey, file);
    else toast.error('Set an Image Key first');
  };

  const renderFields = () => {
    switch (element.type) {
      case 'text':
      case 'title':
      case 'subtitle':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-xs text-muted-foreground mb-1 block'>English</label>
              <RichTextEditor value={element.value?.en ?? ''} onChange={(v) => onChange({ ...element, value: { ...element.value, en: v } })} />
            </div>
            <div>
              <label className='text-xs text-muted-foreground mb-1 block'>Arabic</label>
              <RichTextEditor value={element.value?.ar ?? ''} onChange={(v) => onChange({ ...element, value: { ...element.value, ar: v } })} dir='rtl' />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Image Key</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='e.g., IntroImage' value={element.srcKey ?? ''} onChange={(e) => onChange({ ...element, srcKey: e.target.value })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Size</label>
                <select className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={element.size ?? 'medium'} onChange={(e) => onChange({ ...element, size: e.target.value })}>
                  <option value='small'>Small</option>
                  <option value='medium'>Medium</option>
                  <option value='large'>Large</option>
                </select>
              </div>
            </div>
            <div className='flex gap-2'>
              <button type='button' className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${element.imageMode !== 'upload' ? 'bg-primary text-primary-foreground border-primary' : ''}`} onClick={() => onChange({ ...element, imageMode: 'url', imageUrl: '' })}><Link size={12} /> Image URL</button>
              <button type='button' className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${element.imageMode === 'upload' ? 'bg-primary text-primary-foreground border-primary' : ''}`} onClick={() => onChange({ ...element, imageMode: 'upload' })}><Upload size={12} /> Upload</button>
            </div>
            {(!element.imageMode || element.imageMode === 'url') && (
              <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://example.com/image.jpg' value={element.imageUrl ?? ''} onChange={(e) => onChange({ ...element, imageUrl: e.target.value })} />
            )}
            {element.imageMode === 'upload' && (
              <label className='flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 transition-colors'>
                <input type='file' accept='image/*' className='hidden' onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
                <Upload size={20} className='text-muted-foreground mb-1' />
                <span className='text-xs text-muted-foreground'>Click to upload (PNG, JPG, WEBP, max 5MB)</span>
              </label>
            )}
            {(imageMap[element.srcKey ?? ''] || element.imageUrl) && (
              <div className='relative mt-2'>
                <button type='button' className='absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white z-10' onClick={() => onChange({ ...element, imageUrl: '' })}><X size={12} /></button>
                <img src={imageMap[element.srcKey ?? ''] || element.imageUrl} alt='preview' className='rounded-md max-h-48 object-contain w-full border' />
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className='space-y-3'>
            <select className='w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm' value={element.language ?? 'javascript'} onChange={(e) => onChange({ ...element, language: e.target.value })}>
              {['javascript','python','java','html','css','bash','sql','json','php','cpp'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <textarea className='w-full rounded-md border bg-black text-green-400 px-3 py-2 text-sm font-mono' rows={10} placeholder='Enter code here...' value={element.value ?? ''} onChange={(e) => onChange({ ...element, value: e.target.value })} />
          </div>
        );

      case 'terminal':
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Label (EN)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='Terminal' value={element.label?.en ?? ''} onChange={(e) => onChange({ ...element, label: { ...element.label, en: e.target.value, ar: element.label?.ar ?? '' } })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Label (AR)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='تيرمينال' dir='rtl' value={element.label?.ar ?? ''} onChange={(e) => onChange({ ...element, label: { en: element.label?.en ?? '', ar: e.target.value } })} />
              </div>
            </div>
            <textarea className='w-full rounded-md border bg-zinc-900 text-green-400 px-3 py-2 text-sm font-mono' rows={4} placeholder='$ command here...' value={element.value ?? ''} onChange={(e) => onChange({ ...element, value: e.target.value })} />
          </div>
        );

      case 'note': {
        const NOTE_COLORS: Record<string, string> = { info: 'border-blue-500/40 bg-blue-500/10', warning: 'border-yellow-500/40 bg-yellow-500/10', success: 'border-green-500/40 bg-green-500/10', danger: 'border-red-500/40 bg-red-500/10' };
        return (
          <div className={`space-y-3 p-3 rounded-md border ${NOTE_COLORS[element.noteType ?? 'info']}`}>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Note Type</label>
                <select className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={element.noteType ?? 'info'} onChange={(e) => onChange({ ...element, noteType: e.target.value })}>
                  <option value='info'>Info (Blue)</option>
                  <option value='warning'>Warning (Orange)</option>
                  <option value='success'>Success (Green)</option>
                  <option value='danger'>Danger (Red)</option>
                </select>
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Link (optional)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://...' value={element.link ?? ''} onChange={(e) => onChange({ ...element, link: e.target.value })} />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Text (EN)</label>
                <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={3} placeholder='Note text...' value={element.value?.en ?? ''} onChange={(e) => onChange({ ...element, value: { ...element.value, en: e.target.value } })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Text (AR)</label>
                <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={3} dir='rtl' placeholder='نص الملاحظة...' value={element.value?.ar ?? ''} onChange={(e) => onChange({ ...element, value: { ...element.value, ar: e.target.value } })} />
              </div>
            </div>
            <label className='flex items-center gap-2 text-sm cursor-pointer'>
              <input type='checkbox' checked={element.isLab ?? false} onChange={(e) => onChange({ ...element, isLab: e.target.checked })} />
              This is a Lab Link
            </label>
          </div>
        );
      }

      case 'hr':
        return <div className='flex items-center gap-3 py-2'><div className='flex-1 border-t border-dashed border-muted-foreground/40' /><span className='text-xs text-muted-foreground'>Divider</span><div className='flex-1 border-t border-dashed border-muted-foreground/40' /></div>;

      case 'video':
        return (
          <div className='space-y-3'>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://youtube.com/embed/...' value={element.url ?? ''} onChange={(e) => onChange({ ...element, url: e.target.value })} />
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Caption (EN)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='Video caption' value={element.caption?.en ?? ''} onChange={(e) => onChange({ ...element, caption: { en: e.target.value, ar: element.caption?.ar ?? '' } })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Caption (AR)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='عنوان الفيديو' value={element.caption?.ar ?? ''} onChange={(e) => onChange({ ...element, caption: { en: element.caption?.en ?? '', ar: e.target.value } })} />
              </div>
            </div>
            {element.url && (
              <iframe src={element.url} width='100%' height='280' className='rounded-md border' allowFullScreen title='video preview' />
            )}
          </div>
        );

      case 'list':
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Title (EN)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='Optional title' value={element.title?.en ?? ''} onChange={(e) => onChange({ ...element, title: { en: e.target.value, ar: element.title?.ar ?? '' } })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Title (AR)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='عنوان اختياري' value={element.title?.ar ?? ''} onChange={(e) => onChange({ ...element, title: { en: element.title?.en ?? '', ar: e.target.value } })} />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Items (EN)</label>
                {(element.items?.en ?? []).map((item: string, i: number) => (
                  <div key={i} className='flex gap-1 mb-1'>
                    <input className='flex-1 rounded-md border bg-background px-2 py-1.5 text-sm' value={item} onChange={(e) => { const ne = [...element.items.en]; ne[i] = e.target.value; onChange({ ...element, items: { ...element.items, en: ne } }); }} />
                    <button type='button' className='text-destructive hover:bg-destructive/10 rounded p-1' onClick={() => onChange({ ...element, items: { en: element.items.en.filter((_: any, idx: number) => idx !== i), ar: element.items.ar.filter((_: any, idx: number) => idx !== i) } })}><Trash2 size={12} /></button>
                  </div>
                ))}
                <button type='button' className='flex items-center gap-1 text-xs text-primary mt-1' onClick={() => onChange({ ...element, items: { en: [...(element.items?.en ?? []), ''], ar: [...(element.items?.ar ?? []), ''] } })}><Plus size={12} /> Add Item</button>
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Items (AR)</label>
                {(element.items?.ar ?? []).map((item: string, i: number) => (
                  <div key={i} className='flex gap-1 mb-1'>
                    <input className='flex-1 rounded-md border bg-background px-2 py-1.5 text-sm' dir='rtl' value={item} onChange={(e) => { const ne = [...element.items.ar]; ne[i] = e.target.value; onChange({ ...element, items: { ...element.items, ar: ne } }); }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'orderedList':
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Title (EN)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={element.title?.en ?? ''} onChange={(e) => onChange({ ...element, title: { en: e.target.value, ar: element.title?.ar ?? '' } })} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Title (AR)</label>
                <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' value={element.title?.ar ?? ''} onChange={(e) => onChange({ ...element, title: { en: element.title?.en ?? '', ar: e.target.value } })} />
              </div>
            </div>
            {(element.items ?? []).map((item: any, i: number) => (
              <div key={i} className='border rounded-md p-3 space-y-2 bg-muted/20'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-muted-foreground'>Item {i + 1}</span>
                  <button type='button' className='text-destructive hover:bg-destructive/10 rounded p-1' onClick={() => onChange({ ...element, items: element.items.filter((_: any, idx: number) => idx !== i) })}><Trash2 size={12} /></button>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <input className='rounded-md border bg-background px-2 py-1.5 text-sm' placeholder='Subtitle (EN)' value={item.subtitle?.en ?? ''} onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], subtitle: { ...ni[i].subtitle, en: e.target.value } }; onChange({ ...element, items: ni }); }} />
                  <input className='rounded-md border bg-background px-2 py-1.5 text-sm' dir='rtl' placeholder='العنوان الفرعي' value={item.subtitle?.ar ?? ''} onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], subtitle: { ...ni[i].subtitle, ar: e.target.value } }; onChange({ ...element, items: ni }); }} />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <textarea className='rounded-md border bg-background px-2 py-1.5 text-sm' rows={2} placeholder='Text (EN)' value={item.text?.en ?? ''} onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], text: { ...ni[i].text, en: e.target.value } }; onChange({ ...element, items: ni }); }} />
                  <textarea className='rounded-md border bg-background px-2 py-1.5 text-sm' rows={2} dir='rtl' placeholder='النص' value={item.text?.ar ?? ''} onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], text: { ...ni[i].text, ar: e.target.value } }; onChange({ ...element, items: ni }); }} />
                </div>
              </div>
            ))}
            <button type='button' className='flex items-center gap-1 text-xs text-primary' onClick={() => onChange({ ...element, items: [...(element.items ?? []), { subtitle: { en: '', ar: '' }, text: { en: '', ar: '' }, example: null }] })}><Plus size={12} /> Add Item</button>
          </div>
        );

      case 'table':
        return (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-3'>
              <input className='rounded-md border bg-background px-3 py-2 text-sm' placeholder='Table Title (EN)' value={element.title?.en ?? ''} onChange={(e) => onChange({ ...element, title: { en: e.target.value, ar: element.title?.ar ?? '' } })} />
              <input className='rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='عنوان الجدول' value={element.title?.ar ?? ''} onChange={(e) => onChange({ ...element, title: { en: element.title?.en ?? '', ar: e.target.value } })} />
            </div>
            <div className='flex flex-wrap gap-2'>
              {(element.headers?.en ?? []).map((h: string, i: number) => (
                <div key={i} className='flex items-center gap-1'>
                  <input className='w-28 rounded-md border bg-background px-2 py-1.5 text-xs' placeholder={`Header ${i + 1}`} value={h} onChange={(e) => { const nh = { ...element.headers }; nh.en![i] = e.target.value; onChange({ ...element, headers: nh }); }} />
                  <button type='button' className='text-destructive' onClick={() => onChange({ ...element, headers: { en: element.headers!.en.filter((_: any, idx: number) => idx !== i), ar: element.headers!.ar.filter((_: any, idx: number) => idx !== i) }, rows: (element.rows ?? []).map(r => ({ en: r.en.filter((_: any, idx: number) => idx !== i), ar: r.ar.filter((_: any, idx: number) => idx !== i) })) })}><Trash2 size={10} /></button>
                </div>
              ))}
              <button type='button' className='flex items-center gap-1 text-xs text-primary border rounded px-2 py-1' onClick={() => onChange({ ...element, headers: { en: [...(element.headers?.en ?? []), ''], ar: [...(element.headers?.ar ?? []), ''] }, rows: (element.rows ?? []).map(r => ({ en: [...r.en, ''], ar: [...r.ar, ''] })) })}><Plus size={10} /> Col</button>
            </div>
            {(element.rows ?? []).map((row: any, ri: number) => (
              <div key={ri} className='border rounded-md p-2 space-y-1 bg-muted/10'>
                <div className='flex items-center justify-between'><span className='text-xs text-muted-foreground'>Row {ri + 1}</span><button type='button' className='text-destructive' onClick={() => onChange({ ...element, rows: element.rows!.filter((_: any, idx: number) => idx !== ri) })}><Trash2 size={10} /></button></div>
                <div className='flex gap-1 flex-wrap'>{row.en.map((cell: string, ci: number) => (<input key={ci} className='flex-1 min-w-20 rounded border bg-background px-2 py-1 text-xs' placeholder={element.headers?.en[ci] ?? `Col${ci + 1}`} value={cell} onChange={(e) => { const nr = [...element.rows!]; nr[ri] = { ...nr[ri], en: [...nr[ri].en] }; nr[ri].en[ci] = e.target.value; onChange({ ...element, rows: nr }); }} />))}</div>
                <div className='flex gap-1 flex-wrap'>{row.ar.map((cell: string, ci: number) => (<input key={ci} className='flex-1 min-w-20 rounded border bg-background px-2 py-1 text-xs' dir='rtl' placeholder={element.headers?.ar[ci] ?? `عمود${ci + 1}`} value={cell} onChange={(e) => { const nr = [...element.rows!]; nr[ri] = { ...nr[ri], ar: [...nr[ri].ar] }; nr[ri].ar[ci] = e.target.value; onChange({ ...element, rows: nr }); }} />))}</div>
              </div>
            ))}
            <button type='button' className='flex items-center gap-1 text-xs text-primary border rounded px-2 py-1' onClick={() => onChange({ ...element, rows: [...(element.rows ?? []), { en: (element.headers?.en ?? []).map(() => ''), ar: (element.headers?.ar ?? []).map(() => '') }] })}><Plus size={12} /> Add Row</button>
          </div>
        );

      default:
        return <p className='text-xs text-muted-foreground'>Element type "{element.type}" not supported yet.</p>;
    }
  };

  return (
    <div className='border rounded-lg bg-card overflow-hidden'>
      <div className='flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-muted/30 hover:bg-muted/50 transition-colors' onClick={() => setCollapsed(!collapsed)}>
        <div className='flex items-center gap-2'>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeCls}`}>{element.type}</span>
          <span className='text-xs text-muted-foreground'>Element #{index + 1}</span>
        </div>
        <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
          <button className='p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30' disabled={isFirst} onClick={() => onMove(index, 'up')} title='Move Up'><ChevronUp size={13} /></button>
          <button className='p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-30' disabled={isLast} onClick={() => onMove(index, 'down')} title='Move Down'><ChevronDown size={13} /></button>
          <button className='p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors' onClick={onDuplicate} title='Duplicate'><Copy size={13} /></button>
          <button className='p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors' onClick={onDelete} title='Delete'><Trash2 size={13} /></button>
        </div>
      </div>
      {!collapsed && <div className='p-4'>{renderFields()}</div>}
    </div>
  );
};

export default ElementItem;
