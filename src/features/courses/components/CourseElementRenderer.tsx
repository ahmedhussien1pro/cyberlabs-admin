// src/features/courses/components/CourseElementRenderer.tsx
import { useTranslation } from 'react-i18next';
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  ExternalLink,
  Terminal,
  Code2,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CourseElement,
  NoteVariant,
  I18nArray,
} from '@/core/types/curriculumCourses.types';
import type { TranslatedText } from '@/core/types/curriculumCourses.types';

type Lang = 'en' | 'ar';
const toLang = (lng: string): Lang => (lng === 'ar' ? 'ar' : 'en');
const tl = (v: TranslatedText, l: Lang) => (l === 'ar' ? (v.ar ?? v.en) : v.en);

function resolveArray(arr: TranslatedText[] | I18nArray, lang: Lang): string[] {
  if (Array.isArray(arr)) return arr.map((v) => tl(v as TranslatedText, lang));
  return lang === 'ar' ? (arr as I18nArray).ar : (arr as I18nArray).en;
}

const NOTE_CFG: Record<
  NoteVariant,
  {
    Icon: React.ElementType;
    border: string;
    bg: string;
    text: string;
    iconColor: string;
  }
> = {
  info: {
    Icon: Info,
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/8',
    text: 'text-blue-300',
    iconColor: 'text-blue-400',
  },
  warning: {
    Icon: AlertTriangle,
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/8',
    text: 'text-yellow-300',
    iconColor: 'text-yellow-400',
  },
  danger: {
    Icon: AlertOctagon,
    border: 'border-red-500/40',
    bg: 'bg-red-500/8',
    text: 'text-red-300',
    iconColor: 'text-red-400',
  },
  success: {
    Icon: CheckCircle,
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/8',
    text: 'text-emerald-300',
    iconColor: 'text-emerald-400',
  },
};

const IMG_SIZE: Record<string, string> = {
  small: 'max-w-sm mx-auto',
  medium: 'max-w-2xl mx-auto',
  large: 'max-w-4xl mx-auto',
  full: 'w-full',
};

