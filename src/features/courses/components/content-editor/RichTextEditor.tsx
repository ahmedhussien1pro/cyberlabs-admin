import React, { useRef } from 'react';
import Swal from 'sweetalert2';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  dir?: 'ltr' | 'rtl';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, dir = 'ltr' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleLink = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const selected = value.substring(start, textarea.selectionEnd);
    const { value: url } = await Swal.fire({
      title: 'Insert Link',
      input: 'url',
      inputLabel: 'Enter URL',
      inputPlaceholder: 'https://example.com',
      inputValue: 'https://',
      showCancelButton: true,
      confirmButtonText: 'Insert',
      cancelButtonText: 'Cancel',
    });
    if (url) insertTag(`<a href="${url}">`, '</a>');
  };

  return (
    <div className='rich-editor'>
      <textarea
        ref={textareaRef}
        className='rich-editor__content'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Type here...'
        dir={dir}
        rows={4}
      />
    </div>
  );
};

export default RichTextEditor;
