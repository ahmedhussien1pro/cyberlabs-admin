import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
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
    <div className='flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center'>
      <SlidersHorizontal className='hidden h-4 w-4 shrink-0 text-muted-foreground sm:block' />
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search by title or slug...'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='h-9 pl-9 bg-background'
        />
      </div>
      <Select
        value={difficultyFilter}
        onValueChange={onDifficultyFilterChange}
      >
        <SelectTrigger className='h-9 w-full bg-background sm:w-44'>
          <SelectValue placeholder='All Levels' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>All Levels</SelectItem>
          <SelectItem value='BEGINNER'>Beginner</SelectItem>
          <SelectItem value='INTERMEDIATE'>Intermediate</SelectItem>
          <SelectItem value='ADVANCED'>Advanced</SelectItem>
          <SelectItem value='EXPERT'>Expert</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={publishedFilter}
        onValueChange={onPublishedFilterChange}
      >
        <SelectTrigger className='h-9 w-full bg-background sm:w-44'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='published'>Published</SelectItem>
          <SelectItem value='unpublished'>Draft</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
