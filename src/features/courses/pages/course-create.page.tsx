// src/features/courses/pages/course-create.page.tsx
// ✅ صفحة إنشاء كورس جديد — تستخدم adminCoursesApi + توجه لـ Edit بعد الحفظ
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { adminCoursesApi } from '../services/admin-courses.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants';
import { ArrowLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import type { AdminCourse } from '../types/admin-course.types';

type CreateFields = Pick<
  AdminCourse,
  | 'title'
  | 'ar_title'
  | 'description'
  | 'difficulty'
  | 'access'
  | 'category'
  | 'color'
  | 'contentType'
>;

export default function CourseCreatePage() {
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CreateFields>({
      defaultValues: {
        difficulty: 'BEGINNER',
        access: 'FREE',
        category: 'FUNDAMENTALS',
        color: 'blue',
        contentType: 'PRACTICAL',
      },
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<AdminCourse>) => adminCoursesApi.create(data),
    onSuccess: (created) => {
      toast.success('Course created! Complete the details now.');
      navigate(ROUTES.COURSE_EDIT(created.slug));
    },
    onError: () => toast.error('Failed to create course'),
  });

  const onSubmit = (data: CreateFields) => mutate(data);

  const Field = ({ id, label, error, children }: any) => (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-sm font-medium'>{label}</Label>
      {children}
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  );

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
        <Link to={ROUTES.COURSES} className='transition-colors hover:text-foreground'>
          Courses
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='font-medium text-foreground'>New Course</span>
      </nav>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create Course</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Fill the basics — you can complete all details after creation.
          </p>
        </div>
        <Button variant='ghost' size='sm' className='h-9 gap-2' onClick={() => navigate(ROUTES.COURSES)}>
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <Card className='p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          {/* Title */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field id='title' label='Title (EN) *' error={errors.title?.message}>
              <Input
                id='title'
                placeholder='e.g. Web Application Security'
                {...register('title', { required: 'Title is required' })}
              />
            </Field>
            <Field id='ar_title' label='Title (AR)'>
              <Input
                id='ar_title'
                dir='rtl'
                placeholder='عنوان الكورس بالعربي'
                {...register('ar_title')}
              />
            </Field>
          </div>

          {/* Description */}
          <Field id='description' label='Short Description'>
            <Textarea
              id='description'
              rows={3}
              placeholder='Brief overview of what students will learn...'
              {...register('description')}
            />
          </Field>

          {/* Row: Difficulty + Access + Color */}
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field id='difficulty' label='Difficulty'>
              <Select
                value={watch('difficulty')}
                onValueChange={(v) => setValue('difficulty', v as any)}
              >
                <SelectTrigger id='difficulty'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='BEGINNER'>Beginner</SelectItem>
                  <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
                  <SelectItem value='ADVANCED'>Advanced</SelectItem>
                  <SelectItem value='EXPERT'>Expert</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id='access' label='Access'>
              <Select
                value={watch('access')}
                onValueChange={(v) => setValue('access', v as any)}
              >
                <SelectTrigger id='access'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='FREE'>Free</SelectItem>
                  <SelectItem value='PRO'>Pro</SelectItem>
                  <SelectItem value='PREMIUM'>Premium</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id='color' label='Color'>
              <Select
                value={watch('color')}
                onValueChange={(v) => setValue('color', v as any)}
              >
                <SelectTrigger id='color'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='emerald'>Emerald</SelectItem>
                  <SelectItem value='blue'>Blue</SelectItem>
                  <SelectItem value='violet'>Violet</SelectItem>
                  <SelectItem value='orange'>Orange</SelectItem>
                  <SelectItem value='rose'>Rose</SelectItem>
                  <SelectItem value='cyan'>Cyan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Row: Category + ContentType */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field id='category' label='Category'>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v as any)}
              >
                <SelectTrigger id='category'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='FUNDAMENTALS'>Fundamentals</SelectItem>
                  <SelectItem value='WEB_SECURITY'>Web Security</SelectItem>
                  <SelectItem value='PENETRATION_TESTING'>Penetration Testing</SelectItem>
                  <SelectItem value='MALWARE_ANALYSIS'>Malware Analysis</SelectItem>
                  <SelectItem value='CLOUD_SECURITY'>Cloud Security</SelectItem>
                  <SelectItem value='CRYPTOGRAPHY'>Cryptography</SelectItem>
                  <SelectItem value='NETWORK_SECURITY'>Network Security</SelectItem>
                  <SelectItem value='TOOLS_AND_TECHNIQUES'>Tools & Techniques</SelectItem>
                  <SelectItem value='CAREER_AND_INDUSTRY'>Career & Industry</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id='contentType' label='Content Type'>
              <Select
                value={watch('contentType')}
                onValueChange={(v) => setValue('contentType', v as any)}
              >
                <SelectTrigger id='contentType'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='PRACTICAL'>Practical</SelectItem>
                  <SelectItem value='THEORETICAL'>Theoretical</SelectItem>
                  <SelectItem value='MIXED'>Mixed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Submit */}
          <div className='flex justify-end pt-2'>
            <Button type='submit' disabled={isPending} className='gap-2 min-w-[140px]'>
              {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Plus className='h-4 w-4' />
              )}
              Create Course
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
