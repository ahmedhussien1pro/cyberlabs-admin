import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants';
import type { LabListItem, PaginationMeta } from '@/core/types';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface LabsTableProps {
  data: LabListItem[];
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
}

export function LabsTable({ data, meta, page, onPageChange }: LabsTableProps) {
  if (data.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No labs found</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="p-4 text-left text-sm font-medium">Lab</th>
              <th className="p-4 text-left text-sm font-medium">Category</th>
              <th className="p-4 text-left text-sm font-medium">Difficulty</th>
              <th className="p-4 text-left text-sm font-medium">Mode</th>
              <th className="p-4 text-left text-sm font-medium">Status</th>
              <th className="p-4 text-left text-sm font-medium">Stats</th>
              <th className="p-4 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((lab) => (
              <tr key={lab.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{lab.title}</div>
                    <div className="text-sm text-muted-foreground">{lab.slug}</div>
                  </div>
                </td>
                <td className="p-4">
                  {lab.category ? (
                    <Badge variant="outline">{lab.category}</Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-4">
                  {lab.difficulty ? <Badge>{lab.difficulty}</Badge> : '—'}
                </td>
                <td className="p-4">
                  {lab.executionMode ? (
                    <Badge variant="secondary">{lab.executionMode}</Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-4">
                  <Badge variant={lab.isPublished ? 'default' : 'secondary'}>
                    {lab.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <div>{lab._count.submissions} submissions</div>
                    <div className="text-muted-foreground">
                      {lab._count.usersProgress} in progress
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Link to={ROUTES.LAB_DETAIL(lab.id)}>
                    <Button variant="ghost" size="sm">
                      View <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === meta.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
