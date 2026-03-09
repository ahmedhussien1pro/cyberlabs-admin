// src/features/courses/components/content-editor/index.ts
// Barrel exports for the Course Content Editor UI.
// Always import from here — never from deep paths.

// —— Topbar + Sidebar (layout level)
export { EditorTopbar } from './editor-topbar';
export { EditorSidebar } from './editor-sidebar';

// —— Panels
export { CardInfoPanel } from './panels/card-info-panel';
export { HeroInfoPanel } from './panels/hero-info-panel';
export { CurriculumPanel } from './panels/curriculum-panel';

// —— Element editors
export { ElementEditorFactory } from './element-editors/element-editor-factory';
export { TextElementEditor } from './element-editors/text-element-editor';
export { ImageElementEditor } from './element-editors/image-element-editor';
export { VideoElementEditor } from './element-editors/video-element-editor';
export { CodeElementEditor } from './element-editors/code-element-editor';
export { QuizElementEditor } from './element-editors/quiz-element-editor';
