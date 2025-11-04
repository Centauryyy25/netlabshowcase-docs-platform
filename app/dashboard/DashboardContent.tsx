'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { toast } from 'sonner';
import { LabCard } from '@/components/lab-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, Grid, List, Upload, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useModalManager } from '@/context/ModalManagerContext';

interface Lab {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: string;
  tags: string[];
  topologyImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
}

interface LabsResponse {
  labs: Lab[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type DashboardContentProps = {
  defaultCategory?: string;
};

const CATEGORY_OPTIONS = [
  'Routing',
  'Switching',
  'Security',
  'MPLS',
  'Wireless',
  'Voice',
  'Data Center',
  'Other',
] as const;

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;

const TAG_OPTIONS = [
  'Automation',
  'Troubleshooting',
  'Lab Guide',
  'Exam Prep',
  'Topology',
  'Beginner Friendly',
] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Updated' },
  { value: 'oldest', label: 'Oldest Updated' },
  { value: 'title-asc', label: 'Title A to Z' },
  { value: 'title-desc', label: 'Title Z to A' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

type SlugOption = {
  label: string;
  slug: string;
};

const toSlug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createSlugOptions = (options: readonly string[]): SlugOption[] =>
  options.map((label) => ({
    label,
    slug: toSlug(label),
  }));

const createSlugLookup = (options: SlugOption[]) =>
  options.reduce<Record<string, string>>((acc, option) => {
    acc[option.slug] = option.label;
    return acc;
  }, {});

const arraysAreEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const normalizeDifficulty = (value: string | null) => {
  if (!value) return '';
  const match = DIFFICULTY_OPTIONS.find(
    (option) => option.toLowerCase() === value.toLowerCase(),
  );
  return match ?? '';
};

const ensureSortOption = (value: string | null): SortOption => {
  if (!value) return 'recent';
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortOption)
    : 'recent';
};

const CATEGORY_SLUG_OPTIONS = createSlugOptions(CATEGORY_OPTIONS);
const CATEGORY_SLUG_LOOKUP = createSlugLookup(CATEGORY_SLUG_OPTIONS);
const TAG_SLUG_OPTIONS = createSlugOptions(TAG_OPTIONS);
const TAG_SLUG_LOOKUP = createSlugLookup(TAG_SLUG_OPTIONS);

export default function DashboardContent(
  { defaultCategory = '' }: DashboardContentProps = {},
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramsSignature = searchParams.toString();
  const defaultCategorySlug = defaultCategory ? toSlug(defaultCategory) : '';
  const { openQuickUpload } = useModalManager();

  const initialSearchTerm = searchParams.get('search') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);

  const initialCategorySlug = (() => {
    const param = searchParams.get('category');
    if (param) return toSlug(param);
    return defaultCategorySlug;
  })();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);

