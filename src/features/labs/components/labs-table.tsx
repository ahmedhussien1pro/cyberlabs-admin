import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/shared/constants';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import type { LabListItem, PaginationMeta } from '@/core/types';

interface LabsTableProps {
  data: LabListItem[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export function LabsTable({ data, meta, page, onPageChange }: LabsTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('labs');
  const { locale } = useLocale();

  if (data.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">{t('noLabs')}</p>
        <p className="text-sm text-muted-foreground">{t('noLabsHint')}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="p-4 text-start text-sm font-medium">{t('colLab')}</th>
              <th className="p-4 text-start text-sm font-medium">{t('colCategory')}</th>
              <th className="p-4 text-start text-sm font-medium">{t('colDifficulty')}</th>
              <th className="p-4 text-start text-sm font-medium">{t('colMode')}</th>
              <th className="p-4 text-start text-sm font-medium">{t('colStatus')}</th>
              <th className="p-4 text-start text-sm font-medium">{t('colStats')}</th>
              <th className="p-4 text-end text-sm font-medium">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lab) => {
              const displayTitle = locale === 'ar' && lab.ar_title ? lab.ar_title : lab.title;
              return (
                <tr
                  key={lab.id}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(ROUTES.LAB_DETAIL(lab.id))}
                >
                  <td className="p-4">
                    <div className="font-medium" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{displayTitle}</div>
                    <div className="text-sm text-muted-foreground font-mono">{lab.slug}</div>
                  </td>
                  <td className="p-4">
                    {lab.category
                      ? <Badge variant="outline">{t(lab.category as any, { defaultValue: lab.category })}</Badge>
                      : '—'}
                  </td>
                  <td className="p-4">
                    {lab.difficulty
                      ? <Badge>{t(lab.difficulty as any, { defaultValue: lab.difficulty })}</Badge>
                      : '—'}
                  </td>
                  <td className="p-4">
                    {lab.executionMode
                      ? <Badge variant="secondary">{t(lab.executionMode as any, { defaultValue: lab.executionMode })}</Badge>
                      : '—'}
                  </td>
                  <td className="p-4">
                    <Badge variant={lab.isPublished ? 'default' : 'secondary'}>
                      {lab.isPublished ? t('statusPublished') : t('statusDraft')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div>{lab._count?.submissions ?? 0} {t('submissions')}</div>
                      <div className="text-muted-foreground">{lab._count?.usersProgress ?? 0} {t('inProgress')}</div>
                    </div>
                  </td>
                  <td className="p-4 text-end" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LAB_DETAIL(lab.id))}>
                      {t('view')} <ExternalLink className="ms-2 h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            {t('page')} {meta.page} {t('of')} {meta.totalPages} ({meta.total})
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" /> {t('previous')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === meta.totalPages}>
              {t('next')} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
