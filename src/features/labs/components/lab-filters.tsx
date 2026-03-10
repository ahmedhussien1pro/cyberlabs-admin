import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useLabsT } from '@/hooks/use-locale';

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'submissions';

interface LabFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  executionModeFilter: string;
  onExecutionModeFilterChange: (value: string) => void;
  publishedFilter: 'all' | 'published' | 'unpublished';
  onPublishedFilterChange: (value: 'all' | 'published' | 'unpublished') => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function LabFilters({
  search,
  onSearchChange,
  difficultyFilter,
  onDifficultyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  executionModeFilter,
  onExecutionModeFilterChange,
  publishedFilter,
  onPublishedFilterChange,
  sort,
  onSortChange,
}: LabFiltersProps) {
  const t = useLabsT();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-6">
        {/* Search - full width on mobile, 2 cols on md */}
        <div className="relative md:col-span-2">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ps-9"
            dir="auto"
            autoComplete="off"
          />
        </div>

        {/* Difficulty */}
        <Select value={difficultyFilter} onValueChange={onDifficultyFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.allLevels} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t.allLevels}</SelectItem>
            <SelectItem value="BEGINNER">{t.BEGINNER}</SelectItem>
            <SelectItem value="INTERMEDIATE">{t.INTERMEDIATE}</SelectItem>
            <SelectItem value="ADVANCED">{t.ADVANCED}</SelectItem>
            <SelectItem value="EXPERT">{t.EXPERT}</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t.allCategories}</SelectItem>
            <SelectItem value="WEB_SECURITY">{t.WEB_SECURITY}</SelectItem>
            <SelectItem value="NETWORK_SECURITY">{t.NETWORK_SECURITY}</SelectItem>
            <SelectItem value="CRYPTOGRAPHY">{t.CRYPTOGRAPHY}</SelectItem>
            <SelectItem value="FORENSICS">{t.FORENSICS}</SelectItem>
            <SelectItem value="REVERSE_ENGINEERING">{t.REVERSE_ENGINEERING}</SelectItem>
            <SelectItem value="BINARY_EXPLOITATION">{t.BINARY_EXPLOITATION}</SelectItem>
            <SelectItem value="OSINT">{t.OSINT}</SelectItem>
            <SelectItem value="MISC">{t.MISC}</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={publishedFilter} onValueChange={onPublishedFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatus}</SelectItem>
            <SelectItem value="published">{t.statusPublishedFilter}</SelectItem>
            <SelectItem value="unpublished">{t.statusUnpublishedFilter}</SelectItem>
          </SelectContent>
        </Select>

        {/* Execution Mode */}
        <Select value={executionModeFilter} onValueChange={onExecutionModeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder={t.allModes} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t.allModes}</SelectItem>
            <SelectItem value="FRONTEND">{t.FRONTEND}</SelectItem>
            <SelectItem value="SHARED_BACKEND">{t.SHARED_BACKEND}</SelectItem>
            <SelectItem value="DOCKER">{t.DOCKER}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{t.sortBy}:</span>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t.sortNewest}</SelectItem>
            <SelectItem value="oldest">{t.sortOldest}</SelectItem>
            <SelectItem value="title_asc">{t.sortTitle}</SelectItem>
            <SelectItem value="title_desc">{t.sortTitleDesc}</SelectItem>
            <SelectItem value="submissions">{t.sortSubmissions}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
