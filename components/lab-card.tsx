'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Eye, ArrowRight } from 'lucide-react';
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
  Beginner: 'bg-green-100 text-green-800 hover:bg-green-200',
  Intermediate: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  Advanced: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const categoryIcons = {
  Routing: '🌐',
  Switching: '🔀',
  Security: '🔒',
  MPLS: '☁️',
  Wireless: '📡',
  Voice: '📞',
  'Data Center': '🏢',
  Other: '📚',
};

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

  return (
    <Card className={cn('group hover:shadow-lg transition-all duration-300 h-full flex flex-col', className)}>
      {/* Topology Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {topologyImageUrl ? (
          <Image
            src={topologyImageUrl}
            alt={`${title} topology diagram`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="text-4xl">{categoryIcons[category as keyof typeof categoryIcons]}</div>
              <p className="text-sm text-muted-foreground">No topology image</p>
            </div>
          </div>
        )}

        {/* Category Badge Overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
            {category}
          </Badge>
        </div>

        {/* Difficulty Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
      </div>

      <CardHeader className="flex-1 pb-3">
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
            <Link href={`/labs/${id}`} className="hover:underline">
              {title}
            </Link>
          </CardTitle>

          <CardDescription className="line-clamp-3 text-sm">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-3">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Author and Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback className="text-xs">
                {author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-24">{author.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full group/btn">
          <Link href={`/labs/${id}`} className="flex items-center justify-between">
            <span>View Lab</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}