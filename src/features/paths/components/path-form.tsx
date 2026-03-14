// src/features/paths/components/path-form.tsx
// Full path creation / edit form — matches the LearningPath Prisma model exactly.
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Shield, Eye, Crosshair, Flame, Globe, Cloud,
  Lock, Terminal, Cpu, Wifi, Database, Bug, Code,
  Map, Target, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PathIconName, PathColor, PathDifficulty } from '@/core/types/api.types';

// ── Icon registry (must match frontend iconName values) ──────────────────────
const ICON_OPTIONS: { value: PathIconName; label: string; Icon: React.ElementType }[] = [
  { value: 'shield',    label: 'Shield',    Icon: Shield    },
  { value: 'eye',       label: 'Eye',       Icon: Eye       },
  { value: 'crosshair', label: 'Crosshair', Icon: Crosshair },
  { value: 'flame',     label: 'Flame',     Icon: Flame     },
  { value: 'globe',     label: 'Globe',     Icon: Globe     },
  { value: 'cloud',     label: 'Cloud',     Icon: Cloud     },
  { value: 'lock',      label: 'Lock',      Icon: Lock      },
  { value: 'terminal',  label: 'Terminal',  Icon: Terminal  },
  { value: 'cpu',       label: 'CPU',       Icon: Cpu       },
  { value: 'wifi',      label: 'Wifi',      Icon: Wifi      },
  { value: 'database',  label: 'Database',  Icon: Database  },
  { value: 'bug',       label: 'Bug',       Icon: Bug       },
  { value: 'code',      label: 'Code',      Icon: Code      },
  { value: 'map',       label: 'Map',       Icon: Map       },
  { value: 'target',    label: 'Target',    Icon: Target    },
  { value: 'zap',       label: 'Zap',       Icon: Zap       },
];

const COLOR_OPTIONS: { value: PathColor; hex: string }[] = [
  { value: 'BLUE',    hex: '#3b82f6' },
  { value: 'EMERALD', hex: '#10b981' },
  { value: 'VIOLET',  hex: '#8b5cf6' },
  { value: 'ORANGE',  hex: '#f97316' },
  { value: 'ROSE',    hex: '#f43f5e' },
  { value: 'CYAN',    hex: '#06b6d4' },
];

const DIFFICULTY_OPTIONS: PathDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

// ── Zod schema ────────────────────────────────────────────────────────────────
const pathSchema = z.object({
  // Required
  title:             z.string().min(1, 'Title is required'),
  slug:              z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  // Bilingual
  ar_title:          z.string().optional(),
  description:       z.string().optional(),
  ar_description:    z.string().optional(),
  longDescription:   z.string().optional(),
  ar_longDescription:z.string().optional(),
  // Visual
  iconName:          z.string().optional(),
  color:             z.string().optional(),
  thumbnail:         z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // Classification
  difficulty:        z.string().optional(),
  estimatedHours:    z.number().min(0).optional(),
  order:             z.number().min(0).optional(),
  // Tags / Skills / Prerequisites (comma-separated in form → array on submit)
  tags:              z.string().optional(),
  skills:            z.string().optional(),
  prerequisites:     z.string().optional(),
  // Flags
  isPublished:       z.boolean().optional(),
  isFeatured:        z.boolean().optional(),
  isNew:             z.boolean().optional(),
  isComingSoon:      z.boolean().optional(),
});

export type PathFormValues = z.infer<typeof pathSchema>;

