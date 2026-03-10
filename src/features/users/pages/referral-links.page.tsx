// src/features/users/pages/referral-links.page.tsx
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { referralsService } from '@/core/api/services';
import type { ReferralLink } from '@/core/api/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  Link2, Copy, Check, Share2, Users, TrendingUp,
  Facebook, Twitter, Linkedin, MessageCircle,
  Plus, ExternalLink, BarChart2, Globe, User, Trash2,
} from 'lucide-react';

// ── Source config ─────────────────────────────────────────────────────────────
const SOURCE_CONFIG: Record<string, {
  icon: React.ElementType; color: string; bg: string; label: string;
}> = {
  facebook:  { icon: Facebook,      color: 'text-[#1877F2]',   bg: 'bg-[#1877F2]/10',  label: 'Facebook' },
  whatsapp:  { icon: MessageCircle, color: 'text-[#25D366]',   bg: 'bg-[#25D366]/10',  label: 'WhatsApp' },
  linkedin:  { icon: Linkedin,      color: 'text-[#0A66C2]',   bg: 'bg-[#0A66C2]/10',  label: 'LinkedIn' },
  twitter:   { icon: Twitter,       color: 'text-[#1DA1F2]',   bg: 'bg-[#1DA1F2]/10',  label: 'Twitter / X' },
  telegram:  { icon: MessageCircle, color: 'text-[#229ED9]',   bg: 'bg-[#229ED9]/10',  label: 'Telegram' },
  email:     { icon: Globe,         color: 'text-orange-400',  bg: 'bg-orange-500/10', label: 'Email' },
  direct:    { icon: Link2,         color: 'text-muted-foreground', bg: 'bg-muted/40', label: 'Direct' },
};

