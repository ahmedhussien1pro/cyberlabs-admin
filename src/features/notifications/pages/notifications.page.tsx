// src/features/notifications/pages/notifications.page.tsx
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Bell, Send, Clock, Users, CheckCircle2, AlertTriangle,
  Info, Zap, History, RefreshCw, MessageSquare, User, X, Search,
} from 'lucide-react';

import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  notificationsService,
  type BroadcastPayload,
  type Notification,
} from '@/core/api/services/notifications.service';
import { usersService } from '@/core/api/services/users.service';

// ── Type config ────────────────────────────────────────────────────────────
const TYPE_KEYS = ['INFO', 'SUCCESS', 'WARNING', 'ALERT'] as const;
type NotifType = typeof TYPE_KEYS[number];

const TYPE_META: Record<NotifType, {
  icon: React.ElementType;
  color: string;
  iconColor: string;
  bg: string;
}> = {
  INFO:    { icon: Info,          color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',    iconColor: 'text-blue-400',    bg: 'bg-blue-500/10' },
  SUCCESS: { icon: CheckCircle2,  color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WARNING: { icon: AlertTriangle, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',  iconColor: 'text-amber-400',   bg: 'bg-amber-500/10' },
  ALERT:   { icon: Zap,           color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',     iconColor: 'text-rose-400',    bg: 'bg-rose-500/10' },
};

// ── UserSearchInput ────────────────────────────────────────────────────────
function UserSearchInput({
  selected, onSelect,
}: {
  selected: { id: string; name: string; email: string } | null;
  onSelect: (u: { id: string; name: string; email: string } | null) => void;
}) {
  const { t } = useTranslation('notifications');
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['users-search-notif', query],
    queryFn: () => usersService.getAll({ search: query, limit: 10 }),
    enabled: open && query.length >= 1,
    staleTime: 2000,
  });

  const users: any[] = Array.isArray(data)
    ? data
    : (data as any)?.data ?? (data as any)?.items ?? [];

  if (selected) {
    return (
      <div className='flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2'>
        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15'>
          <User className='h-3.5 w-3.5 text-emerald-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{selected.name}</p>
          <p className='truncate text-[11px] text-muted-foreground'>{selected.email}</p>
        </div>
        <button onClick={() => onSelect(null)} className='shrink-0 rounded p-0.5 hover:bg-muted'>
          <X className='h-3.5 w-3.5 text-muted-foreground' />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className='relative'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder={t('form.userSearchPlaceholder')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className='pl-9'
        />
      </div>
      <AnimatePresence>
        {open && (query.length >= 1) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className='absolute z-50 mt-1 w-full rounded-lg border border-border/60 bg-popover shadow-xl'
          >
            {isFetching && (
              <p className='p-3 text-xs text-muted-foreground'>{t('form.userSearchLoading')}</p>
            )}
            {!isFetching && users.length === 0 && (
              <p className='p-3 text-xs text-muted-foreground'>{t('form.userSearchNoResults')}</p>
            )}
            {users.map((u) => (
              <button
                key={u.id}
                onMouseDown={() => { onSelect({ id: u.id, name: u.name ?? u.username ?? u.email, email: u.email }); setOpen(false); setQuery(''); }}
                className='flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 first:rounded-t-lg last:rounded-b-lg'
              >
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted'>
                  <User className='h-3.5 w-3.5 text-muted-foreground' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{u.name ?? u.username ?? '—'}</p>
                  <p className='truncate text-[11px] text-muted-foreground'>{u.email}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── HistoryItem ────────────────────────────────────────────────────────────
function HistoryItem({ notif }: { notif: Notification }) {
  const { t } = useTranslation('notifications');
  const meta = TYPE_META[notif.type as NotifType] ?? TYPE_META.INFO;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border'
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
        <Icon className={cn('h-4 w-4', meta.iconColor)} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-sm font-semibold'>{notif.title}</p>
          <Badge variant='outline' className={cn('text-[10px] h-4 py-0', meta.color)}>
            {t(`types.${notif.type}`, notif.type)}
          </Badge>
          {notif.targetUser && (
            <Badge variant='outline' className='h-4 py-0 text-[10px] border-violet-500/30 text-violet-400 bg-violet-500/10'>
              <User className='mr-1 h-2.5 w-2.5' />{notif.targetUser.name}
            </Badge>
          )}
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-2'>{notif.message}</p>
        <div className='mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {new Date(notif.sentAt).toLocaleString()}
          </span>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />
            {notif.recipientCount.toLocaleString()} {t('history.recipients')}
          </span>
          {notif.sentBy && (
            <span className='flex items-center gap-1'>
              <MessageSquare className='h-3 w-3' />
              {notif.sentBy.name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── NotificationsPage ──────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const queryClient = useQueryClient();

  type TargetMode = 'all' | 'user';

  const [targetMode,   setTargetMode]   = useState<TargetMode>('all');
  const [targetUser,   setTargetUser]   = useState<{ id: string; name: string; email: string } | null>(null);
  const [form, setForm] = useState<Omit<BroadcastPayload, 'userId'>>({
    title: '',
    message: '',
    type: 'INFO',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // History
  const {
    data: historyData, isLoading: historyLoading,
    isFetching: historyFetching, refetch,
  } = useQuery({
    queryKey: ['notifications-history'],
    queryFn: () => notificationsService.getHistory({ limit: 20 }),
  });
  const history: Notification[] = historyData?.data ?? [];

  // Broadcast
  const broadcastMutation = useMutation({
    mutationFn: (payload: BroadcastPayload) => notificationsService.broadcast(payload),
    onSuccess: (res) => {
      toast.success(t('toast.success', { count: res.recipientCount?.toLocaleString() ?? 0 }));
      setForm({ title: '', message: '', type: 'INFO' });
      setTargetUser(null);
      setTargetMode('all');
      queryClient.invalidateQueries({ queryKey: ['notifications-history'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? t('toast.error')),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error(t('form.validationError'));
      return;
    }
    if (targetMode === 'user' && !targetUser) {
      toast.error(t('form.validationUserError'));
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    setConfirmOpen(false);
    broadcastMutation.mutate({
      ...form,
      userId: targetMode === 'user' ? targetUser?.id : undefined,
    });
  };

  const selectedType = form.type as NotifType;
  const TypeIcon = TYPE_META[selectedType].icon;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 ring-1 ring-border/60'>
            <Bell className='h-5 w-5 text-violet-400' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h1>
            <p className='text-sm text-muted-foreground'>{t('page.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>

        {/* ── Compose Form ── */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Send className='h-5 w-5 text-muted-foreground' />
              <CardTitle className='text-base'>{t('form.cardTitle')}</CardTitle>
            </div>
            <CardDescription>{t('form.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>

            {/* Target selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.targetLabel')}</label>
              <div className='flex gap-2'>
                <Button
                  variant={targetMode === 'all' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1 gap-2'
                  onClick={() => { setTargetMode('all'); setTargetUser(null); }}
                >
                  <Users className='h-4 w-4' />{t('form.targetAll')}
                </Button>
                <Button
                  variant={targetMode === 'user' ? 'default' : 'outline'}
                  size='sm'
                  className='flex-1 gap-2'
                  onClick={() => setTargetMode('user')}
                >
                  <User className='h-4 w-4' />{t('form.targetUser')}
                </Button>
              </div>
            </div>

            {/* User search (shown when targetMode=user) */}
            <AnimatePresence>
              {targetMode === 'user' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className='space-y-2 overflow-hidden'
                >
                  <label className='text-sm font-medium'>{t('form.selectedUser')}</label>
                  <UserSearchInput selected={targetUser} onSelect={setTargetUser} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Type */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.typeLabel')}</label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as NotifType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_KEYS.map((key) => {
                    const meta = TYPE_META[key];
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className='flex items-center gap-2'>
                          <Icon className={cn('h-4 w-4', meta.iconColor)} />
                          {t(`types.${key}`)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.titleLabel')}</label>
              <Input
                placeholder={t('form.titlePlaceholder')}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={120}
              />
              <p className='text-right text-[11px] text-muted-foreground'>{form.title.length}/120</p>
            </div>

            {/* Message */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.messageLabel')}</label>
              <Textarea
                placeholder={t('form.messagePlaceholder')}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                rows={5}
                maxLength={500}
                className='resize-none'
              />
              <p className='text-right text-[11px] text-muted-foreground'>{form.message.length}/500</p>
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div className='rounded-xl border border-border/50 bg-muted/20 p-4'>
                <p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  {t('form.previewLabel')}
                </p>
                <div className='flex items-start gap-3'>
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', TYPE_META[selectedType].bg)}>
                    <TypeIcon className={cn('h-4 w-4', TYPE_META[selectedType].iconColor)} />
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>{form.title || t('form.previewTitleFallback')}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>{form.message || t('form.previewMessageFallback')}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Warning */}
            <div className='flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
              <p
                className='text-xs text-amber-400/90'
                dangerouslySetInnerHTML={{
                  __html: targetMode === 'all'
                    ? t('form.warningAll')
                    : t('form.warningUser'),
                }}
              />
            </div>

            <Button
              className='w-full gap-2'
              onClick={handleSend}
              disabled={
                broadcastMutation.isPending ||
                !form.title.trim() ||
                !form.message.trim() ||
                (targetMode === 'user' && !targetUser)
              }
            >
              {broadcastMutation.isPending
                ? <RefreshCw className='h-4 w-4 animate-spin' />
                : <Send className='h-4 w-4' />}
              {broadcastMutation.isPending
                ? t('form.sending')
                : targetMode === 'all'
                  ? t('form.sendButtonAll')
                  : t('form.sendButtonUser')}
            </Button>
          </CardContent>
        </Card>

        {/* ── History ── */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <History className='h-5 w-5 text-muted-foreground' />
              <h2 className='text-base font-semibold'>{t('history.title')}</h2>
            </div>
            <Button
              variant='outline' size='sm' className='h-8 gap-1.5 text-xs'
              onClick={() => refetch()}
              disabled={historyFetching}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', historyFetching && 'animate-spin')} />
              {t('history.refresh')}
            </Button>
          </div>

          <div className='space-y-3'>
            {historyLoading && [1,2,3].map((i) => <Skeleton key={i} className='h-24 rounded-xl' />)}

            {!historyLoading && history.length === 0 && (
              <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 py-16'>
                <Bell className='h-10 w-10 text-muted-foreground/20' />
                <p className='text-sm text-muted-foreground'>{t('history.empty')}</p>
              </div>
            )}

            <AnimatePresence>
              {history.map((notif) => <HistoryItem key={notif.id} notif={notif} />)}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Send className='h-5 w-5 text-violet-400' />
              {t('confirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3'>
                <p
                  dangerouslySetInnerHTML={{
                    __html: targetMode === 'all'
                      ? t('confirm.bodyAll')
                      : t('confirm.bodyUser', { name: targetUser?.name ?? '' }),
                  }}
                />
                <div className='rounded-lg border border-border/50 bg-muted/30 p-3'>
                  <p className='text-sm font-semibold text-foreground'>{form.title}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{form.message}</p>
                </div>
                <p className='text-sm'>{t('confirm.undone')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('confirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend} className='gap-2'>
              <Send className='h-4 w-4' /> {t('confirm.send')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
