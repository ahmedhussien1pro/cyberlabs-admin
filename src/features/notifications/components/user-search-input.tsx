// src/features/notifications/components/user-search-input.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usersService } from '@/core/api/services/users.service';
import { useDebounce } from '../hooks/use-debounce';
import { highlightMatch } from '../utils/highlight-match';

export interface SelectedUser { id: string; name: string; email: string; }

export function UserSearchInput({
  selected, onSelect,
}: { selected: SelectedUser | null; onSelect: (u: SelectedUser | null) => void }) {
  const { t } = useTranslation('notifications');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  const { data, isFetching } = useQuery({
    queryKey: ['users-search-notif', debouncedQuery],
    queryFn: () => usersService.getAll({ search: debouncedQuery || undefined, limit: 8 }),
    staleTime: 5_000,
    enabled: open,
  });

  const users: SelectedUser[] = (
    Array.isArray(data) ? data : ((data as any)?.data ?? (data as any)?.items ?? [])
  ).map((u: any) => ({ id: u.id, name: u.name ?? u.username ?? u.email, email: u.email }));

  useEffect(() => setHighlighted(0), [users.length]);

  const choose = useCallback((u: SelectedUser) => {
    onSelect(u); setQuery(''); setOpen(false);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || users.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, users.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (users[highlighted]) choose(users[highlighted]!); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('[data-user-search]')?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlighted}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  if (selected) {
    return (
      <div className='flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20'>
          <span className='text-sm font-bold text-emerald-400 uppercase'>{selected.name.charAt(0)}</span>
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold'>{selected.name}</p>
          <p className='truncate text-[11px] text-muted-foreground'>{selected.email}</p>
        </div>
        <button type='button' onClick={() => onSelect(null)}
          className='shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'>
          <X className='h-3.5 w-3.5' />
        </button>
      </div>
    );
  }

  return (
    <div data-user-search className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
        {isFetching
          ? <Loader2 className='absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground pointer-events-none' />
          : query && (
            <button type='button' onClick={() => setQuery('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground'>
              <X className='h-3.5 w-3.5' />
            </button>
          )
        }
        <Input ref={inputRef} placeholder={t('form.userSearchPlaceholder')}
          value={query} autoComplete='off'
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className='pl-9 pr-8' />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.13 }}
            className='absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border/60 bg-popover shadow-2xl shadow-black/20'>
            <div ref={listRef} className='max-h-60 overflow-y-auto'>
              {isFetching && users.length === 0 && (
                <div className='space-y-1 p-2'>
                  {[1,2,3].map((i) => (
                    <div key={i} className='flex items-center gap-2.5 rounded-lg px-2 py-2'>
                      <Skeleton className='h-8 w-8 rounded-full shrink-0' />
                      <div className='flex-1 space-y-1.5'>
                        <Skeleton className='h-3.5 w-28 rounded' />
                        <Skeleton className='h-3 w-40 rounded' />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isFetching && users.length === 0 && (
                <div className='flex flex-col items-center gap-2 py-8'>
                  <Search className='h-6 w-6 text-muted-foreground/30' />
                  <p className='text-xs text-muted-foreground'>{t('form.userSearchNoResults')}</p>
                </div>
              )}
              {users.map((u, idx) => (
                <button key={u.id} data-idx={idx} type='button'
                  onMouseDown={(e) => { e.preventDefault(); choose(u); }}
                  onMouseEnter={() => setHighlighted(idx)}
                  className={cn('flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                    highlighted === idx ? 'bg-muted/80' : 'hover:bg-muted/50')}>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 ring-1 ring-border/40'>
                    <span className='text-xs font-bold text-violet-400 uppercase'>{u.name.charAt(0)}</span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium leading-tight'>{highlightMatch(u.name, query)}</p>
                    <p className='truncate text-[11px] text-muted-foreground leading-tight mt-0.5'>{u.email}</p>
                  </div>
                  {highlighted === idx && (
                    <span className='shrink-0 text-[10px] font-semibold text-muted-foreground/60'>Enter ⏎</span>
                  )}
                </button>
              ))}
            </div>
            {users.length > 0 && (
              <div className='border-t border-border/40 bg-muted/20 px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground/60'>
                <span>↑↓ {t('form.keyboardNav', 'navigate')}</span>
                <span>Enter {t('form.keyboardSelect', 'select')}</span>
                <span>Esc {t('form.keyboardClose', 'close')}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
