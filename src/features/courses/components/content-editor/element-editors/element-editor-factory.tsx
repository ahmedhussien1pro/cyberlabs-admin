// src/features/courses/components/content-editor/element-editors/element-editor-factory.tsx
// Renders the correct editor based on element.type.
// Add new element types here — never in the parent component.

import { CourseElement } from '../../../types/course-editor.types';
import { TextElementEditor } from './text-element-editor';
import { ImageElementEditor } from './image-element-editor';
import { VideoElementEditor } from './video-element-editor';
import { CodeElementEditor } from './code-element-editor';
import { QuizElementEditor } from './quiz-element-editor';

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

export function ElementEditorFactory({ element, onChange }: Props) {
  switch (element.type) {
    case 'TEXT':
      return <TextElementEditor element={element} onChange={onChange} />;
    case 'IMAGE':
      return <ImageElementEditor element={element} onChange={onChange} />;
    case 'VIDEO':
      return <VideoElementEditor element={element} onChange={onChange} />;
    case 'CODE':
      return <CodeElementEditor element={element} onChange={onChange} />;
    case 'QUIZ':
      return <QuizElementEditor element={element} onChange={onChange} />;
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Unknown element type: {(element as any).type}
        </p>
      );
  }
}
