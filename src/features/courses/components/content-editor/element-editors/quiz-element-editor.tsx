// src/features/courses/components/content-editor/element-editors/quiz-element-editor.tsx
import { CourseElement, QuizQuestion, QuizOption } from '../../../types/course-editor.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface Props {
  element: CourseElement;
  onChange: (updates: Partial<CourseElement>) => void;
}

export function QuizElementEditor({ element, onChange }: Props) {
  const questions: QuizQuestion[] = element.questions ?? [];

  const setQuestions = (qs: QuizQuestion[]) => onChange({ questions: qs });

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: uid(),
      question: '',
      ar_question: '',
      options: [
        { id: uid(), text: '', ar_text: '' },
        { id: uid(), text: '', ar_text: '' },
        { id: uid(), text: '', ar_text: '' },
        { id: uid(), text: '', ar_text: '' },
      ],
      correctOptionId: '',
      explanation: '',
      ar_explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (qId: string) =>
    setQuestions(questions.filter((q) => q.id !== qId));

  const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) =>
    setQuestions(
      questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)),
    );

  const updateOption = (qId: string, oId: string, updates: Partial<QuizOption>) =>
    setQuestions(
      questions.map((q) =>
        q.id !== qId
          ? q
          : {
              ...q,
              options: q.options.map((o) =>
                o.id === oId ? { ...o, ...updates } : o,
              ),
            },
      ),
    );

  return (
    <div className="space-y-4">
      {/* Element Title */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Title (EN)</Label>
          <Input
            value={element.title}
            placeholder="Quiz title"
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Title (AR)</Label>
          <Input
            dir="rtl"
            value={element.ar_title ?? ''}
            placeholder="عنوان الكويز"
            onChange={(e) => onChange({ ar_title: e.target.value })}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="border border-border/60 rounded-xl p-4 space-y-3 bg-muted/10"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Q{qIdx + 1}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Question text */}
            <div className="grid grid-cols-2 gap-3">
              <Textarea
                rows={2}
                value={q.question}
                placeholder="Question text (EN)"
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                className="resize-none"
              />
              <Textarea
                dir="rtl"
                rows={2}
                value={q.ar_question ?? ''}
                placeholder="نص السؤال (AR)"
                onChange={(e) => updateQuestion(q.id, { ar_question: e.target.value })}
                className="resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4 transition-colors',
                        q.correctOptionId === opt.id
                          ? 'text-green-500'
                          : 'text-muted-foreground/30',
                      )}
                    />
                  </button>
                  <Input
                    value={opt.text}
                    placeholder="Option (EN)"
                    onChange={(e) => updateOption(q.id, opt.id, { text: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    dir="rtl"
                    value={opt.ar_text ?? ''}
                    placeholder="خيار (AR)"
                    onChange={(e) => updateOption(q.id, opt.id, { ar_text: e.target.value })}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={q.explanation ?? ''}
                placeholder="Explanation (EN)"
                onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
              />
              <Input
                dir="rtl"
                value={q.ar_explanation ?? ''}
                placeholder="شرح الإجابة (AR)"
                onChange={(e) => updateQuestion(q.id, { ar_explanation: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addQuestion}
        className="w-full gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Question
      </Button>
    </div>
  );
}
