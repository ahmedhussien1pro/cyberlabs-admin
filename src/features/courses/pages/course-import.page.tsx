// src/features/courses/pages/course-import.page.tsx
// Bulk import: paste a full course JSON (with curriculum) and create it in one shot
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Upload, FileJson, AlertTriangle,
  CheckCircle2, Loader2, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { coursesApi } from '../services/courses.api';
import { adminCoursesApi } from '../services/admin-courses.api';
import { ROUTES } from '@/shared/constants';
import type { CourseCreateDto } from '../types/course.types';

interface ImportPayload {
  title: string;
  ar_title?: string;
  slug: string;
  description?: string;
  ar_description?: string;
  difficulty: string;
  access: string;
  category: string;
  color: string;
  contentType: string;
  instructorId?: string;
  estimatedHours?: number;
  topics?: Array<{ id?: string; title: { en: string; ar: string }; elements: object[] }>;
  [key: string]: unknown;
}

function parseImport(raw: string): ImportPayload {
  const parsed = JSON.parse(raw);
  if (typeof parsed !== 'object' || !parsed.title || !parsed.slug) {
    throw new Error('JSON must include at least: title, slug');
  }
  return parsed as ImportPayload;
}

function PreviewCard({ payload }: { payload: ImportPayload }) {
  return (
    <Card className='border-primary/30 bg-primary/5'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <CheckCircle2 className='h-4 w-4 text-emerald-400' />
          Parsed Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
          <div>
            <p className='text-xs text-muted-foreground'>Title</p>
            <p className='font-semibold'>{payload.title}</p>
          </div>
          {payload.ar_title && (
            <div dir='rtl'>
              <p className='text-xs text-muted-foreground'>العنوان</p>
              <p className='font-semibold'>{payload.ar_title}</p>
            </div>
          )}
          <div>
            <p className='text-xs text-muted-foreground'>Slug</p>
            <p className='font-mono text-xs'>{payload.slug}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Access / Difficulty</p>
            <p>{payload.access} · {payload.difficulty}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Color</p>
            <p className='font-mono text-xs'>{(payload.color ?? '').toLowerCase()}</p>
          </div>
        </div>
        {(payload.topics?.length ?? 0) > 0 && (
          <div className='flex items-center gap-2 pt-2 border-t border-border/40'>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>
              <strong>{payload.topics!.length}</strong> topics will be imported
            </span>
            <Badge variant='outline' className='ml-auto text-xs'>Curriculum included</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CourseImportPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState('');
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [parseError, setParseError] = useState('');

  const tryParse = (text: string) => {
    setParseError('');
    try {
      const p = parseImport(text);
      setPayload(p);
    } catch (e: any) {
      setPayload(null);
      setParseError(e.message ?? 'Invalid JSON');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRaw(text);
      tryParse(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!payload) throw new Error('Nothing to import');

      // ✅ color must always be lowercase to match backend/prisma enum
      const dto: CourseCreateDto = {
        title:       payload.title,
        ar_title:    payload.ar_title,
        slug:        payload.slug,
        description: payload.description,
        difficulty:  (payload.difficulty as any)               ?? 'BEGINNER',
        access:      (payload.access    as any)               ?? 'FREE',
        category:    (payload.category  as any)               ?? 'FUNDAMENTALS',
        color:       ((payload.color as string)?.toLowerCase() ?? 'blue') as any,
        contentType: (payload.contentType as any)             ?? 'MIXED',
        instructorId: payload.instructorId ?? 'default',
      };
      const course = await coursesApi.create(dto);

      // 2. If curriculum topics exist, save them
      if (payload.topics && payload.topics.length > 0) {
        await adminCoursesApi.saveCurriculum(course.id, payload.topics);
      }

      return course;
    },
    onSuccess: (course) => {
      toast.success(`Course "${course.title}" imported successfully!`);
      navigate(`/courses/${course.slug}/edit`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Import failed';
      toast.error(Array.isArray(msg) ? msg.join(' · ') : msg);
    },
  });

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' className='gap-2' onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div>
          <h1 className='text-xl font-bold'>Import Course</h1>
          <p className='text-xs text-muted-foreground'>
            Paste or upload a full course JSON (including curriculum topics).
          </p>
        </div>
      </div>

      {/* Format hint */}
      <Card className='border-border/50'>
        <CardContent className='pt-4 pb-3'>
          <p className='text-xs text-muted-foreground font-mono leading-relaxed'>
            {`{ title, slug, difficulty, access, color (lowercase), category, contentType,`}
            <br />
            {`  topics: [{ id, title: {en, ar}, elements: [...] }] }`}
          </p>
        </CardContent>
      </Card>

      {/* Upload / Paste */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <FileJson className='h-4 w-4 text-primary' /> Course JSON
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3'>
            <input
              ref={fileRef}
              type='file'
              accept='.json,application/json'
              className='hidden'
              onChange={handleFile}
            />
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={() => fileRef.current?.click()}
            >
              <Upload className='h-4 w-4' /> Choose .json file
            </Button>
            <span className='text-xs text-muted-foreground'>or paste below</span>
          </div>

          <Textarea
            rows={10}
            placeholder='Paste course JSON here...'
            value={raw}
            className='font-mono text-xs resize-y'
            onChange={(e) => {
              setRaw(e.target.value);
              if (e.target.value.trim()) tryParse(e.target.value);
              else { setPayload(null); setParseError(''); }
            }}
          />

          {parseError && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
              <AlertTriangle className='h-3.5 w-3.5 mt-0.5 shrink-0' />
              {parseError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {payload && <PreviewCard payload={payload} />}

      {/* Actions */}
      <div className='flex items-center justify-end gap-3'>
        <Button variant='outline' onClick={() => navigate(ROUTES.COURSES)}>Cancel</Button>
        <Button
          disabled={!payload || isPending}
          className='gap-2 min-w-[150px]'
          onClick={() => mutate()}
        >
          {isPending
            ? <><Loader2 className='h-4 w-4 animate-spin' /> Importing...</>
            : <><FileJson className='h-4 w-4' /> Import Course</>}
        </Button>
      </div>
    </div>
  );
}
