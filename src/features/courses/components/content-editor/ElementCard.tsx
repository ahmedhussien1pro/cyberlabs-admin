import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { ElementFields } from './ElementFields';
import type { ContentElement } from './TopicEditor';

const BADGE_COLORS: Record<string, string> = {
  text:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  title:       'bg-purple-500/20 text-purple-400 border-purple-500/30',
  subtitle:    'bg-violet-500/20 text-violet-400 border-violet-500/30',
  image:       'bg-green-500/20 text-green-400 border-green-500/30',
  code:        'bg-orange-500/20 text-orange-400 border-orange-500/30',
  terminal:    'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  list:        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  orderedList: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  note:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  video:       'bg-red-500/20 text-red-400 border-red-500/30',
  table:       'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  hr:          'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

export const ElementCard: React.FC<{
  element: ContentElement;
  index: number;
  total: number;
  onChange: (el: ContentElement) => void;
  onDelete: () => void;
  onMove: (index: number, dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  imageMap: Record<string, string>;
  onImageUpload: (key: string, file: File) => void;
}> = ({ element, index, total, onChange, onDelete, onMove, onDuplicate, imageMap, onImageUpload }) => {
  const [collapsed, setCollapsed] = useState(false);
  const badgeCls = BADGE_COLORS[element.type] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

  return (
    <div className='border rounded-lg bg-card overflow-hidden'>
      <div
        className='flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-muted/30 hover:bg-muted/50 transition-colors'
        onClick={() => setCollapsed(!collapsed)}>
        <div className='flex items-center gap-2'>
          <ChevronDown size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeCls}`}>{element.type}</span>
          <span className='text-xs text-muted-foreground'>#{index + 1}</span>
        </div>
        <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
          <button className='p-1.5 rounded hover:bg-muted disabled:opacity-30' disabled={index === 0} onClick={() => onMove(index, 'up')}><ChevronUp size={13} /></button>
          <button className='p-1.5 rounded hover:bg-muted disabled:opacity-30' disabled={index === total - 1} onClick={() => onMove(index, 'down')}><ChevronDown size={13} /></button>
          <button className='p-1.5 rounded hover:bg-blue-500/10 text-blue-400' onClick={onDuplicate}><Copy size={13} /></button>
          <button className='p-1.5 rounded hover:bg-destructive/10 text-destructive' onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </div>
      {!collapsed && (
        <div className='p-4'>
          <ElementFields element={element} onChange={onChange} imageMap={imageMap} onImageUpload={onImageUpload} />
        </div>
      )}
    </div>
  );
};
