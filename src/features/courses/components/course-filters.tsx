import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Difficulty } from '@/core/types';

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: Difficulty | 'ALL';
  onDifficultyFilterChange: (value: Difficulty | 'ALL') => void;
  publishedFilter: 'all' | 'published' | 'unpublished';
  onPublishedFilterChange: (value: 'all' | 'published' | 'unpublished') => void;
}

export function CourseFilters({
  search,
  onSearchChange,
  difficultyFilter,
  onDifficultyFilterChange,
  publishedFilter,
  onPublishedFilterChange,
}: CourseFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={difficultyFilter} onValueChange={onDifficultyFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Levels</SelectItem>
          <SelectItem value="BEGINNER">Beginner</SelectItem>
          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
          <SelectItem value="ADVANCED">Advanced</SelectItem>
        </SelectContent>
      </Select>
      <Select value={publishedFilter} onValueChange={onPublishedFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="unpublished">Unpublished</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
