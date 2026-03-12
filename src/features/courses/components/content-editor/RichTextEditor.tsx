import React, { useRef, useState } from 'react';
import { Link, Bold, Italic, Code, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  dir?: 'ltr' | 'rtl';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, dir = 'ltr' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [pendingSelection, setPendingSelection] = useState<{ start: number; end: number } | null>(null);

  const insertTag = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = selected
      ? `${before}${startTag}${selected}${endTag}${after}`
      : `${before}${startTag}${endTag}${after}`;
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + startTag.length;
      textarea.selectionEnd = start + startTag.length + selected.length;
    }, 0);
  };

  const handleLinkClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setPendingSelection({ start: textarea.selectionStart, end: textarea.selectionEnd });
    setLinkUrl('https://');
    setShowLinkInput(true);
  };

  const handleLinkInsert = () => {
    if (!linkUrl || linkUrl === 'https://') return;
    if (pendingSelection) {
      const selected = value.substring(pendingSelection.start, pendingSelection.end);
      const before = value.substring(0, pendingSelection.start);
      const after = value.substring(pendingSelection.end);
      const tag = `<a href="${linkUrl}">${selected || linkUrl}</a>`;
      onChange(`${before}${tag}${after}`);
    }
    setShowLinkInput(false);
    setLinkUrl('https://');
    setPendingSelection(null);
  };

  const TOOLBAR = [
    { icon: Bold, title: 'Bold', start: '<strong>', end: '</strong>' },
    { icon: Italic, title: 'Italic', start: '<em>', end: '</em>' },
    { icon: Code, title: 'Inline Code', start: '<code>', end: '</code>' },
  ];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 px-1 py-1 rounded-md border bg-muted/30">
        {TOOLBAR.map(({ icon: Icon, title, start, end }) => (
          <button
            key={title}
            type="button"
            title={title}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => insertTag(start, end)}
          >
            <Icon size={13} />
          </button>
        ))}
        <button
          type="button"
          title="Insert Link"
          className={`p-1.5 rounded hover:bg-muted transition-colors ${showLinkInput ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={handleLinkClick}
        >
          <Link size={13} />
        </button>
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border bg-muted/20">
          <input
            autoFocus
            className="flex-1 rounded border bg-background px-2 py-1 text-xs font-mono"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLinkInsert();
              if (e.key === 'Escape') setShowLinkInput(false);
            }}
          />
          <button
            type="button"
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
            onClick={handleLinkInsert}
          >
            Insert
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => setShowLinkInput(false)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y min-h-[80px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type here..."
        dir={dir}
        rows={4}
      />
    </div>
  );
};

export default RichTextEditor;
