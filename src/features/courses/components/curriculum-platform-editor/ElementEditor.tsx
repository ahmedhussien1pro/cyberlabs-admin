// ── Element Inline Editor (Image + all element types) ─────────────────────
import { useRef, useState } from 'react';
import { Loader2, ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { adminCoursesApi } from '../../services/admin-courses.api';
import type { CourseElement } from '../CourseElementRenderer';

// ── Image Element Editor ───────────────────────────────────────────────────
export function ImageElementEditor({
  el, onChange,
}: {
  el: CourseElement;
  onChange: (u: CourseElement) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>((el.imageUrl as string) || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try {
      const { url } = await adminCoursesApi.uploadImage(file);
      onChange({ ...el, imageUrl: url, _localFile: null });
      setPreview(url);
      toast.success('Image uploaded to Cloudflare ✓');
    } catch {
      toast.error('Image upload failed — check your connection');
      setPreview((el.imageUrl as string) || null);
    } finally {
      setUploading(false);
    }
  };

  const setBI = (field: string, lng: 'en' | 'ar', val: string) =>
    onChange({ ...el, [field]: { ...((el[field] as any) ?? {}), [lng]: val } });

  return (
    <div className='space-y-3'>
      {preview && (
        <div className='relative overflow-hidden rounded-lg border border-border/50 bg-muted/20'>
          <img src={preview} alt='preview' className='max-h-48 w-full object-contain' />
          {uploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
              <Loader2 className='h-6 w-6 animate-spin text-white' />
            </div>
          )}
        </div>
      )}
      <div className='flex gap-2'>
        <Input
          placeholder='Image URL (paste or upload file ↑)'
          value={(el.imageUrl as string) ?? ''}
          onChange={(e) => { onChange({ ...el, imageUrl: e.target.value }); setPreview(e.target.value || null); }}
          className='text-xs h-8 flex-1'
          disabled={uploading}
        />
        <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
        <Button variant='outline' size='sm'
          className='h-8 gap-1.5 shrink-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
          onClick={() => fileRef.current?.click()} disabled={uploading}
          title='Upload image to Cloudflare R2'>
          {uploading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ImageIcon className='h-3.5 w-3.5' />}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        {(['en', 'ar'] as const).map((lng) => (
          <Input key={lng} dir={lng === 'ar' ? 'rtl' : 'ltr'}
            placeholder={`Alt text (${lng.toUpperCase()})`}
            value={((el.alt as any)?.[lng]) ?? ''}
            onChange={(e) => setBI('alt', lng, e.target.value)}
            className='text-xs h-8' />
        ))}
      </div>
      <select
        value={(el.size as string) ?? 'full'}
        onChange={(e) => onChange({ ...el, size: e.target.value })}
        className='text-xs h-8 w-full rounded-md border border-border bg-background px-2'>
        {['small', 'medium', 'large', 'full'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// ── Generic Element Editor ─────────────────────────────────────────────────
export function ElementEditor({ el, onChange }: { el: CourseElement; onChange: (u: CourseElement) => void }) {
  const setBI = (field: string, lng: 'en' | 'ar', val: string) =>
    onChange({ ...el, [field]: { ...((el[field] as any) ?? {}), [lng]: val } });

  const BiField = ({ field, label, rows = 0 }: { field: string; label: string; rows?: number }) => (
    <div className='grid grid-cols-2 gap-2'>
      {(['en', 'ar'] as const).map((lng) =>
        rows > 0
          ? <Textarea key={lng} rows={rows} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setBI(field, lng, e.target.value)}
              className='text-xs resize-none' />
          : <Input key={lng} dir={lng === 'ar' ? 'rtl' : 'ltr'}
              placeholder={`${label} (${lng.toUpperCase()})`}
              value={((el[field] as any)?.[lng]) ?? ''}
              onChange={(e) => setBI(field, lng, e.target.value)}
              className='text-xs h-8' />
      )}
    </div>
  );

  if (el.type === 'hr')
    return <p className='text-xs italic text-muted-foreground'>Horizontal Rule — no content</p>;
  if (el.type === 'image')
    return <ImageElementEditor el={el} onChange={onChange} />;
  if (el.type === 'video') return (
    <div className='space-y-2'>
      <Input placeholder='Video embed URL' value={(el.url as string) ?? ''}
        onChange={(e) => onChange({ ...el, url: e.target.value })} className='text-xs h-8' />
      <BiField field='title' label='Title' />
    </div>
  );
  if (el.type === 'code') return (
    <div className='space-y-2'>
      <Input placeholder='Language (bash, python, js...)' value={(el.language as string) ?? ''}
        onChange={(e) => onChange({ ...el, language: e.target.value })} className='text-xs h-8 font-mono' />
      <Textarea rows={5} placeholder='Code...' value={(el.value as string) ?? ''}
        onChange={(e) => onChange({ ...el, value: e.target.value })} className='text-xs font-mono resize-none' />
    </div>
  );
  if (el.type === 'note') return (
    <div className='space-y-2'>
      <select value={(el.noteType as string) ?? 'info'}
        onChange={(e) => onChange({ ...el, noteType: e.target.value as any })}
        className='text-xs h-8 w-full rounded-md border border-border bg-background px-2'>
        {['info', 'warning', 'danger', 'success'].map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <BiField field='value' label='Content' rows={3} />
      <Input placeholder='Link URL (optional)' value={(el.link as string) ?? ''}
        onChange={(e) => onChange({ ...el, link: e.target.value })} className='text-xs h-8' />
    </div>
  );
  if (el.type === 'terminal') return (
    <div className='space-y-2'>
      <BiField field='label' label='Label' />
      <BiField field='value' label='Command' rows={3} />
    </div>
  );
  if (el.type === 'button') return (
    <div className='space-y-2'>
      <BiField field='label' label='Button text' />
      <Input placeholder='URL' value={(el.href as string) ?? ''}
        onChange={(e) => onChange({ ...el, href: e.target.value })} className='text-xs h-8' />
    </div>
  );
  if (el.type === 'list') {
    const items: { en: string; ar: string }[] = Array.isArray(el.items)
      ? (el.items as any[]).map((i) => (typeof i === 'object' && 'en' in i ? i : { en: String(i), ar: '' }))
      : [];
    return (
      <div className='space-y-2'>
        <BiField field='title' label='List title (optional)' />
        <div className='space-y-1.5'>
          {items.map((item, i) => (
            <div key={i} className='flex gap-1.5'>
              <Input placeholder='Item (EN)' value={item.en} className='text-xs h-7'
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], en: e.target.value }; onChange({ ...el, items: n }); }} />
              <Input placeholder='عنصر (AR)' value={item.ar} dir='rtl' className='text-xs h-7'
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], ar: e.target.value }; onChange({ ...el, items: n }); }} />
              <button onClick={() => onChange({ ...el, items: items.filter((_, j) => j !== i) })}
                className='shrink-0 text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
            </div>
          ))}
          <button onClick={() => onChange({ ...el, items: [...items, { en: '', ar: '' }] })}
            className='text-xs text-primary hover:underline'>+ Add item</button>
        </div>
      </div>
    );
  }
  if (el.type === 'orderedList') {
    const items: { subtitle: { en: string; ar: string }; text: { en: string; ar: string } }[] =
      Array.isArray(el.items)
        ? (el.items as any[]).map((i) =>
            'subtitle' in i ? i : { subtitle: { en: String(i), ar: '' }, text: { en: '', ar: '' } })
        : [];
    return (
      <div className='space-y-2'>
        <BiField field='title' label='Title (optional)' />
        <div className='space-y-3'>
          {items.map((item, i) => (
            <div key={i} className='rounded-lg border border-border/50 bg-muted/20 p-2 space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground font-semibold'>Item {i + 1}</span>
                <button onClick={() => onChange({ ...el, items: items.filter((_, j) => j !== i) })}
                  className='text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
              </div>
              <div className='grid grid-cols-2 gap-1.5'>
                <Input placeholder='Subtitle (EN)' value={item.subtitle.en} className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], subtitle: { ...n[i].subtitle, en: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='العنوان (AR)' value={item.subtitle.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], subtitle: { ...n[i].subtitle, ar: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='Text (EN)' value={item.text.en} className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: { ...n[i].text, en: e.target.value } }; onChange({ ...el, items: n }); }} />
                <Input placeholder='النص (AR)' value={item.text.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const n = [...items]; n[i] = { ...n[i], text: { ...n[i].text, ar: e.target.value } }; onChange({ ...el, items: n }); }} />
              </div>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...el, items: [...items, { subtitle: { en: '', ar: '' }, text: { en: '', ar: '' } }] })}
            className='text-xs text-primary hover:underline'>+ Add item</button>
        </div>
      </div>
    );
  }
  if (el.type === 'table') {
    const headers: { en: string; ar: string }[] = Array.isArray(el.headers)
      ? (el.headers as any[]).map((h) => (typeof h === 'object' && 'en' in h ? h : { en: String(h), ar: '' }))
      : [];
    const rows: { en: string; ar: string }[][] = (el.rows ?? []).map((r) =>
      Array.isArray(r)
        ? (r as any[]).map((c) => (typeof c === 'object' && 'en' in c ? c : { en: String(c), ar: '' }))
        : []
    );
    const updateHeaders = (nh: typeof headers) => onChange({ ...el, headers: nh });
    const updateRows    = (nr: typeof rows)    => onChange({ ...el, rows: nr });
    return (
      <div className='space-y-2'>
        <BiField field='title' label='Table title (optional)' />
        <p className='text-xs font-semibold text-muted-foreground'>Headers</p>
        {headers.map((h, i) => (
          <div key={i} className='flex gap-1.5'>
            <Input placeholder='Header (EN)' value={h.en} className='text-xs h-7'
              onChange={(e) => { const n = [...headers]; n[i] = { ...n[i], en: e.target.value }; updateHeaders(n); }} />
            <Input placeholder='العنوان (AR)' value={h.ar} dir='rtl' className='text-xs h-7'
              onChange={(e) => { const n = [...headers]; n[i] = { ...n[i], ar: e.target.value }; updateHeaders(n); }} />
            <button onClick={() => updateHeaders(headers.filter((_, j) => j !== i))}
              className='shrink-0 text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
          </div>
        ))}
        <button onClick={() => updateHeaders([...headers, { en: '', ar: '' }])}
          className='text-xs text-primary hover:underline'>+ Add header</button>
        <p className='text-xs font-semibold text-muted-foreground mt-2'>Rows</p>
        {rows.map((row, ri) => (
          <div key={ri} className='rounded border border-border/40 bg-muted/10 p-1.5 space-y-1'>
            <div className='flex justify-between items-center'>
              <span className='text-xs text-muted-foreground'>Row {ri + 1}</span>
              <button onClick={() => updateRows(rows.filter((_, j) => j !== ri))}
                className='text-muted-foreground hover:text-destructive'><Trash2 className='h-3 w-3' /></button>
            </div>
            {row.map((cell, ci) => (
              <div key={ci} className='grid grid-cols-2 gap-1.5'>
                <Input placeholder={`Cell ${ci + 1} (EN)`} value={cell.en} className='text-xs h-7'
                  onChange={(e) => { const nr = rows.map((r, ri2) => ri2 === ri ? r.map((c, ci2) => ci2 === ci ? { ...c, en: e.target.value } : c) : r); updateRows(nr); }} />
                <Input placeholder={`خلية ${ci + 1} (AR)`} value={cell.ar} dir='rtl' className='text-xs h-7'
                  onChange={(e) => { const nr = rows.map((r, ri2) => ri2 === ri ? r.map((c, ci2) => ci2 === ci ? { ...c, ar: e.target.value } : c) : r); updateRows(nr); }} />
              </div>
            ))}
          </div>
        ))}
        <button onClick={() => updateRows([...rows, headers.map(() => ({ en: '', ar: '' }))])}
          className='text-xs text-primary hover:underline'>+ Add row</button>
      </div>
    );
  }
  return <BiField field='value' label='Content' rows={['text', 'orderedList'].includes(el.type) ? 3 : 0} />;
}
