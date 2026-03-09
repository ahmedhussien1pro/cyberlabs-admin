// src/features/courses/components/content-editor/panels/hero-info-panel.tsx
import { useCourseEditorStore } from '../../../store/use-course-editor-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function HeroInfoPanel() {
  const { heroInfo, setHeroInfo } = useCourseEditorStore();

  return (
    <div className="max-w-2xl space-y-5 p-6">
      {/* Descriptions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Short Description (EN)</Label>
          <Textarea
            rows={3}
            value={heroInfo.description}
            placeholder="One paragraph summary..."
            onChange={(e) => setHeroInfo({ description: e.target.value })}
            className="resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Short Description (AR)</Label>
          <Textarea
            dir="rtl"
            rows={3}
            value={heroInfo.ar_description}
            placeholder="ملخص قصير..."
            onChange={(e) => setHeroInfo({ ar_description: e.target.value })}
            className="resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Long Description (EN)</Label>
          <Textarea
            rows={6}
            value={heroInfo.longDescription}
            placeholder="Detailed course overview, what students will learn..."
            onChange={(e) => setHeroInfo({ longDescription: e.target.value })}
            className="resize-y"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Long Description (AR)</Label>
          <Textarea
            dir="rtl"
            rows={6}
            value={heroInfo.ar_longDescription}
            placeholder="وصف تفصيلي للكورس..."
            onChange={(e) => setHeroInfo({ ar_longDescription: e.target.value })}
            className="resize-y"
          />
        </div>
      </div>

      {/* Difficulty + Hours */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select
            value={heroInfo.difficulty}
            onValueChange={(v) => setHeroInfo({ difficulty: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Estimated Hours</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={heroInfo.estimatedHours || ''}
            placeholder="e.g. 12"
            onChange={(e) =>
              setHeroInfo({ estimatedHours: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Instructor ID */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Instructor ID (UUID)</Label>
        <Input
          value={heroInfo.instructorId}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="font-mono text-sm"
          onChange={(e) => setHeroInfo({ instructorId: e.target.value.trim() })}
        />
        <p className="text-[11px] text-muted-foreground">
          Find the instructor ID from the Users section.
        </p>
      </div>
    </div>
  );
}
