import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pathSchema = z.object({
  title: z.string().min(1),
  ar_title: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  description: z.string().optional(),
  ar_description: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
});

export type PathFormValues = z.infer<typeof pathSchema>;

interface PathFormProps {
  defaultValues?: Partial<PathFormValues>;
  onSubmit: (data: PathFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PathForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: PathFormProps) {
  const { t } = useTranslation('paths');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PathFormValues>({
    resolver: zodResolver(pathSchema),
    defaultValues: {
      title: '',
      ar_title: '',
      slug: '',
      description: '',
      ar_description: '',
      thumbnail: '',
      isPublished: false,
      ...defaultValues,
    },
  });

  const isPublished = watch('isPublished');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('fields.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('fields.title')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder={t('placeholders.title')}
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_title">{t('fields.ar_title')}</Label>
              <Input
                id="ar_title"
                placeholder={t('placeholders.ar_title')}
                dir="rtl"
                {...register('ar_title')}
              />
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              {t('fields.slug')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              placeholder={t('placeholders.slug')}
              {...register('slug')}
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('placeholders.description')}
                rows={4}
                {...register('description')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_description">{t('fields.ar_description')}</Label>
              <Textarea
                id="ar_description"
                placeholder={t('placeholders.description')}
                rows={4}
                dir="rtl"
                {...register('ar_description')}
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">{t('fields.thumbnail')}</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/image.png"
              {...register('thumbnail')}
              className={errors.thumbnail ? 'border-destructive' : ''}
            />
            {errors.thumbnail && (
              <p className="text-xs text-destructive">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* isPublished */}
          <div className="flex items-center gap-3">
            <Switch
              id="isPublished"
              checked={isPublished ?? false}
              onCheckedChange={(v) => setValue('isPublished', v)}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              {t('fields.isPublished')}
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel ?? t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
