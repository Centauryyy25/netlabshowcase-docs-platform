"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LabCard } from "@/components/lab-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Filter, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface Lab {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
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

const categories = [
  "All",
  "Routing",
  "Switching",
  "Security",
  "MPLS",
  "Wireless",
  "Voice",
  "Data Center",
  "Other",
] as const;

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export default function LabsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get("difficulty") ?? "All");
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = Number(searchParams.get("page"));
    return Number.isNaN(pageParam) ? 1 : Math.max(pageParam, 1);
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalLabs, setTotalLabs] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedDifficulty]);

  const updateUrlParams = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams();
      if (debouncedSearch.trim()) {
        next.set("search", debouncedSearch.trim());
      }
      if (selectedCategory !== "All") {
        next.set("category", selectedCategory);
      }
      if (selectedDifficulty !== "All") {
        next.set("difficulty", selectedDifficulty);
      }
      if (params.page && Number(params.page) > 1) {
        next.set("page", String(params.page));
      }
      const url = next.toString() ? `?${next.toString()}` : "";
      router.replace(`/labs${url}`, { scroll: false });
    },
    [debouncedSearch, selectedCategory, selectedDifficulty, router]
  );

  const fetchLabs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "9",
        status: "published",
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (selectedCategory !== "All") {
        params.set("category", selectedCategory);
      }
      if (selectedDifficulty !== "All") {
        params.set("difficulty", selectedDifficulty);
      }

      const response = await fetch(`/api/labs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load labs");
      }

      const data: LabsResponse = await response.json();
      setLabs(data.labs);
      setTotalPages(data.pagination.pages);
      setTotalLabs(data.pagination.total);
      updateUrlParams({ page: currentPage });
    } catch (error) {
      console.error("Failed to fetch labs", error);
      toast.error("Unable to load labs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, selectedDifficulty, updateUrlParams]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const categoryFilters = useMemo(() => categories, []);
  const difficultyFilters = useMemo(() => difficulties, []);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setCurrentPage(1);
    router.replace("/labs", { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Labs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40 p-6 shadow-sm dark:border-slate-800/60 dark:bg-gradient-to-br dark:from-[#0a1228] dark:via-[#050b1d]/85 dark:to-[#040816] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-1 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200">
                <Filter className="h-4 w-4 text-sky-500" />
                Guided Filters
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
                  Explore Community Labs
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  Browse curated network topologies, configuration walk-throughs, and troubleshooting playbooks designed by EtherDocs builders. Refine by category, skill level, or keywords to match your study goals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200" variant="secondary">
                  {totalLabs} published labs
                </Badge>
                {selectedCategory !== "All" && (
                  <Badge variant="outline" className="border-slate-200/70 bg-white/80 text-slate-800 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                    Category: {selectedCategory}
                  </Badge>
                )}
                {selectedDifficulty !== "All" && (
                  <Badge variant="outline" className="border-slate-200/70 bg-white/80 text-slate-800 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                    Difficulty: {selectedDifficulty}
                  </Badge>
                )}
              </div>
            </div>

            <div className="w-full max-w-md space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60">
              <label htmlFor="lab-search" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Search labs
              </label>
              <Input
                id="lab-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by topology name, vendor, or use case"
                className="h-11 bg-white/95 text-base text-slate-700 placeholder:text-slate-400 dark:bg-slate-900/60 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Category
                  </span>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                  >
                    <SelectTrigger className="h-11 border-slate-200/70 bg-white/95 text-left text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-900/95">
                      {categoryFilters.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Difficulty
                  </span>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value) => setSelectedDifficulty(value)}
                  >
                    <SelectTrigger className="h-11 border-slate-200/70 bg-white/95 text-left text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200">
                      <SelectValue placeholder="All difficulty levels" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-900/95">
                      {difficultyFilters.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                onClick={resetFilters}
                variant="outline"
                className="inline-flex h-11 w-full items-center justify-center gap-2 border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset filters
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              {loading ? "Loading labs" : labs.length ? "Available labs" : "No labs to display"}
            </h2>
            <span className="text-sm text-gray-600 dark:text-slate-300">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
              ))}
            </div>
          ) : labs.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {labs.map((lab) => (
                <LabCard key={lab.id} {...lab} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200/70 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No labs match your filters yet</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Try broadening your criteria or contribute a new lab to help the community.
                </p>
                <Button asChild className="h-11 px-6 bg-sky-600 text-white shadow-sm hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400">
                  <Link href="/upload">Share a lab</Link>
                </Button>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-full border-slate-200/80 px-5 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(0, 5)
                  .map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      className={`h-11 min-w-[2.75rem] rounded-full ${
                        pageNumber === currentPage
                          ? "bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                          : "border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                {totalPages > 5 && (
                  <span className="px-2 text-sm text-slate-500 dark:text-slate-400">...</span>
                )}
                {totalPages > 5 && (
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    className={`h-11 min-w-[2.75rem] rounded-full ${
                      currentPage === totalPages
                        ? "bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                        : "border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                className="h-11 rounded-full border-slate-200/80 px-5 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