export default function CourseElementRenderer({
  elements,
}: {
  elements: CourseElement[];
}) {
  const { i18n } = useTranslation();
  const lang = toLang(i18n.language);

  return (
    <div className='space-y-1'>
      {elements.map((el, idx) => {
        switch (el.type) {
          case 'title':
            return (
              <h3
                key={idx}
                className='text-2xl lg:text-3xl font-bold mt-10 mb-4 text-primary first:mt-0'>
                {tl(el.value, lang)}
              </h3>
            );
          case 'subtitle':
            return (
              <h4
                key={idx}
                className='text-xl font-semibold mt-7 mb-3 text-foreground/90'>
                {tl(el.value, lang)}
              </h4>
            );
          case 'text': {
            const txt = tl(el.value, lang);
            if (txt.startsWith('[INFOGRAPHIC_HINT]')) return null;
            return (
              <p
                key={idx}
                className='mb-4 text-foreground/80 leading-7 text-[15px]'>
                {txt}
              </p>
            );
          }
          case 'image': {
            const src = el.imageUrl ?? el.srcKey ?? '';
            if (!src) return null;
            const alt = el.alt ? tl(el.alt, lang) : '';
            return (
              <figure
                key={idx}
                className={cn('my-6', IMG_SIZE[el.size ?? 'full'])}>
                <img
                  src={src}
                  alt={alt}
                  className='rounded-xl border border-border shadow-md w-full h-auto object-cover cursor-zoom-in'
                  onClick={() => window.open(src, '_blank')}
                />
                {el.alt && (
                  <figcaption className='mt-2 text-xs text-muted-foreground text-center'>
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          }
          case 'video':
            return (
              <div key={idx} className='my-6'>
                <div className='rounded-xl overflow-hidden border border-border shadow-md'>
                  <iframe
                    src={el.url}
                    className='w-full aspect-video'
                    allowFullScreen
                    title={el.title ? tl(el.title, lang) : 'video'}
                  />
                </div>
                {el.title && (
                  <p className='mt-2 text-xs text-muted-foreground text-center'>
                    {tl(el.title, lang)}
                  </p>
                )}
              </div>
            );
          case 'list': {
            const items = resolveArray(
              el.items as TranslatedText[] | I18nArray,
              lang,
            );
            return (
              <div key={idx} className='my-4'>
                {el.title && (
                  <p className='font-semibold mb-2 text-foreground'>
                    {tl(el.title, lang)}
                  </p>
                )}
                <ul className='space-y-2'>
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2.5 text-[15px] text-foreground/80'>
                      <span className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          case 'orderedList':
            return (
              <div key={idx} className='my-6'>
                {el.title && (
                  <p className='font-semibold mb-3 text-foreground'>
                    {tl(el.title, lang)}
                  </p>
                )}
                <ol className='space-y-5'>
                  {el.items.map((item, i) => (
                    <li key={i} className='flex gap-4'>
                      <span className='shrink-0 mt-0.5 h-7 w-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm'>
                        {i + 1}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-foreground mb-1'>
                          {tl(item.subtitle, lang)}
                        </p>
                        <p className='text-sm text-foreground/80 leading-relaxed'>
                          {tl(item.text, lang)}
                        </p>
                        {item.example && (
                          <div className='mt-2 flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/40'>
                            <Lightbulb className='h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-400' />
                            <span>{tl(item.example, lang)}</span>
                          </div>
                        )}
                        {item.image?.imageUrl && (
                          <img
                            src={item.image.imageUrl}
                            className={cn(
                              'mt-3 rounded-lg border border-border w-full h-auto',
                              IMG_SIZE[item.image.size ?? 'medium'],
                            )}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          case 'code':
            return (
              <div
                key={idx}
                className='my-5 rounded-xl overflow-hidden border border-border shadow-sm'>
                <div className='flex items-center gap-2 px-4 py-2 bg-muted/60 border-b border-border'>
                  <Code2 className='h-4 w-4 text-muted-foreground' />
                  <span className='text-xs font-mono text-muted-foreground uppercase tracking-wider'>
                    {el.language ?? 'code'}
                  </span>
                  <div className='ms-auto flex gap-1.5'>
                    <span className='h-3 w-3 rounded-full bg-red-500/60' />
                    <span className='h-3 w-3 rounded-full bg-yellow-500/60' />
                    <span className='h-3 w-3 rounded-full bg-green-500/60' />
                  </div>
                </div>
                <pre className='p-4 bg-zinc-950 overflow-x-auto text-sm leading-relaxed'>
                  <code className='text-zinc-100 font-mono'>
                    {el.value ?? el.code}
                  </code>
                </pre>
              </div>
            );
          case 'terminal':
            return (
              <div
                key={idx}
                className='my-5 rounded-xl overflow-hidden border border-border shadow-sm'>
                <div className='flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-700'>
                  <div className='flex gap-1.5'>
                    <span className='h-3 w-3 rounded-full bg-red-500' />
                    <span className='h-3 w-3 rounded-full bg-yellow-500' />
                    <span className='h-3 w-3 rounded-full bg-green-500' />
                  </div>
                  <Terminal className='h-3.5 w-3.5 text-zinc-400 ms-2' />
                  <span className='text-xs text-zinc-400'>
                    {el.label ? tl(el.label, lang) : 'Terminal'}
                  </span>
                </div>
                <pre className='p-4 bg-zinc-950 overflow-x-auto text-sm'>
                  <code className='text-green-400 font-mono'>$ {el.value}</code>
                </pre>
              </div>
            );
          case 'note': {
            const cfg = NOTE_CFG[el.noteType ?? 'info'];
            return (
              <div
                key={idx}
                className={cn(
                  'my-5 flex gap-3 rounded-xl border p-4',
                  cfg.border,
                  cfg.bg,
                )}>
                <cfg.Icon
                  className={cn('h-5 w-5 mt-0.5 shrink-0', cfg.iconColor)}
                />
                <div className='flex-1 text-sm leading-relaxed'>
                  {el.isLab && (
                    <strong className='font-bold me-1 text-foreground'>
                      {lang === 'ar' ? 'اللابات:' : 'Labs:'}
                    </strong>
                  )}
                  <span className={cfg.text}>{tl(el.value, lang)}</span>
                  {el.link && (
                    <a
                      href={el.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ms-1.5 inline-flex items-center gap-1 underline underline-offset-2 text-primary hover:text-primary/80'>
                      {lang === 'ar' ? 'اقرأ المزيد' : 'Read more'}
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </div>
              </div>
            );
          }
          case 'table': {
            const headers = resolveArray(
              el.headers as TranslatedText[] | I18nArray,
              lang,
            );
            return (
              <div
                key={idx}
                className='my-6 overflow-x-auto rounded-xl border border-border'>
                {el.title && (
                  <div className='px-4 py-2 bg-muted/40 border-b border-border'>
                    <p className='text-sm font-semibold'>
                      {tl(el.title, lang)}
                    </p>
                  </div>
                )}
                <table className='w-full text-sm'>
                  <thead className='bg-muted/30'>
                    <tr>
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          className='px-4 py-2.5 text-start font-semibold text-foreground/80 border-b border-border'>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {el.rows.map((row, ri) => {
                      const cells = resolveArray(
                        row as TranslatedText[] | I18nArray,
                        lang,
                      );
                      return (
                        <tr
                          key={ri}
                          className='border-b border-border/50 last:border-0 hover:bg-muted/20'>
                          {cells.map((cell, ci) => (
                            <td
                              key={ci}
                              className='px-4 py-2.5 text-foreground/80'>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
          case 'hr':
            return <hr key={idx} className='my-8 border-border/40' />;
          case 'button':
            return (
              <div key={idx} className='my-4'>
                <a
                  href={el.href}
                  target={el.newTab ? '_blank' : '_self'}
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90'>
                  {tl(el.label, lang)}
                  {el.newTab && <ExternalLink className='h-3.5 w-3.5' />}
                </a>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
