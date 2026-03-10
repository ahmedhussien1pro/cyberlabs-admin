// src/features/notifications/pages/notifications.page.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Bell,
  Send,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  History,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

import { Button }      from '@/components/ui/button';
import { Input }       from '@/components/ui/input';
import { Textarea }    from '@/components/ui/textarea';
import { Badge }       from '@/components/ui/badge';
import { Skeleton }    from '@/components/ui/skeleton';
import { Separator }   from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

import {
  notificationsService,
  type BroadcastPayload,
  type Notification,
} from '@/core/api/services/notifications.service';

// ── Notification type config ──────────────────────────────────────────
const TYPE_CONFIG = {
  INFO: {
    icon: Info,
    label: 'Info',
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    iconColor: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  SUCCESS: {
    icon: CheckCircle2,
    label: 'Success',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  WARNING: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    iconColor: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  ALERT: {
    icon: Zap,
    label: 'Alert',
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    iconColor: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
} as const;

type NotifType = keyof typeof TYPE_CONFIG;

// ── History item component ────────────────────────────────────────────
function HistoryItem({ notif }: { notif: Notification }) {
  const cfg = TYPE_CONFIG[notif.type as NotifType] ?? TYPE_CONFIG.INFO;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border'
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
        <Icon className={cn('h-4 w-4', cfg.iconColor)} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-sm font-semibold'>{notif.title}</p>
          <Badge variant='outline' className={cn('text-[10px] h-4 py-0', cfg.color)}>
            {cfg.label}
          </Badge>
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-2'>{notif.message}</p>
        <div className='mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {new Date(notif.sentAt).toLocaleString()}
          </span>
          <span className='flex items-center gap-1'>
            <Users className='h-3 w-3' />
            {notif.recipientCount.toLocaleString()} recipients
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

// ── Main Page ─────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<BroadcastPayload>({
    title: '',
    message: '',
    type: 'INFO',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // History query
  const {
    data: historyData,
    isLoading: historyLoading,
    isFetching: historyFetching,
    refetch,
  } = useQuery({
    queryKey: ['notifications-history'],
    queryFn: () => notificationsService.getHistory({ limit: 20 }),
  });

  const history: Notification[] = historyData?.data ?? [];

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (payload: BroadcastPayload) => notificationsService.broadcast(payload),
    onSuccess: (res) => {
      toast.success(`Notification sent to ${res.recipientCount?.toLocaleString() ?? 'all'} users!`);
      setForm({ title: '', message: '', type: 'INFO' });
      queryClient.invalidateQueries({ queryKey: ['notifications-history'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed to send notification'),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = () => {
    setConfirmOpen(false);
    broadcastMutation.mutate(form);
  };

  const selectedType = form.type as NotifType;
  const TypeIcon = TYPE_CONFIG[selectedType].icon;

  return (
    <div className='space-y-8'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 ring-1 ring-border/60'>
            <Bell className='h-5 w-5 text-violet-400' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Broadcast Notifications</h1>
            <p className='text-sm text-muted-foreground'>Send announcements to all platform users</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>

        {/* ── LEFT: Compose Form ── */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Send className='h-5 w-5 text-muted-foreground' />
              <CardTitle className='text-base'>Compose Notification</CardTitle>
            </div>
            <CardDescription>
              This notification will be sent to ALL users on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>

            {/* Type selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Notification Type</label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as NotifType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_CONFIG) as NotifType[]).map((key) => {
                    const cfg = TYPE_CONFIG[key];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className='flex items-center gap-2'>
                          <Icon className={cn('h-4 w-4', cfg.iconColor)} />
                          {cfg.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Title</label>
              <Input
                placeholder='Notification title...'
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={120}
              />
              <p className='text-right text-[11px] text-muted-foreground'>
                {form.title.length}/120
              </p>
            </div>

            {/* Message */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Message</label>
              <Textarea
                placeholder='Write your message here...'
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                rows={5}
                maxLength={500}
                className='resize-none'
              />
              <p className='text-right text-[11px] text-muted-foreground'>
                {form.message.length}/500
              </p>
            </div>

            {/* Preview */}
            {(form.title || form.message) && (
              <div className='rounded-xl border border-border/50 bg-muted/20 p-4'>
                <p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>Preview</p>
                <div className='flex items-start gap-3'>
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', TYPE_CONFIG[selectedType].bg)}>
                    <TypeIcon className={cn('h-4 w-4', TYPE_CONFIG[selectedType].iconColor)} />
                  </div>
                  <div>
                    <p className='text-sm font-semibold'>{form.title || 'Notification Title'}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>{form.message || 'Message body...'}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Warning */}
            <div className='flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
              <p className='text-xs text-amber-400/90'>
                This will send a notification to <strong>all registered users</strong>.
                Please review your message before sending.
              </p>
            </div>

            <Button
              className='w-full gap-2'
              onClick={handleSend}
              disabled={broadcastMutation.isPending || !form.title.trim() || !form.message.trim()}
            >
              {broadcastMutation.isPending ? (
                <RefreshCw className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
              {broadcastMutation.isPending ? 'Sending...' : 'Send to All Users'}
            </Button>
          </CardContent>
        </Card>

        {/* ── RIGHT: History ── */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <History className='h-5 w-5 text-muted-foreground' />
              <h2 className='text-base font-semibold'>Broadcast History</h2>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              onClick={() => refetch()}
              disabled={historyFetching}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', historyFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className='space-y-3'>
            {historyLoading && [1,2,3].map((i) => (
              <Skeleton key={i} className='h-24 rounded-xl' />
            ))}

            {!historyLoading && history.length === 0 && (
              <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 py-16'>
                <Bell className='h-10 w-10 text-muted-foreground/20' />
                <p className='text-sm text-muted-foreground'>No notifications sent yet</p>
              </div>
            )}

            <AnimatePresence>
              {history.map((notif) => (
                <HistoryItem key={notif.id} notif={notif} />
              ))}
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
              Confirm Broadcast
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className='space-y-3'>
                <p>You are about to send the following notification to <strong>all users</strong>:</p>
                <div className='rounded-lg border border-border/50 bg-muted/30 p-3'>
                  <p className='text-sm font-semibold text-foreground'>{form.title}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>{form.message}</p>
                </div>
                <p className='text-sm'>This action cannot be undone. Continue?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend} className='gap-2'>
              <Send className='h-4 w-4' /> Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
