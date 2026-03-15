// src/features/notifications/pages/notifications.page.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Bell, Send, History, RefreshCw,
  Users, User, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { TYPE_KEYS, TYPE_META, type NotifType } from '../constants/type-meta';
import { HistoryItem, UserSearchInput, type SelectedUser } from '../components';

export default function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const queryClient = useQueryClient();

  type TargetMode = 'all' | 'user';
  const [targetMode, setTargetMode] = useState<TargetMode>('all');
  const [targetUser, setTargetUser] = useState<SelectedUser | null>(null);
  const [form, setForm] = useState<Omit<BroadcastPayload, 'userId'>>({
    title: '', message: '', type: 'INFO',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: historyData, isLoading: historyLoading, isFetching: historyFetching, refetch } = useQuery({
    queryKey: ['notifications-history'],
    queryFn: () => notificationsService.getHistory({ limit: 20 }),
  });
  const history: Notification[] = historyData?.data ?? [];

  const broadcastMutation = useMutation({
    mutationFn: (payload: BroadcastPayload) => notificationsService.broadcast(payload),
    onSuccess: (res) => {
      toast.success(t('toast.success', { count: res.recipientCount ?? 0 }));
      setForm({ title: '', message: '', type: 'INFO' });
      setTargetUser(null);
      setTargetMode('all');
      queryClient.invalidateQueries({ queryKey: ['notifications-history'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? t('toast.error')),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error(t('form.validationError')); return; }
    if (targetMode === 'user' && !targetUser) { toast.error(t('form.validationUserError')); return; }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    setConfirmOpen(false);
    broadcastMutation.mutate({ ...form, userId: targetMode === 'user' ? targetUser?.id : undefined });
  };

  const selectedType = form.type as NotifType;
  const TypeIcon = TYPE_META[selectedType].icon;

  return (
    <div className='space-y-8'>
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
        {/* ── Send Form ── */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Send className='h-5 w-5 text-muted-foreground' />
              <CardTitle className='text-base'>{t('form.cardTitle')}</CardTitle>
            </div>
            <CardDescription>{t('form.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            {/* Target */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.targetLabel')}</label>
              <div className='flex gap-2'>
                <Button variant={targetMode === 'all' ? 'default' : 'outline'} size='sm'
                  className='flex-1 gap-2'
                  onClick={() => { setTargetMode('all'); setTargetUser(null); }}>
                  <Users className='h-4 w-4' />{t('form.targetAll')}
                </Button>
                <Button variant={targetMode === 'user' ? 'default' : 'outline'} size='sm'
                  className='flex-1 gap-2' onClick={() => setTargetMode('user')}>
                  <User className='h-4 w-4' />{t('form.targetUser')}
                </Button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {targetMode === 'user' && (
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium'>{t('form.selectedUser')}</label>
                  <UserSearchInput selected={targetUser} onSelect={setTargetUser} />
                </div>
              )}
            </AnimatePresence>

            {/* Type */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.typeLabel')}</label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as NotifType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_KEYS.map((key) => {
                    const meta = TYPE_META[key]; const Icon = meta.icon;
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
              <Input placeholder={t('form.titlePlaceholder')} value={form.title} maxLength={120}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              <p className='text-right text-[11px] text-muted-foreground'>{form.title.length}/120</p>
            </div>

            {/* Message */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('form.messageLabel')}</label>
              <Textarea placeholder={t('form.messagePlaceholder')} value={form.message} rows={5}
                maxLength={500} className='resize-none'
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
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
              <p className='text-xs text-amber-400/90'
                dangerouslySetInnerHTML={{ __html: targetMode === 'all' ? t('form.warningAll') : t('form.warningUser') }} />
            </div>

            <Button className='w-full gap-2' onClick={handleSend}
              disabled={broadcastMutation.isPending || !form.title.trim() || !form.message.trim() || (targetMode === 'user' && !targetUser)}>
              {broadcastMutation.isPending ? <RefreshCw className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
              {broadcastMutation.isPending ? t('form.sending')
                : targetMode === 'all' ? t('form.sendButtonAll') : t('form.sendButtonUser')}
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
            <Button variant='outline' size='sm' className='h-8 gap-1.5 text-xs'
              onClick={() => refetch()} disabled={historyFetching}>
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

      {/* ── Confirm Dialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Send className='h-5 w-5 text-violet-400' />
              {t('confirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3'>
                <p dangerouslySetInnerHTML={{ __html: targetMode === 'all'
                  ? t('confirm.bodyAll')
                  : t('confirm.bodyUser', { name: targetUser?.name ?? '' }) }} />
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
