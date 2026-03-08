import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Difficulty, LabCategory, LabExecutionMode } from '@/core/types';

interface LabFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: Difficulty | 'ALL';
  onDifficultyFilterChange: (value: Difficulty | 'ALL') => void;
  categoryFilter: LabCategory | 'ALL';
  onCategoryFilterChange: (value: LabCategory | 'ALL') => void;
  executionModeFilter: LabExecutionMode | 'ALL';
  onExecutionModeFilterChange: (value: LabExecutionMode | 'ALL') => void;
  publishedFilter: 'all' | 'published' | 'unpublished';
  onPublishedFilterChange: (value: 'all' | 'published' | 'unpublished') => void;
}

export function LabFilters({
  search,
  onSearchChange,
  difficultyFilter,
  onDifficultyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  publishedFilter,
  onPublishedFilterChange,
}: LabFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search labs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={difficultyFilter} onValueChange={onDifficultyFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Levels</SelectItem>
          <SelectItem value="BEGINNER">Beginner</SelectItem>
          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
          <SelectItem value="ADVANCED">Advanced</SelectItem>
          <SelectItem value="EXPERT">Expert</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          <SelectItem value="WEB_SECURITY">Web Security</SelectItem>
          <SelectItem value="NETWORK_SECURITY">Network Security</SelectItem>
          <SelectItem value="CRYPTOGRAPHY">Cryptography</SelectItem>
          <SelectItem value="FORENSICS">Forensics</SelectItem>
          <SelectItem value="REVERSE_ENGINEERING">Reverse Engineering</SelectItem>
          <SelectItem value="BINARY_EXPLOITATION">Binary Exploitation</SelectItem>
          <SelectItem value="OSINT">OSINT</SelectItem>
          <SelectItem value="MISC">Misc</SelectItem>
        </SelectContent>
      </Select>
      <Select value={publishedFilter} onValueChange={onPublishedFilterChange}>
        <SelectTrigger>
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
