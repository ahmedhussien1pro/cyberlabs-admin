// ── Element type constants & factory ──────────────────────────────────────
import type { CourseElement } from '../CourseElementRenderer';

export const ELEMENT_TYPES = [
  'text', 'title', 'subtitle', 'note', 'terminal',
  'code', 'image', 'video', 'list', 'orderedList', 'table', 'button', 'hr',
];

export const EL_COLORS: Record<string, string> = {
  text:        'bg-blue-500/10 text-blue-400 border-blue-500/30',
  title:       'bg-purple-500/10 text-purple-400 border-purple-500/30',
  subtitle:    'bg-violet-500/10 text-violet-400 border-violet-500/30',
  image:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  note:        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  terminal:    'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  code:        'bg-slate-500/10 text-slate-400 border-slate-500/30',
  table:       'bg-orange-500/10 text-orange-400 border-orange-500/30',
  orderedList: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  list:        'bg-teal-500/10 text-teal-400 border-teal-500/30',
  video:       'bg-pink-500/10 text-pink-400 border-pink-500/30',
  button:      'bg-green-500/10 text-green-400 border-green-500/30',
  hr:          'bg-muted text-muted-foreground border-border',
};

export function makeElement(type: string): CourseElement {
  const base: CourseElement = { id: Date.now() + Math.random(), type };
  if (type === 'hr')          return base;
  if (type === 'code')        return { ...base, value: '', language: 'bash' };
  if (type === 'terminal')    return { ...base, value: { en: '', ar: '' }, label: { en: 'Terminal', ar: 'تيرمينال' } };
  if (type === 'image')       return { ...base, imageUrl: '', alt: { en: '', ar: '' }, size: 'full', _localFile: null };
  if (type === 'video')       return { ...base, url: '', title: { en: '', ar: '' } };
  if (type === 'button')      return { ...base, href: '', label: { en: 'Click here', ar: 'اضغط هنا' }, newTab: true };
  if (type === 'note')        return { ...base, noteType: 'info', value: { en: '', ar: '' } };
  if (type === 'list')        return { ...base, title: { en: '', ar: '' }, items: [{ en: '', ar: '' }] };
  if (type === 'orderedList') return { ...base, title: { en: '', ar: '' }, items: [{ subtitle: { en: '', ar: '' }, text: { en: '', ar: '' } }] };
  if (type === 'table')       return { ...base, title: { en: '', ar: '' }, headers: [{ en: 'Header', ar: 'عنوان' }], rows: [[{ en: '', ar: '' }]] };
  return { ...base, value: { en: '', ar: '' } };
}
