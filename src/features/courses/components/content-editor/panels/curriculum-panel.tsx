// src/features/courses/components/content-editor/panels/curriculum-panel.tsx
import { useState } from 'react';
import { useCourseEditorStore } from '../../../store/use-course-editor-store';
import { EditorSidebar } from '../editor-sidebar';
import { ElementEditorFactory } from '../element-editors/element-editor-factory';
import { CourseElement } from '../../../types/course-editor.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { BookOpen } from 'lucide-react';

export function CurriculumPanel() {
  const { topics, selectedTopicId, updateElement, updateTopic } = useCourseEditorStore();

  const [selectedTopicIdLocal, setSelectedTopicIdLocal] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleSelectElement = (topicId: string, elementId: string) => {
    setSelectedTopicIdLocal(topicId);
    setSelectedElementId(elementId);
  };

  // Derive selected topic and element
  const activeTopic = topics.find(
    (t) => t.id === (selectedTopicId ?? selectedTopicIdLocal),
  );
  const activeElement = activeTopic?.elements.find(
    (el) => el.id === selectedElementId,
  ) ?? null;

  const handleElementChange = (updates: Partial<CourseElement>) => {
    if (!selectedTopicIdLocal || !selectedElementId) return;
    updateElement(selectedTopicIdLocal, selectedElementId, updates);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Topics + Elements sidebar */}
      <div className="w-56 border-r border-border/40 shrink-0 overflow-hidden flex flex-col">
        <EditorSidebar
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
        />
      </div>

      {/* Right: Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topic metadata strip — shown when a topic is selected */}
        {activeTopic && (
          <>
            <div className="px-5 py-3 border-b border-border/40 bg-muted/20 shrink-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Topic metadata
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Title (EN)</Label>
                  <Input
                    value={activeTopic.title}
                    placeholder="Topic title"
                    className="h-7 text-xs"
                    onChange={(e) =>
                      updateTopic(activeTopic.id, { title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Title (AR)</Label>
                  <Input
                    dir="rtl"
                    value={activeTopic.ar_title ?? ''}
                    placeholder="عنوان الوحدة"
                    className="h-7 text-xs"
                    onChange={(e) =>
                      updateTopic(activeTopic.id, { ar_title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description (EN)</Label>
                  <Textarea
                    rows={2}
                    value={activeTopic.description ?? ''}
                    placeholder="Topic description"
                    className="text-xs resize-none"
                    onChange={(e) =>
                      updateTopic(activeTopic.id, { description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Description (AR)</Label>
                  <Textarea
                    dir="rtl"
                    rows={2}
                    value={activeTopic.ar_description ?? ''}
                    placeholder="وصف الوحدة"
                    className="text-xs resize-none"
                    onChange={(e) =>
                      updateTopic(activeTopic.id, { ar_description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Element editor */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeElement ? (
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {activeElement.type} — element editor
              </p>
              <ElementEditorFactory
                element={activeElement}
                onChange={handleElementChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 select-none">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                Select an element to start editing
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Pick a topic from the sidebar, then click an element — or add a
                new one with the “Add Element” button.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
