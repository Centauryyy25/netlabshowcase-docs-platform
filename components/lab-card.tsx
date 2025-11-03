'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Building,
  Calendar,
  Cloud,
  Network,
  Phone,
  Radio,
  Settings,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  author: {
    id: string;
    name: string;
    image?: string;
  };
  topologyImageUrl?: string;
  tags: string[];
  createdAt: string;
  className?: string;
}

const difficultyColors = {
  Beginner: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30',
  Intermediate: 'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:hover:bg-sky-500/30',
  Advanced: 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30',
};

const categoryIcons: Record<string, LucideIcon> = {
  Routing: Network,
  Switching: Settings,
  Security: Shield,
  MPLS: Cloud,
  Wireless: Radio,
  Voice: Phone,
  'Data Center': Building,
  Other: BookOpen,
};

const gradientBackground = 'bg-gradient-to-br from-white via-sky-50/80 to-sky-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950';

export function LabCard({
  id,
  title,
  description,
  category,
  difficulty,
  author,
  topologyImageUrl,
  tags,
  createdAt,
  className,
}: LabCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const imageSrc = topologyImageUrl && !topologyImageUrl.startsWith('/uploads/')
    ? topologyImageUrl
    : undefined;

  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] ?? BookOpen;

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white/90 text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100',
        className,
      )}
    >
      <div className={cn('relative h-40 overflow-hidden sm:h-48', gradientBackground)}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${title} topology diagram`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-sky-500 shadow-sm ring-1 ring-sky-100 backdrop-blur dark:bg-slate-900/70 dark:text-sky-300 dark:ring-slate-700/60">
                <CategoryIcon className="h-6 w-6" />
              </span>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-400">No topology image</p>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <Badge className="bg-white/90 text-slate-900 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/70 dark:text-slate-100 dark:ring-slate-700/60" variant="secondary">
            {category}
          </Badge>
        </div>

        <div className="absolute right-3 top-3">
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>
      </div>

      <CardHeader className="flex-1 space-y-3 px-4 pb-4 pt-4 sm:px-6 sm:pb-3 sm:pt-6">
        <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-300 sm:text-xl">
          <Link href={`/labs/${id}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>

        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:text-base">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-0 sm:px-6 sm:pb-3">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-slate-200/80 bg-slate-50 text-xs text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 sm:text-sm"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge
                variant="outline"
                className="border-slate-200/80 bg-slate-50 text-xs text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 sm:text-sm"
              >
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-slate-400 sm:flex-nowrap">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback className="text-sm">
                {author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[10rem] truncate text-sm font-medium text-gray-700 dark:text-slate-300 sm:max-w-[8rem]">
              {author.name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
        <Button asChild className="h-11 w-full bg-sky-600 text-white shadow-sm transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400">
          <Link href={`/labs/${id}`} className="flex w-full items-center justify-between gap-3 text-sm sm:text-base">
            <span>View Lab</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
