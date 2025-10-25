'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { LabCard } from '@/components/lab-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Grid, List, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLabs, setTotalLabs] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(debouncedSearchTerm.trim() && { search: debouncedSearchTerm.trim() }),
        status: 'published',
      });

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
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const difficultyParam = searchParams.get('difficulty') || '';
    const searchParam = searchParams.get('search') || '';
    const pageParam = Number(searchParams.get('page') || '1');

    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }

    if (difficultyParam !== selectedDifficulty) {
      setSelectedDifficulty(difficultyParam);
    }

    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }

    if (!Number.isNaN(pageParam) && pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [searchParams, selectedCategory, selectedDifficulty, searchTerm, currentPage]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = (params.toString() ? `/dashboard?${params}` : '/dashboard') as Route;
    router.push(newUrl, { scroll: false });
  }, [currentPage, router, searchTerm, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedDifficulty,
    searchTerm,
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Networking Labs</h1>
          <p className="text-muted-foreground">
            Discover and explore network topology labs from the community
            {totalLabs > 0 && ` ${totalLabs} labs available`}
          </p>
        </div>

        <Button asChild>
          <Link href="/upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Lab
          </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Select value={selectedCategory} onValueChange={(value) => {
              const v = value === 'all' ? '' : value;
              setSelectedCategory(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Routing">Routing</SelectItem>
                <SelectItem value="Switching">Switching</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="MPLS">MPLS</SelectItem>
                <SelectItem value="Wireless">Wireless</SelectItem>
                <SelectItem value="Voice">Voice</SelectItem>
                <SelectItem value="Data Center">Data Center</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={(value) => {
              const v = value === 'all' ? '' : value;
              setSelectedDifficulty(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="flex flex-wrap gap-1">
                {selectedCategory && (
                  <Badge variant="secondary">Category: {selectedCategory}</Badge>
                )}
                {selectedDifficulty && (
                  <Badge variant="secondary">Level: {selectedDifficulty}</Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: &quot;{searchTerm}&quot;
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {loading ? 'Loading labs...' : `${totalLabs} labs found`}
            </h2>
            {!loading && labs.length === 0 && (
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Labs Grid/List */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
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
        ) : labs.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {labs.map((lab) => (
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
                <Button asChild>
                  <Link href="/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Lab
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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



















