import { Clock, Shield, BookOpen, FlaskConical, Users, Heart, Rocket, Unlock, Crown, Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MatrixRain } from '@/shared/components/common/matrix-rain';
import type { AdminCourse } from '../../../types/admin-course.types';
import { MATRIX_COLOR, STRIPE, BLOOM, TEXT_COLOR, FALLBACK_BG, ACCESS_BADGE } from './color-maps';
import { Stat } from './Stat';

const ACCESS_ICON: Record<string, React.ElementType> = {
  FREE: Unlock, PRO: Crown, PREMIUM: Gem,
};

export interface FormState {
  title: string; ar_title: string; color: string; image: string; thumbnail: string;
  access: string; difficulty: string; category: string; contentType: string; state: string;
  isNew: boolean; isFeatured: boolean; estimatedHours: string;
  description: string; ar_description: string;
  longDescription: string; ar_longDescription: string;
  labsLink: string; instructorId: string;
  skills: string[]; ar_skills: string[];
  topics: string[]; ar_topics: string[];
  prerequisites: string[]; ar_prerequisites: string[];
  tags: string[];
}

export function LiveHeroPreview({ form, course, isAr }: {
  form: FormState;
  course: AdminCourse;
  isAr: boolean;
}) {
  const col        = (form.color ?? 'blue').toLowerCase();
  const matrixHex  = MATRIX_COLOR[col] ?? '#3b82f6';
  const textCls    = TEXT_COLOR[col] ?? 'text-blue-400';
  const imgSrc     = form.image || form.thumbnail || course.image || course.thumbnail;
  const comingSoon = form.state === 'COMING_SOON';
  const AccessIcon = ACCESS_ICON[form.access ?? 'FREE'] ?? Unlock;
  const title = isAr ? form.ar_title || form.title : form.title;
  const desc  = isAr ? form.ar_description || form.description : form.description;

  return (
    <div className='rounded-xl overflow-hidden border border-border/50 bg-background' dir={isAr ? 'rtl' : 'ltr'}>
      <section className='relative overflow-hidden border-b border-white/8 bg-zinc-950'>
        <div className={cn('absolute inset-x-0 top-0 z-[3] h-[3px]', STRIPE[col] ?? 'bg-blue-500')} />
        <MatrixRain color={matrixHex} opacity={0.07} speed={6} />
        <div aria-hidden className={cn('pointer-events-none absolute -start-20 -top-10 z-[2] h-56 w-56 rounded-full blur-3xl opacity-[0.12]', BLOOM[col] ?? 'bg-blue-500')} />
        <div className='container relative z-[4] mx-auto px-4'>
          <div className='py-6'>
            <nav className='mb-4 flex items-center gap-1 text-[11px] text-white/35'>
              <span>{isAr ? 'الكورسات' : 'Courses'}</span>
              <span className='mx-1 text-white/20'>/</span>
              <span className='truncate text-white/65'>{title || (isAr ? 'عنوان الكورس' : 'Course Title')}</span>
            </nav>
            <div className='flex flex-col gap-5 min-w-0'>
              <div className='flex items-start gap-4'>
                <div className='hidden sm:block shrink-0'>
                  <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10'>
                    {imgSrc ? (
                      <img src={imgSrc} alt={title ?? ''} className='h-full w-full object-cover' />
                    ) : (
                      <div className={cn('h-full w-full flex items-center justify-center bg-gradient-to-br border border-white/10', FALLBACK_BG[col] ?? 'from-zinc-900 to-zinc-800')}>
                        <p className={cn('text-[9px] font-black text-center px-1.5 leading-tight', TEXT_COLOR[col])}>
                          {(title || 'Course')?.slice(0, 12)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <Badge variant='outline' className={cn('rounded-full text-[11px] font-bold gap-1', ACCESS_BADGE[form.access ?? 'FREE'] ?? ACCESS_BADGE.FREE)}>
                      <AccessIcon className='h-2.5 w-2.5' /> {form.access ?? 'FREE'}
                    </Badge>
                    {form.difficulty && (
                      <Badge variant='outline' className='rounded-full border-white/20 text-[11px] text-white/65 gap-1'>
                        <Shield className='h-2.5 w-2.5' /> {form.difficulty}
                      </Badge>
                    )}
                    {form.category && (
                      <Badge variant='outline' className='rounded-full border-white/15 text-[11px] text-white/50'>
                        {form.category.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {form.isNew && <span className='inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white'>{isAr ? 'جديد' : 'New'}</span>}
                    {comingSoon && <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-600/80 px-2 py-0.5 text-[10px] font-bold text-white'><Clock className='h-2.5 w-2.5' />{isAr ? 'قريباً' : 'Coming Soon'}</span>}
                  </div>
                  <h1 className='text-xl font-black leading-tight tracking-tight text-white sm:text-2xl'>
                    {title || <span className='opacity-30 italic'>{isAr ? 'عنوان الكورس' : 'Course Title'}</span>}
                  </h1>
                  {desc && <p className='mt-2 max-w-2xl text-sm leading-relaxed text-white/60'>{desc}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 py-3'>
            <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
              {(course.totalTopics ?? 0) > 0 && <Stat icon={<BookOpen className='h-3.5 w-3.5' />} value={course.totalTopics} label={isAr ? 'موضوع' : 'Topics'} textClass={textCls} />}
              {Number(form.estimatedHours) > 0 && <Stat icon={<Clock className='h-3.5 w-3.5' />} value={`${form.estimatedHours}h`} label='est.' textClass={textCls} />}
              <div className='flex items-center gap-1.5 text-xs'><span className={textCls}><FlaskConical className='h-3.5 w-3.5' /></span><span className='font-bold text-white'>{isAr ? 'مختبرات' : 'Labs'}</span></div>
              {(course.enrollmentCount ?? 0) > 0 && <Stat icon={<Users className='h-3.5 w-3.5' />} value={(course.enrollmentCount ?? 0).toLocaleString()} label={isAr ? 'مسجل' : 'enrolled'} textClass={textCls} />}
            </div>
            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/50 cursor-default'>
                <Heart className='h-3.5 w-3.5' /> {isAr ? 'حفظ' : 'Save'}
              </button>
              <button className={cn('flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white cursor-default', comingSoon ? 'border border-white/15 bg-white/5 text-white/50' : 'bg-primary')}>
                {comingSoon ? <><Clock className='h-3.5 w-3.5' />{isAr ? 'قريباً' : 'Coming Soon'}</> : <><Rocket className='h-3.5 w-3.5' />{isAr ? 'ابدأ مجاناً' : 'Start Free'}</>}
              </button>
            </div>
          </div>
        </div>
      </section>
      {(isAr ? form.ar_longDescription : form.longDescription) && (
        <div className='px-5 pt-6'><div className='p-4 rounded-xl border border-border/40 bg-muted/20'><p className='text-sm text-foreground/70 leading-7'>{isAr ? form.ar_longDescription : form.longDescription}</p></div></div>
      )}
      {(form.skills.length > 0 || form.prerequisites.length > 0) && (
        <div className='bg-zinc-900/60 px-5 py-3 flex flex-wrap gap-4 border-t border-white/5 mt-4'>
          {form.skills.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>{isAr ? 'مهارات' : 'Skills'}</p>
              <div className='flex flex-wrap gap-1'>
                {(isAr && form.ar_skills.length > 0 ? form.ar_skills : form.skills).slice(0, 4).map((s) => (
                  <span key={s} className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50'>{s}</span>
                ))}
                {form.skills.length > 4 && <span className='text-[10px] text-white/30'>+{form.skills.length - 4}</span>}
              </div>
            </div>
          )}
          {form.prerequisites.length > 0 && (
            <div>
              <p className='text-[10px] text-white/30 mb-1'>{isAr ? 'متطلبات' : 'Prerequisites'}</p>
              <div className='flex flex-wrap gap-1'>
                {(isAr && form.ar_prerequisites.length > 0 ? form.ar_prerequisites : form.prerequisites).slice(0, 3).map((s) => (
                  <span key={s} className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50'>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