interface PathFormProps {
  defaultValues?: Partial<PathFormValues>;
  onSubmit: (data: PathFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
      longDescription: '',
      ar_longDescription: '',
      iconName: 'shield',
      color: 'BLUE',
      thumbnail: '',
      difficulty: 'BEGINNER',
      estimatedHours: 0,
      order: 0,
      tags: '',
      skills: '',
      prerequisites: '',
      isPublished: false,
      isFeatured: false,
      isNew: false,
      isComingSoon: false,
      ...defaultValues,
    },
  });

  const watchedTitle    = watch('title');
  const watchedSlug     = watch('slug');
  const watchedIcon     = watch('iconName') as PathIconName;
  const watchedColor    = watch('color') as PathColor;
  const isPublished     = watch('isPublished');
  const isFeatured      = watch('isFeatured');
  const isNew           = watch('isNew');
  const isComingSoon    = watch('isComingSoon');

  // Auto-slug from title (only if slug hasn't been manually changed)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('title', val);
    if (!watchedSlug || watchedSlug === slugify(watchedTitle ?? '')) {
      setValue('slug', slugify(val));
    }
  };

  const selectedIconObj = ICON_OPTIONS.find((o) => o.value === watchedIcon);
  const SelectedIcon = selectedIconObj?.Icon ?? Shield;
  const selectedColorHex = COLOR_OPTIONS.find((c) => c.value === watchedColor)?.hex ?? '#3b82f6';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Section 1: Core Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Title EN / AR */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title (EN) <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g., Pre-Security Path"
                {...register('title')}
                onChange={handleTitleChange}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_title">Title (AR)</Label>
              <Input id="ar_title" dir="rtl" placeholder="العنوان بالعربية" {...register('ar_title')} />
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono shrink-0">paths/</span>
              <Input
                id="slug"
                className={`font-mono ${errors.slug ? 'border-destructive' : ''}`}
                placeholder="pre-security-path"
                {...register('slug')}
                onChange={(e) => setValue('slug', slugify(e.target.value))}
              />
            </div>
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          {/* Description EN / AR */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description (EN)</Label>
              <Textarea id="description" rows={3} placeholder="Short description…" {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_description">Description (AR)</Label>
              <Textarea id="ar_description" rows={3} dir="rtl" placeholder="وصف قصير…" {...register('ar_description')} />
            </div>
          </div>

          {/* Long Description EN / AR */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description (EN)</Label>
              <Textarea id="longDescription" rows={4} placeholder="Detailed description…" {...register('longDescription')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ar_longDescription">Long Description (AR)</Label>
              <Textarea id="ar_longDescription" rows={4} dir="rtl" placeholder="وصف تفصيلي…" {...register('ar_longDescription')} />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Section 2: Visual Identity ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Visual Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Preview badge */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${selectedColorHex}22`, border: `1.5px solid ${selectedColorHex}55` }}
            >
              <SelectedIcon size={22} style={{ color: selectedColorHex }} />
            </div>
            <p className="text-xs text-muted-foreground">Live preview of icon + color</p>
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setValue('iconName', value)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                    watchedIcon === value
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <input type="hidden" {...register('iconName')} />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(({ value, hex }) => (
                <button
                  key={value}
                  type="button"
                  title={value}
                  onClick={() => setValue('color', value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    watchedColor === value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <input type="hidden" {...register('color')} />
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/image.png"
              {...register('thumbnail')}
              className={errors.thumbnail ? 'border-destructive' : ''}
            />
            {errors.thumbnail && <p className="text-xs text-destructive">{errors.thumbnail.message}</p>}
          </div>

        </CardContent>
      </Card>

      {/* ── Section 3: Classification ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                {...register('difficulty')}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min={0}
                placeholder="0"
                {...register('estimatedHours', { valueAsNumber: true })}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={0}
                placeholder="0"
                {...register('order', { valueAsNumber: true })}
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Section 4: Tags / Skills / Prerequisites ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Tags, Skills & Prerequisites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="tags">Tags <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input id="tags" placeholder="Networking, Linux, Web" {...register('tags')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="skills">Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input id="skills" placeholder="TCP/IP, Burp Suite, Nmap" {...register('skills')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prerequisites">Prerequisites <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input id="prerequisites" placeholder="No prior knowledge required" {...register('prerequisites')} />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Flags ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Visibility & Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {([
              { id: 'isPublished',  label: 'Published',   val: isPublished,  key: 'isPublished'  },
              { id: 'isFeatured',   label: 'Featured',    val: isFeatured,   key: 'isFeatured'   },
              { id: 'isNew',        label: 'Mark as New', val: isNew,        key: 'isNew'        },
              { id: 'isComingSoon', label: 'Coming Soon', val: isComingSoon, key: 'isComingSoon' },
            ] as const).map(({ id, label, val, key }) => (
              <div key={id} className="flex items-center gap-2">
                <Switch
                  id={id}
                  checked={val ?? false}
                  onCheckedChange={(v) => setValue(key, v)}
                />
                <Label htmlFor={id} className="cursor-pointer text-sm">{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-3 pb-8">
        <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[140px]">
          {submitLabel ?? t('actions.save')}
        </Button>
      </div>

    </form>
  );
}
