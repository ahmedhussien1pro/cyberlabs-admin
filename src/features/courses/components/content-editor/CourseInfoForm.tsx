import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, Users, Star, BarChart, Link, Image, Upload, X } from 'lucide-react';

export interface CourseInfoData {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  difficulty: { en: string; ar: string };
  duration: { en: string; ar: string };
  instructor: string;
  rating: string;
  students: string;
  courseImage: string;
  labsLink: { link: string };
}

const DEFAULT_INFO: CourseInfoData = {
  title: { en: '', ar: '' },
  description: { en: '', ar: '' },
  difficulty: { en: '', ar: '' },
  duration: { en: '', ar: '' },
  instructor: '',
  rating: '',
  students: '',
  courseImage: '',
  labsLink: { link: '' },
};

interface CourseInfoFormProps {
  courseInfo: CourseInfoData;
  onChange: (data: CourseInfoData) => void;
}

const CourseInfoForm: React.FC<CourseInfoFormProps> = ({ courseInfo, onChange }) => {
  const [data, setData] = useState<CourseInfoData>({ ...DEFAULT_INFO, ...courseInfo });
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  useEffect(() => { setData({ ...DEFAULT_INFO, ...courseInfo }); }, [courseInfo]);

  const set = (field: keyof CourseInfoData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onChange(updated);
  };

  const setLang = (field: keyof CourseInfoData, lang: 'en' | 'ar', val: string) => {
    const updated = { ...data, [field]: { ...(data[field] as any), [lang]: val } };
    setData(updated);
    onChange(updated);
  };

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => set('courseImage', reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className='rounded-xl border bg-card p-6 space-y-6'>
      <div className='flex items-center gap-2 pb-2 border-b'>
        <GraduationCap size={18} className='text-primary' />
        <h3 className='font-semibold text-sm'>Landing Section Data</h3>
      </div>

      {/* Title */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 block'>Course Title (EN) *</label>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='e.g., Broken Access Control' value={data.title.en} onChange={(e) => setLang('title', 'en', e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 block'>Course Title (AR)</label>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='مثال: ثغرات التحكم في الوصول' value={data.title.ar} onChange={(e) => setLang('title', 'ar', e.target.value)} />
        </div>
      </div>

      {/* Description */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 block'>Description (EN)</label>
          <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={3} placeholder='Learn how authorization failures...' value={data.description.en} onChange={(e) => setLang('description', 'en', e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 block'>Description (AR)</label>
          <textarea className='w-full rounded-md border bg-background px-3 py-2 text-sm' rows={3} dir='rtl' placeholder='تعلم كيف تؤدي إخفاقات التفويض...' value={data.description.ar} onChange={(e) => setLang('description', 'ar', e.target.value)} />
        </div>
      </div>

      {/* Difficulty & Duration */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><BarChart size={12} /> Difficulty (EN / AR)</label>
          <div className='flex gap-2'>
            <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm' placeholder='Intermediate' value={data.difficulty.en} onChange={(e) => setLang('difficulty', 'en', e.target.value)} />
            <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='متوسط' value={data.difficulty.ar} onChange={(e) => setLang('difficulty', 'ar', e.target.value)} />
          </div>
        </div>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><Clock size={12} /> Duration (EN / AR)</label>
          <div className='flex gap-2'>
            <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm' placeholder='45 min' value={data.duration.en} onChange={(e) => setLang('duration', 'en', e.target.value)} />
            <input className='flex-1 rounded-md border bg-background px-3 py-2 text-sm' dir='rtl' placeholder='45 دقيقة' value={data.duration.ar} onChange={(e) => setLang('duration', 'ar', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4'>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><Users size={12} /> Instructor</label>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='CyberLab' value={data.instructor} onChange={(e) => set('instructor', e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><Star size={12} /> Rating</label>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='4.9' value={data.rating} onChange={(e) => set('rating', e.target.value)} />
        </div>
        <div>
          <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><Users size={12} /> Students</label>
          <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='3400' value={data.students} onChange={(e) => set('students', e.target.value)} />
        </div>
      </div>

      {/* Labs Link */}
      <div>
        <label className='text-xs text-muted-foreground mb-1.5 flex items-center gap-1'><Link size={12} /> Labs Link</label>
        <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='/cookies/cookies_lab' value={data.labsLink?.link ?? ''} onChange={(e) => set('labsLink', { link: e.target.value })} />
      </div>

      {/* Course Image */}
      <div>
        <label className='text-xs text-muted-foreground mb-2 flex items-center gap-1'><Image size={12} /> Course Image</label>
        <div className='flex gap-2 mb-2'>
          <button type='button' className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${imageMode === 'url' ? 'bg-primary text-primary-foreground border-primary' : ''}`} onClick={() => setImageMode('url')}><Link size={11} /> URL</button>
          <button type='button' className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors ${imageMode === 'upload' ? 'bg-primary text-primary-foreground border-primary' : ''}`} onClick={() => setImageMode('upload')}><Upload size={11} /> Upload</button>
        </div>
        {imageMode === 'url' && <input className='w-full rounded-md border bg-background px-3 py-2 text-sm' placeholder='https://example.com/image.jpg' value={data.courseImage} onChange={(e) => set('courseImage', e.target.value)} />}
        {imageMode === 'upload' && (
          <label className='flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/30 transition-colors'>
            <input type='file' accept='image/*' className='hidden' onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            <Upload size={20} className='text-muted-foreground mb-1' />
            <span className='text-xs text-muted-foreground'>Click to upload (max 5MB)</span>
          </label>
        )}
        {data.courseImage && (
          <div className='relative mt-2'>
            <button type='button' className='absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white z-10' onClick={() => set('courseImage', '')}><X size={12} /></button>
            <img src={data.courseImage} alt='course preview' className='rounded-md max-h-40 object-contain w-full border' />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseInfoForm;
export { DEFAULT_INFO };
