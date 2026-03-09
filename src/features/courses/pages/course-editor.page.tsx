// src/features/courses/pages/course-editor.page.tsx
// Unified Course Content Editor page.
// Handles all 3 modes: 'new' | 'import' (via location.state) | 'edit' (via :id param)

import { useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useCourseEditorStore } from '../store/use-course-editor-store';
import { EditorTopbar } from '../components/content-editor/editor-topbar';
import { CardInfoPanel } from '../components/content-editor/panels/card-info-panel';
import { HeroInfoPanel } from '../components/content-editor/panels/hero-info-panel';
import { CurriculumPanel } from '../components/content-editor/panels/curriculum-panel';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ── Panel tab config ────────────────────────────────────────────────────

const PANELS = [
  { id: 'card' as const, label: '\u2460 Card Info' },
  { id: 'hero' as const, label: '\u2461 Hero Info' },
  { id: 'curriculum' as const, label: '\u2462 Curriculum' },
];

// ── Page ────────────────────────────────────────────────────────────────

export function CourseEditorPage() {
  const { id: courseId } = useParams<{ id?: string }>();
  const location = useLocation();
  const initialized = useRef(false);

  const {
    activePanel,
    mode,
    setActivePanel,
    initNew,
    initFromJSON,
    initFromDB,
    isSaving,
  } = useCourseEditorStore();

  // —— Initialise store on mount only (avoid re-init on panel switch)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const state = location.state as any;

    if (courseId) {
      // EDIT mode: fetch from API
      fetchCourse(courseId).then((course) => {
        if (course) initFromDB(course);
      });
    } else if (state?.importJSON) {
      // IMPORT mode: JSON passed via router state from course-import page
      initFromJSON(state.importJSON);
    } else {
      // NEW mode
      initNew();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Topbar */}
      <EditorTopbar />

      {/* Panel tabs */}
      <nav className="flex border-b border-border/40 bg-background shrink-0 px-1">
        {PANELS.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activePanel === panel.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {panel.label}
          </button>
        ))}

        {/* Global saving indicator */}
        {isSaving && (
          <div className="ml-auto flex items-center gap-1.5 px-4 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </div>
        )}
      </nav>

      {/* Panel content */}
      <main className="flex-1 overflow-hidden">
        {activePanel === 'card' && (
          <div className="h-full overflow-y-auto">
            <CardInfoPanel />
          </div>
        )}
        {activePanel === 'hero' && (
          <div className="h-full overflow-y-auto">
            <HeroInfoPanel />
          </div>
        )}
        {activePanel === 'curriculum' && <CurriculumPanel />}
      </main>
    </div>
  );
}

// ── Inline API fetch (avoids react-query dependency assumption) ────────────

async function fetchCourse(id: string): Promise<any | null> {
  try {
    // Use the same axios instance as the rest of the admin app.
    // Adjust the import path if your admin API client lives elsewhere.
    const { adminApiClient } = await import('@/core/api/admin-client');
    const res = await adminApiClient.get(`/admin/courses/${id}`);
    return res.data ?? res;
  } catch (err) {
    console.error('[CourseEditorPage] Failed to fetch course:', err);
    return null;
  }
}
