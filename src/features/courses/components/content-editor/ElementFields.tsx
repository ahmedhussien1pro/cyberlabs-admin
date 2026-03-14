import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import type { ContentElement } from './TopicEditor';

const LangTabs = ({ lang, setLang }: { lang: 'en' | 'ar'; setLang: (l: 'en' | 'ar') => void }) => (
  <div className='flex gap-1 mb-3'>
    {(['en', 'ar'] as const).map((l) => (
      <button key={l} type='button'
        className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
          lang === l ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-transparent'
        }`}
        onClick={() => setLang(l)}>
        {l === 'en' ? 'English' : 'العربية'}
      </button>
    ))}
  </div>
);

export const ElementFields: React.FC<{
  element: ContentElement;
  onChange: (el: ContentElement) => void;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}> = ({ element, onChange, imageMap, onImageUpload }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const tabs = <LangTabs lang={lang} setLang={setLang} />;

  switch (element.type) {
    case 'text': case 'title': case 'subtitle':
      return (
        <div>{tabs}
          {lang === 'en'
            ? <RichTextEditor value={element.value?.en ?? ''} onChange={(v) => onChange({ ...element, value: { ...element.value, en: v } })} dir='ltr' />
            : <RichTextEditor value={element.value?.ar ?? ''} onChange={(v) => onChange({ ...element, value: { ...element.value, ar: v } })} dir='rtl' />}
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
                {['small','medium','large'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className='flex gap-2'>
            {['url','upload'].map((m) => (
              <button key={m} type='button'
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                  (m === 'url' ? element.imageMode !== 'upload' : element.imageMode === 'upload') ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                }`}
                onClick={() => onChange({ ...element, imageMode: m, imageUrl: m === 'url' ? '' : element.imageUrl })}>
                {m === 'url' ? 'URL' : 'Upload'}
              </button>
            ))}
          </div>
          {(!element.imageMode || element.imageMode === 'url') && (
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://example.com/image.jpg' value={element.imageUrl ?? ''} onChange={(e) => onChange({ ...element, imageUrl: e.target.value })} />
          )}
          {element.imageMode === 'upload' && (
            <label className='flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 transition-colors'>
              <input type='file' accept='image/*' className='hidden' onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
                if (!element.srcKey) { toast.error('Set an Image Key first'); return; }
                onImageUpload(element.srcKey, file);
              }} />
              <span className='text-xs text-muted-foreground'>Click to upload (PNG, JPG, WEBP, max 5MB)</span>
            </label>
          )}
          {(imageMap[element.srcKey ?? ''] || element.imageUrl) && (
            <img src={imageMap[element.srcKey ?? ''] || element.imageUrl} alt='preview' className='rounded-md max-h-48 object-contain w-full border mt-2' />
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
        <div className='space-y-3'>{tabs}
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Label</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder={lang === 'en' ? 'Terminal' : 'تيرمينال'} dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.label?.en ?? '') : (element.label?.ar ?? '')}
              onChange={(e) => onChange({ ...element, label: lang === 'en' ? { en: e.target.value, ar: element.label?.ar ?? '' } : { en: element.label?.en ?? '', ar: e.target.value } })} />
          </div>
          <textarea className='w-full rounded-md border bg-zinc-900 text-green-400 px-3 py-2 text-sm font-mono' rows={4} placeholder='$ command here...' value={element.value ?? ''} onChange={(e) => onChange({ ...element, value: e.target.value })} />
        </div>
      );

    case 'note': {
      const NOTE_COLORS: Record<string, string> = { info:'border-blue-500/40 bg-blue-500/10', warning:'border-yellow-500/40 bg-yellow-500/10', success:'border-green-500/40 bg-green-500/10', danger:'border-red-500/40 bg-red-500/10' };
      return (
        <div className={`space-y-3 p-3 rounded-md border ${NOTE_COLORS[element.noteType ?? 'info']}`}>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-muted-foreground mb-1 block'>Note Type</label>
              <select className='w-full rounded-md border bg-background px-3 py-2 text-sm' value={element.noteType ?? 'info'} onChange={(e) => onChange({ ...element, noteType: e.target.value })}>
                <option value='info'>Info (Blue)</option><option value='warning'>Warning (Orange)</option><option value='success'>Success (Green)</option><option value='danger'>Danger (Red)</option>
              </select>
            </div>
            <div>
              <label className='text-xs text-muted-foreground mb-1 block'>Link (optional)</label>
              <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://...' value={element.link ?? ''} onChange={(e) => onChange({ ...element, link: e.target.value })} />
            </div>
          </div>
          {tabs}
          <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={3} placeholder={lang === 'en' ? 'Note text...' : 'نص الملاحظة...'} dir={lang === 'ar' ? 'rtl' : 'ltr'}
            value={lang === 'en' ? (element.value?.en ?? '') : (element.value?.ar ?? '')}
            onChange={(e) => onChange({ ...element, value: lang === 'en' ? { ...element.value, en: e.target.value } : { ...element.value, ar: e.target.value } })} />
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <input type='checkbox' checked={element.isLab ?? false} onChange={(e) => onChange({ ...element, isLab: e.target.checked })} />
            This is a Lab Link
          </label>
        </div>
      );
    }

    case 'hr':
      return (
        <div className='flex items-center gap-3 py-2'>
          <div className='flex-1 border-t border-dashed border-muted-foreground/40' />
          <span className='text-xs text-muted-foreground'>Divider</span>
          <div className='flex-1 border-t border-dashed border-muted-foreground/40' />
        </div>
      );

    case 'video':
      return (
        <div className='space-y-3'>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://youtube.com/embed/...' value={element.url ?? ''} onChange={(e) => onChange({ ...element, url: e.target.value })} />
          {tabs}
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Caption</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder={lang === 'en' ? 'Video caption' : 'عنوان الفيديو'} dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.caption?.en ?? '') : (element.caption?.ar ?? '')}
              onChange={(e) => onChange({ ...element, caption: lang === 'en' ? { en: e.target.value, ar: element.caption?.ar ?? '' } : { en: element.caption?.en ?? '', ar: e.target.value } })} />
          </div>
          {element.url && <iframe src={element.url} width='100%' height='240' className='rounded-md border' allowFullScreen title='video preview' />}
        </div>
      );

    case 'list':
      return (
        <div className='space-y-3'>{tabs}
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Title (optional)</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder={lang === 'en' ? 'Optional title' : 'عنوان اختياري'} dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({ ...element, title: lang === 'en' ? { en: e.target.value, ar: element.title?.ar ?? '' } : { en: element.title?.en ?? '', ar: e.target.value } })} />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Items</label>
            {(element.items?.[lang] ?? []).map((item: string, i: number) => (
              <div key={i} className='flex gap-1 mb-1'>
                <input className='flex-1 rounded-md border bg-background px-2 py-1.5 text-sm' dir={lang === 'ar' ? 'rtl' : 'ltr'} value={item}
                  onChange={(e) => { const ne = [...element.items[lang]]; ne[i] = e.target.value; onChange({ ...element, items: { ...element.items, [lang]: ne } }); }} />
                <button type='button' className='text-destructive hover:bg-destructive/10 rounded p-1'
                  onClick={() => onChange({ ...element, items: { en: element.items.en.filter((_: any, idx: number) => idx !== i), ar: element.items.ar.filter((_: any, idx: number) => idx !== i) } })}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button type='button' className='flex items-center gap-1 text-xs text-primary mt-1'
              onClick={() => onChange({ ...element, items: { en: [...(element.items?.en ?? []), ''], ar: [...(element.items?.ar ?? []), ''] } })}>
              <Plus size={12} /> Add Item
            </button>
          </div>
        </div>
      );

    case 'orderedList':
      return (
        <div className='space-y-3'>{tabs}
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Title</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({ ...element, title: lang === 'en' ? { en: e.target.value, ar: element.title?.ar ?? '' } : { en: element.title?.en ?? '', ar: e.target.value } })} />
          </div>
          {(element.items ?? []).map((item: any, i: number) => (
            <div key={i} className='border rounded-md p-3 space-y-2 bg-muted/20'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>Item {i + 1}</span>
                <button type='button' className='text-destructive hover:bg-destructive/10 rounded p-1'
                  onClick={() => onChange({ ...element, items: element.items.filter((_: any, idx: number) => idx !== i) })}><Trash2 size={12} /></button>
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Subtitle</label>
                <input className='rounded-md border bg-background px-2 py-1.5 text-sm w-full' dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder={lang === 'en' ? 'Subtitle' : 'العنوان الفرعي'} value={item.subtitle?.[lang] ?? ''}
                  onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], subtitle: { ...ni[i].subtitle, [lang]: e.target.value } }; onChange({ ...element, items: ni }); }} />
              </div>
              <div>
                <label className='text-xs text-muted-foreground mb-1 block'>Text</label>
                <textarea className='rounded-md border bg-background px-2 py-1.5 text-sm w-full' rows={2} dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder={lang === 'en' ? 'Text' : 'النص'} value={item.text?.[lang] ?? ''}
                  onChange={(e) => { const ni = [...element.items]; ni[i] = { ...ni[i], text: { ...ni[i].text, [lang]: e.target.value } }; onChange({ ...element, items: ni }); }} />
              </div>
            </div>
          ))}
          <button type='button' className='flex items-center gap-1 text-xs text-primary'
            onClick={() => onChange({ ...element, items: [...(element.items ?? []), { subtitle: { en: '', ar: '' }, text: { en: '', ar: '' }, example: null }] })}>
            <Plus size={12} /> Add Item
          </button>
        </div>
      );

    case 'table':
      return (
        <div className='space-y-3'>{tabs}
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>Table Title</label>
            <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder={lang === 'en' ? 'Table Title' : 'عنوان الجدول'}
              value={lang === 'en' ? (element.title?.en ?? '') : (element.title?.ar ?? '')}
              onChange={(e) => onChange({ ...element, title: lang === 'en' ? { en: e.target.value, ar: element.title?.ar ?? '' } : { en: element.title?.en ?? '', ar: e.target.value } })} />
          </div>
          <div className='flex flex-wrap gap-2 items-center'>
            <span className='text-xs text-muted-foreground'>Headers:</span>
            {(element.headers?.[lang] ?? []).map((h: string, i: number) => (
              <div key={i} className='flex items-center gap-1'>
                <input className='w-24 rounded-md border bg-background px-2 py-1.5 text-xs' placeholder={`Header ${i + 1}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} value={h}
                  onChange={(e) => { const nh = { en: [...(element.headers?.en ?? [])], ar: [...(element.headers?.ar ?? [])] }; nh[lang][i] = e.target.value; onChange({ ...element, headers: nh }); }} />
                <button type='button' className='text-destructive'
                  onClick={() => onChange({ ...element, headers: { en: element.headers!.en.filter((_: any, idx: number) => idx !== i), ar: element.headers!.ar.filter((_: any, idx: number) => idx !== i) }, rows: (element.rows ?? []).map(r => ({ en: r.en.filter((_: any, idx: number) => idx !== i), ar: r.ar.filter((_: any, idx: number) => idx !== i) })) })}>
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <button type='button' className='flex items-center gap-1 text-xs text-primary border rounded px-2 py-1'
              onClick={() => onChange({ ...element, headers: { en: [...(element.headers?.en ?? []), ''], ar: [...(element.headers?.ar ?? []), ''] }, rows: (element.rows ?? []).map(r => ({ en: [...r.en, ''], ar: [...r.ar, ''] })) })}>
              <Plus size={10} /> Col
            </button>
          </div>
          {(element.rows ?? []).map((row: any, ri: number) => (
            <div key={ri} className='border rounded-md p-2 space-y-1 bg-muted/10'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>Row {ri + 1}</span>
                <button type='button' className='text-destructive' onClick={() => onChange({ ...element, rows: element.rows!.filter((_: any, idx: number) => idx !== ri) })}><Trash2 size={10} /></button>
              </div>
              <div className='flex gap-1 flex-wrap'>
                {row[lang].map((cell: string, ci: number) => (
                  <input key={ci} className='flex-1 min-w-20 rounded border bg-background px-2 py-1 text-xs' dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder={element.headers?.[lang][ci] ?? `Col${ci + 1}`} value={cell}
                    onChange={(e) => { const nr = [...element.rows!]; nr[ri] = { ...nr[ri], [lang]: [...nr[ri][lang]] }; nr[ri][lang][ci] = e.target.value; onChange({ ...element, rows: nr }); }} />
                ))}
              </div>
            </div>
          ))}
          <button type='button' className='flex items-center gap-1 text-xs text-primary border rounded px-2 py-1'
            onClick={() => onChange({ ...element, rows: [...(element.rows ?? []), { en: (element.headers?.en ?? []).map(() => ''), ar: (element.headers?.ar ?? []).map(() => '') }] })}>
            <Plus size={12} /> Add Row
          </button>
        </div>
      );

    default:
      return <p className='text-xs text-muted-foreground'>Element type "{element.type}" not supported yet.</p>;
  }
};
