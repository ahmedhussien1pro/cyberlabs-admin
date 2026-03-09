// src/features/courses/components/content-editor/editor-topbar.tsx
import { useNavigate } from 'react-router-dom';
import { useCourseEditorStore } from '../../store/use-course-editor-store';
import { saveCurriculum, downloadJSON } from '../../services/course-editor.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function EditorTopbar() {
  const navigate = useNavigate();
  const {
    cardInfo, courseId, mode,
    isDirty, isSaving,
    toCurriculumPayload, toJSON,
    markSaving, markClean,
  } = useCourseEditorStore();

  const handleSave = async () => {
    if (!courseId) {
      toast.error('No course ID — create the course first via the “Card Info” step.');
      return;
    }
    markSaving(true);
    try {
      await saveCurriculum(courseId, toCurriculumPayload() as any[]);
      markClean();
      toast.success('Curriculum saved successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Failed to save curriculum');
    } finally {
      markSaving(false);
    }
  };

  const handleExport = () => {
    const data = toJSON();
    const slug = cardInfo.slug || 'course';
    downloadJSON(data, `${slug}.json`);
    toast.success(`Exported as ${slug}.json`);
  };

  return (
    <header className="flex items-center gap-3 h-14 px-4 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-30 shrink-0">
      {/* Back */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => navigate('/courses')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Title + badges */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-semibold text-sm truncate">
          {cardInfo.title || 'Untitled Course'}
        </span>

        {mode === 'edit' && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            Edit
          </Badge>
        )}
        {mode === 'import' && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            Import
          </Badge>
        )}
        {mode === 'new' && (
          <Badge className="text-[10px] shrink-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            New
          </Badge>
        )}

        {isDirty && (
          <span className="text-[11px] text-amber-500 font-medium shrink-0">
            ● Unsaved
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-1.5 h-8 hidden sm:flex"
        >
          <Download className="h-3.5 w-3.5" />
          Export JSON
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !isDirty || !courseId}
          className="gap-1.5 h-8"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </header>
  );
}
