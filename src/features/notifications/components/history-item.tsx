// src/features/notifications/components/history-item.tsx
import { motion } from 'framer-motion';
import { Clock, Users, MessageSquare, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/core/api/services/notifications.service';
import { TYPE_META, type NotifType } from '../constants/type-meta';

export function HistoryItem({ notif }: { notif: Notification }) {
  const { t } = useTranslation('notifications');
  const meta = TYPE_META[notif.type as NotifType] ?? TYPE_META.INFO;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border'>
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
              <User className='mr-1 h-2.5 w-2.5' />
              {notif.targetUser.name}
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