const SHARE_URL: Record<string, (url: string, text: string) => string> = {
  facebook: (u)    => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  twitter:  (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  linkedin: (u)    => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  whatsapp: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`,
  telegram: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
};

// ── Copy hook ─────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copied, copy };
}

// ── Create dialog ─────────────────────────────────────────────────────────────
function CreateLinkDialog({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { label: string; slug: string; source: string; targetUserId?: string; targetUserName?: string }) => void;
}) {
  const [label,    setLabel]    = useState('');
  const [source,   setSource]   = useState('facebook');
  const [userId,   setUserId]   = useState('');
  const [userName, setUserName] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleCreate = async () => {
    if (!label.trim()) { toast.error('أضف تسمية للرابط أولاً'); return; }
    setLoading(true);
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    try {
      await onCreate({ label, slug, source, targetUserId: userId || undefined, targetUserName: userName || undefined });
      setLabel(''); setSource('facebook'); setUserId(''); setUserName('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Link2 className='h-5 w-5 text-blue-400' /> إنشاء رابط إحالة
          </DialogTitle>
          <DialogDescription>أنشئ رابطاً قابلاً للتتبع لمشاركته على السوشيال ميديا</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='text-xs font-medium text-muted-foreground'>التسمية</label>
            <Input placeholder='مثال: حملة فيسبوك يناير'
              value={label} onChange={(e) => setLabel(e.target.value)} className='mt-1' />
          </div>

          <div>
            <label className='text-xs font-medium text-muted-foreground'>المنصة</label>
            <div className='mt-1 grid grid-cols-4 gap-2'>
              {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={key} onClick={() => setSource(key)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[10px] font-medium transition-all',
                      source === key
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                        : 'border-border/50 hover:border-border hover:bg-muted/40',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', source === key ? 'text-blue-400' : cfg.color)} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className='text-xs font-medium text-muted-foreground'>تخصيص لمستخدم (اختياري)</label>
            <Input placeholder='User ID أو اتركه فارغاً لرابط عام'
              value={userId} onChange={(e) => setUserId(e.target.value)} className='mt-1' />
          </div>
          {userId && (
            <div>
              <label className='text-xs font-medium text-muted-foreground'>اسم المستخدم (للمرجع)</label>
              <Input placeholder='مثال: أحمد حسين'
                value={userName} onChange={(e) => setUserName(e.target.value)} className='mt-1' />
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button variant='outline' onClick={onClose} disabled={loading}>إلغاء</Button>
          <Button onClick={handleCreate} disabled={loading} className='gap-1.5'>
            <Plus className='h-4 w-4' /> {loading ? 'جاري الإنشاء...' : 'إنشاء الرابط'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReferralLinksPage() {
  const { t } = useTranslation('referralLinks');
  const qc = useQueryClient();
  const { copied, copy } = useCopy();
  const [showCreate,    setShowCreate]    = useState(false);
  const [search,        setSearch]        = useState('');
  const [filterSource,  setFilterSource]  = useState('ALL');
  const [deleteTarget,  setDeleteTarget]  = useState<ReferralLink | null>(null);

  // ── Queries & mutations ───────────────────────────────────────────────────
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn:  referralsService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['referrals', 'stats'],
    queryFn:  referralsService.getStats,
  });

  const createMutation = useMutation({
    mutationFn: referralsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('تم إنشاء الرابط بنجاح ✅');
    },
    onError: () => toast.error('فشل إنشاء الرابط'),
  });

  const deleteMutation = useMutation({
    mutationFn: referralsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('تم حذف الرابط');
      setDeleteTarget(null);
    },
    onError: () => toast.error('فشل حذف الرابط'),
  });

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = links.filter((l: ReferralLink) => {
    const matchSearch = l.label.toLowerCase().includes(search.toLowerCase());
    const matchSource = filterSource === 'ALL' || l.source === filterSource;
    return matchSearch && matchSource;
  });

  const totalClicks        = stats?.totalClicks        ?? links.reduce((s: number, l: ReferralLink) => s + l.clicks, 0);
  const totalRegistrations = stats?.totalRegistrations ?? links.reduce((s: number, l: ReferralLink) => s + l.registrations, 0);
  const conversionRate     = totalClicks > 0 ? Math.round((totalRegistrations / totalClicks) * 100) : 0;

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col overflow-hidden'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between border-b border-border/60 bg-background px-5 py-3 flex-wrap gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-border/60'>
            <Share2 className='h-4 w-4 text-blue-400' />
          </div>
          <div>
            <h1 className='text-base font-bold leading-none'>روابط الإحالة</h1>
            <p className='mt-0.5 text-xs text-muted-foreground'>اعرف من أين جاء مستخدموك</p>
          </div>
        </div>
        <Button size='sm' className='gap-1.5 text-xs' onClick={() => setShowCreate(true)}>
          <Plus className='h-4 w-4' /> رابط جديد
        </Button>
      </div>

      {/* ── Stats strip ── */}
      <div className='grid grid-cols-2 gap-3 border-b border-border/40 bg-muted/10 px-5 py-3 sm:grid-cols-4'>
        {[
          { icon: Link2,      color: 'text-blue-400',    value: links.length,        label: 'إجمالي الروابط' },
          { icon: TrendingUp, color: 'text-emerald-400', value: totalClicks,          label: 'إجمالي النقرات' },
          { icon: Users,      color: 'text-violet-400',  value: totalRegistrations,   label: 'التسجيلات' },
          { icon: BarChart2,  color: 'text-amber-400',   value: `${conversionRate}%`, label: 'معدل التحويل' },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className='flex items-center gap-3 rounded-lg border border-border/40 bg-card px-3 py-2'>
            <Icon className={cn('h-5 w-5 shrink-0', color)} />
            <div>
              <p className='text-xl font-bold'>{isLoading ? '—' : value.toLocaleString()}</p>
              <p className='text-[10px] text-muted-foreground'>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* ── Sidebar: platforms ── */}
        <aside className='hidden w-52 shrink-0 flex-col border-r border-border/60 bg-muted/10 lg:flex'>
          <p className='px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
            حسب المنصة
          </p>
          <ScrollArea className='flex-1'>
            <div className='space-y-0.5 px-2 pb-3'>
              <button
                onClick={() => setFilterSource('ALL')}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all',
                  filterSource === 'ALL'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'hover:bg-muted/50 text-muted-foreground',
                )}
              >
                <span className='flex items-center gap-2'><Globe className='h-3.5 w-3.5' /> جميع المنصات</span>
                <Badge variant='secondary' className='text-[10px] h-4'>{links.length}</Badge>
              </button>

              {Object.entries(SOURCE_CONFIG).map(([src, cfg]) => {
                const Icon  = cfg.icon;
                const count = links.filter((l: ReferralLink) => l.source === src).length;
                const srcStat = stats?.bySource?.find((s) => s.source === src);
                return (
                  <button key={src} onClick={() => setFilterSource(src)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-xs transition-all',
                      filterSource === src ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-muted/50',
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center gap-2'>
                        <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                        {cfg.label}
                      </span>
                      <Badge variant='secondary' className='text-[10px] h-4'>{count}</Badge>
                    </div>
                    {srcStat && srcStat.clicks > 0 && (
                      <div className='mt-1 flex gap-3 text-[10px] text-muted-foreground'>
                        <span>{srcStat.clicks} نقرة</span>
                        <span className='text-emerald-400'>
                          {Math.round((srcStat.registrations / srcStat.clicks) * 100)}% تحويل
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* ── Links list ── */}
        <main className='flex flex-1 flex-col overflow-hidden'>
          <div className='border-b border-border/40 px-4 py-2'>
            <div className='relative'>
              <Link2 className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input placeholder='ابحث في الروابط...'
                value={search} onChange={(e) => setSearch(e.target.value)}
                className='pl-9 h-8 text-xs' />
            </div>
          </div>

          <ScrollArea className='flex-1'>
            <div className='space-y-2 p-4'>
              {isLoading && (
                [1,2,3].map((i) => <Skeleton key={i} className='h-24 rounded-xl' />)
              )}

              {!isLoading && filtered.length === 0 && (
                <div className='flex flex-col items-center justify-center gap-3 py-20'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30'>
                    <Link2 className='h-8 w-8 text-muted-foreground/30' />
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>لا توجد روابط بعد</p>
                  <Button variant='outline' size='sm' className='gap-1.5 text-xs' onClick={() => setShowCreate(true)}>
                    <Plus className='h-3.5 w-3.5' /> أنشئ أول رابط
                  </Button>
                </div>
              )}

              {filtered.map((link: ReferralLink) => {
                const cfg      = SOURCE_CONFIG[link.source] ?? SOURCE_CONFIG.direct;
                const Icon     = cfg.icon;
                const shareUrl = SHARE_URL[link.source];
                const conv     = link.clicks > 0
                  ? Math.round((link.registrations / link.clicks) * 100) : 0;

                return (
                  <div key={link.id}
                    className='rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-border'
                  >
                    <div className='flex items-start justify-between gap-3 flex-wrap'>
                      <div className='flex items-center gap-3'>
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                          <Icon className={cn('h-4 w-4', cfg.color)} />
                        </div>
                        <div>
                          <p className='font-semibold text-sm'>{link.label}</p>
                          <div className='mt-0.5 flex items-center gap-2 flex-wrap'>
                            <Badge variant='outline' className='text-[10px] h-4'>{cfg.label}</Badge>
                            {link.targetUserName && (
                              <Badge variant='outline' className='text-[10px] h-4 border-violet-500/30 text-violet-400'>
                                <User className='mr-1 h-2.5 w-2.5' />{link.targetUserName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <TrendingUp className='h-3.5 w-3.5 text-emerald-400' />{link.clicks} نقرة
                        </span>
                        <span className='flex items-center gap-1'>
                          <Users className='h-3.5 w-3.5 text-violet-400' />{link.registrations} تسجيل
                        </span>
                        <span className='text-amber-400 font-medium'>{conv}% تحويل</span>
                        <button
                          onClick={() => setDeleteTarget(link)}
                          className='text-muted-foreground/50 hover:text-destructive transition-colors'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    </div>

                    {/* URL row */}
                    <div className='mt-3 flex items-center gap-2'>
                      <div className='flex-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-muted-foreground truncate'>
                        {link.url}
                      </div>
                      <Button variant='outline' size='icon' className='h-8 w-8 shrink-0'
                        onClick={() => { copy(link.url, link.id); toast.success('تم النسخ!'); }}>
                        {copied === link.id
                          ? <Check className='h-3.5 w-3.5 text-emerald-400' />
                          : <Copy className='h-3.5 w-3.5' />}
                      </Button>
                      {shareUrl && (
                        <Button variant='outline' size='icon' className='h-8 w-8 shrink-0'
                          onClick={() => window.open(shareUrl(link.url, 'انضم إلى CyberLabs!'), '_blank')}>
                          <ExternalLink className='h-3.5 w-3.5' />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* ── Create dialog ── */}
      <CreateLinkDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => createMutation.mutateAsync(data)}
      />

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الرابط؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف <strong>{deleteTarget?.label}</strong> بشكل نهائي ولا يمكن استعادته.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
