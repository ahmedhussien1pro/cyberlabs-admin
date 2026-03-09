// src/features/courses/components/content-editor/panels/card-info-panel.tsx
import { useCourseEditorStore } from '../../../store/use-course-editor-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  'web-security', 'network-security', 'reverse-engineering',
  'malware-analysis', 'forensics', 'cryptography', 'osint',
  'programming', 'linux', 'cloud-security',
];

export function CardInfoPanel() {
  const { cardInfo, setCardInfo } = useCourseEditorStore();

  return (
    <div className="max-w-2xl space-y-5 p-6">
      {/* Title */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Title (EN) *</Label>
          <Input
            value={cardInfo.title}
            placeholder="e.g. Python for Security"
            onChange={(e) => setCardInfo({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Title (AR)</Label>
          <Input
            dir="rtl"
            value={cardInfo.ar_title}
            placeholder="مثال: بايثون للأمن"
            onChange={(e) => setCardInfo({ ar_title: e.target.value })}
          />
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Slug * (URL-safe, auto-formats)</Label>
        <Input
          value={cardInfo.slug}
          placeholder="python-for-security"
          className="font-mono text-sm"
          onChange={(e) =>
            setCardInfo({
              slug: e.target.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
            })
          }
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Thumbnail URL</Label>
        <Input
          value={cardInfo.thumbnail}
          placeholder="https://cdn.example.com/course.png"
          onChange={(e) => setCardInfo({ thumbnail: e.target.value })}
        />
        {cardInfo.thumbnail && (
          <img
            src={cardInfo.thumbnail}
            alt="thumbnail preview"
            className="mt-2 h-20 rounded-lg object-cover border border-border/40"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        )}
      </div>

      {/* Access + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Access Level</Label>
          <Select
            value={cardInfo.access}
            onValueChange={(v: any) => setCardInfo({ access: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">FREE</SelectItem>
              <SelectItem value="PRO">PRO</SelectItem>
              <SelectItem value="PREMIUM">PREMIUM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={cardInfo.category}
            onValueChange={(v) => setCardInfo({ category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Brand Color</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={cardInfo.color}
            onChange={(e) => setCardInfo({ color: e.target.value })}
            className="h-9 w-14 rounded-md border border-border cursor-pointer p-0.5"
          />
          <Input
            value={cardInfo.color}
            onChange={(e) => setCardInfo({ color: e.target.value })}
            className="flex-1 font-mono text-sm"
            maxLength={7}
          />
          <div
            className="h-9 w-9 rounded-md border border-border/40 shrink-0"
            style={{ backgroundColor: cardInfo.color }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Switch
            id="isNew"
            checked={cardInfo.isNew}
            onCheckedChange={(v) => setCardInfo({ isNew: v })}
          />
          <Label htmlFor="isNew" className="cursor-pointer text-sm">
            Show “New” badge
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="isFeatured"
            checked={cardInfo.isFeatured}
            onCheckedChange={(v) => setCardInfo({ isFeatured: v })}
          />
          <Label htmlFor="isFeatured" className="cursor-pointer text-sm">
            Featured
          </Label>
        </div>
      </div>
    </div>
  );
}