  const initialDifficulty = normalizeDifficulty(searchParams.get('difficulty'));
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  const initialSortOption = ensureSortOption(searchParams.get('sort'));
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);

  const initialTagSlugs = (() => {
    const param = searchParams.get('tags');
    if (!param) return [];
    return Array.from(new Set(param.split(',').filter(Boolean).map(toSlug)));
  })();
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(initialTagSlugs);

  const initialPage = Number(searchParams.get('page') || '1');
  const [currentPage, setCurrentPage] = useState(Number.isNaN(initialPage) ? 1 : initialPage);

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLabs, setTotalLabs] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [onlyWithTopologyImage, setOnlyWithTopologyImage] = useState(
    searchParams.get('topology') === 'true',
  );

  // Keep user input responsive while synchronizing everything off the debounced value.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        status: 'published',
      });

      const categoryForApi = selectedCategorySlug
        ? CATEGORY_SLUG_LOOKUP[selectedCategorySlug] ?? selectedCategorySlug
        : '';

      if (categoryForApi) {
        params.set('category', categoryForApi);
      }

      if (selectedDifficulty) {
        params.set('difficulty', selectedDifficulty);
      }

      if (debouncedSearchTerm.trim()) {
        params.set('search', debouncedSearchTerm.trim());
      }

      params.set('sort', sortOption);

      if (selectedTagSlugs.length > 0) {
        params.set('tags', selectedTagSlugs.join(','));
      }

      if (onlyWithTopologyImage) {
        params.set('topology', 'true');
      }

      const response = await fetch(`/api/labs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch labs');

      const data: LabsResponse = await response.json();
      setLabs(data.labs);
      setTotalPages(data.pagination.pages);
      setTotalLabs(data.pagination.total);
    } catch (error) {
      console.error('Error fetching labs:', error);
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedCategorySlug,
    selectedDifficulty,
    sortOption,
    selectedTagSlugs,
    onlyWithTopologyImage,
  ]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Read the URL signature into local state once per change to keep filters aligned.
  useEffect(() => {
    const params = new URLSearchParams(paramsSignature);

    const urlCategorySlug = (() => {
      const value = params.get('category');
      if (value) return toSlug(value);
      return defaultCategorySlug;
    })();
    setSelectedCategorySlug((prev) =>
      prev === urlCategorySlug ? prev : urlCategorySlug,
    );

    const urlDifficulty = normalizeDifficulty(params.get('difficulty'));
    setSelectedDifficulty((prev) =>
      prev === urlDifficulty ? prev : urlDifficulty,
    );

    const urlSearch = params.get('search') ?? '';
    setSearchTerm((prev) => (prev === urlSearch ? prev : urlSearch));

    const urlSort = ensureSortOption(params.get('sort'));
    setSortOption((prev) => (prev === urlSort ? prev : urlSort));

    const urlTagSlugs = (() => {
      const raw = params.get('tags');
      if (!raw) return [] as string[];
      return Array.from(new Set(raw.split(',').filter(Boolean).map(toSlug)));
    })();
    setSelectedTagSlugs((prev) =>
      arraysAreEqual(prev, urlTagSlugs) ? prev : urlTagSlugs,
    );

    const urlTopology = params.get('topology') === 'true';
    setOnlyWithTopologyImage((prev) =>
      prev === urlTopology ? prev : urlTopology,
    );

    const urlPage = Number(params.get('page') || '1');
    const safePage = Number.isNaN(urlPage) ? 1 : urlPage;
    setCurrentPage((prev) => (prev === safePage ? prev : safePage));
  }, [paramsSignature, defaultCategorySlug]);

  // Whenever filters settle (including the debounced search), update the URL in place.
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchTerm.trim()) {
      params.set('search', debouncedSearchTerm.trim());
    }

    if (selectedCategorySlug) {
      params.set('category', selectedCategorySlug);
    }

    if (selectedDifficulty) {
      params.set('difficulty', selectedDifficulty);
    }

    if (sortOption !== 'recent') {
      params.set('sort', sortOption);
    }

    if (selectedTagSlugs.length > 0) {
      params.set('tags', selectedTagSlugs.join(','));
    }

    if (onlyWithTopologyImage) {
      params.set('topology', 'true');
    }

    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const nextSignature = params.toString();
    if (nextSignature === paramsSignature) {
      return;
    }

    const nextUrl = (nextSignature ? `/dashboard?${nextSignature}` : '/dashboard') as Route;
    router.replace(nextUrl, { scroll: false });
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedCategorySlug,
    selectedDifficulty,
    sortOption,
    selectedTagSlugs,
    onlyWithTopologyImage,
    paramsSignature,
    router,
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategorySlug('');
    setSelectedDifficulty('');
    setSortOption('recent');
    setSelectedTagSlugs([]);
    setOnlyWithTopologyImage(false);
    setCurrentPage(1);
  };

  const advancedFiltersCount = Number(onlyWithTopologyImage) + selectedTagSlugs.length;
  const advancedFiltersActive = advancedFiltersCount > 0;

  const activeFiltersCount =
    Number(Boolean(selectedCategorySlug)) +
    Number(Boolean(selectedDifficulty)) +
    Number(Boolean(debouncedSearchTerm.trim())) +
    Number(sortOption !== 'recent') +
    Number(onlyWithTopologyImage) +
    selectedTagSlugs.length;

  const selectedCategoryLabel =
    selectedCategorySlug
      ? CATEGORY_SLUG_LOOKUP[selectedCategorySlug] ?? selectedCategorySlug
      : '';

  const sortedLabs = useMemo(() => {
    const copy = [...labs];
    switch (sortOption) {
      case 'oldest':
        return copy.sort(
          (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        );
      case 'title-asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      case 'recent':
      default:
        return copy.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }
  }, [labs, sortOption]);

  const displayLabs = useMemo(() => {
    return sortedLabs.filter((lab) => {
      if (onlyWithTopologyImage && !lab.topologyImageUrl) {
        return false;
      }

      if (selectedCategorySlug && toSlug(lab.category) !== selectedCategorySlug) {
        return false;
      }

      if (
        selectedDifficulty &&
        lab.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()
      ) {
        return false;
      }

      if (selectedTagSlugs.length > 0) {
        const labTagSlugs = lab.tags.map(toSlug);
        const matchesAllTags = selectedTagSlugs.every((tagSlug) =>
          labTagSlugs.includes(tagSlug),
        );
        if (!matchesAllTags) {
          return false;
        }
      }

      return true;
    });
  }, [sortedLabs, onlyWithTopologyImage, selectedCategorySlug, selectedDifficulty, selectedTagSlugs]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Networking Labs</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Discover and explore network topology labs from the community
            {totalLabs > 0 && ` ${totalLabs} labs available`}
          </p>
        </div>

        <Button
          type="button"
          onClick={openQuickUpload}
          className="flex h-11 w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Upload Lab
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search labs by title or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategorySlug || 'all'}
              onValueChange={(value) => {
                const nextValue = value === 'all' ? '' : value;
                setSelectedCategorySlug(nextValue);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_SLUG_OPTIONS.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select
              value={selectedDifficulty || 'all'}
              onValueChange={(value) => {
                const nextValue = value === 'all' ? '' : value;
                setSelectedDifficulty(nextValue);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortOption}
              onValueChange={(value: SortOption) => {
                setSortOption(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced filters menu keeps secondary filters tucked away */}
            <div className="flex md:col-span-1 md:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={advancedFiltersActive ? 'default' : 'outline'}
                    className="h-11 w-full justify-between md:w-auto md:min-w-[11rem]"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <SlidersHorizontal className="h-4 w-4" />
                      Advanced filters
                    </span>
                    {advancedFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {advancedFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Topology
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={onlyWithTopologyImage}
                    onCheckedChange={(checked) => {
                      setOnlyWithTopologyImage(Boolean(checked));
                      setCurrentPage(1);
                    }}
                  >
                    Only show labs with topology image
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tags
                  </DropdownMenuLabel>
                  {TAG_SLUG_OPTIONS.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag.slug}
                      checked={selectedTagSlugs.includes(tag.slug)}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked);
                        setSelectedTagSlugs((prev) => {
                          if (isChecked) {
                            if (prev.includes(tag.slug)) {
                              return prev;
                            }
                            return [...prev, tag.slug];
                          }
                          return prev.filter((existing) => existing !== tag.slug);
                        });
                        setCurrentPage(1);
                      }}
                    >
                      {tag.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" className="h-10 w-full sm:w-auto" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="flex flex-wrap gap-2">
                {selectedCategorySlug && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Category: {selectedCategoryLabel}
                    <button
                      type="button"
                      aria-label="Remove category filter"
                      onClick={() => {
                        setSelectedCategorySlug('');
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedDifficulty && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Level: {selectedDifficulty}
                    <button
                      type="button"
                      aria-label="Remove difficulty filter"
                      onClick={() => {
                        setSelectedDifficulty('');
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {debouncedSearchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Search: &quot;{debouncedSearchTerm}&quot;
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {sortOption !== 'recent' && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Sort: {SORT_OPTIONS.find((option) => option.value === sortOption)?.label}
                    <button
                      type="button"
                      aria-label="Reset sort"
                      onClick={() => {
                        setSortOption('recent');
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {onlyWithTopologyImage && (
                  <Badge variant="secondary" className="flex items-center gap-1 pr-1">
                    Topology image
                    <button
                      type="button"
                      aria-label="Show all labs"
                      onClick={() => {
                        setOnlyWithTopologyImage(false);
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedTagSlugs.map((tagSlug) => (
                  <Badge key={tagSlug} variant="secondary" className="flex items-center gap-1 pr-1">
                    Tag: {TAG_SLUG_LOOKUP[tagSlug] ?? tagSlug}
                    <button
                      type="button"
                      aria-label={`Remove tag ${TAG_SLUG_LOOKUP[tagSlug] ?? tagSlug}`}
                      onClick={() => {
                        setSelectedTagSlugs((prev) =>
                          prev.filter((existingTag) => existingTag !== tagSlug),
                        );
                        setCurrentPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              {loading
                ? 'Loading labs...'
                : `${displayLabs.length} lab${displayLabs.length === 1 ? '' : 's'} matching filters`}
            </h2>
            {!loading && displayLabs.length === 0 && (
              <p className="text-sm text-muted-foreground sm:text-base">
                Try adjusting your filters or search terms
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="h-10 w-12"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className="h-10 w-12"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Labs Grid/List */}
        {loading ? (
          <div
            className={`grid gap-5 sm:gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-full">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayLabs.length > 0 ? (
          <div
            className={`grid gap-5 sm:gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {displayLabs.map((lab) => (
              <LabCard
                key={lab.id}
                {...lab}
                className={viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl" aria-hidden="true">??</div>
                <div>
                  <h3 className="text-lg font-semibold">No labs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or be the first to upload a lab in this category!
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-11 w-full sm:w-auto"
                  onClick={openQuickUpload}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Lab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && displayLabs.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const isCurrentPage = page === currentPage;

                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 min-w-[2.5rem]"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-2 text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 min-w-[2.5rem]"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
