'use client';

import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { LabCard } from '@/components/lab-card';
import { AiChat } from '@/components/ai-chat';
import NotionEditor from '@/components/labs/NotionEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Package,
  Settings,
  Share2,
  Network,
  Shield,
  Cloud,
  Phone,
  Radio,
  Building,
  BookOpen,
  Pencil,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface LabFile {
  id: string;
  labId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  createdAt: string;
}

interface LabDetail {
  id: string;
  title: string;
  description: string;
  labNotes?: string | null;
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

interface LabDetailResponse {
  lab: LabDetail;
  files: LabFile[];
}

interface LabListItem {
  id: string;
  title: string;
  description: string;
  labNotes?: string | null;
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

interface LabsListResponse {
  labs: LabListItem[];
}

const categoryIcons = {
  Routing: Network,
  Switching: Settings,
  Security: Shield,
  MPLS: Cloud,
  Wireless: Radio,
  Voice: Phone,
  'Data Center': Building,
  Other: BookOpen,
};

const difficultyColors = {
  Beginner: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30',
  Intermediate: 'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:hover:bg-sky-500/30',
  Advanced: 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30',
};

const surfaceCardStyles =
  'border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60';

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.includes('text') || fileType.includes('config')) return FileText;
  return Package;
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function LabDetailContent() {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [labData, setLabData] = useState<LabDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [relatedLabs, setRelatedLabs] = useState<LabListItem[]>([]);
  const { data: session } = useSession();
  const isAuthor = Boolean(session?.user?.id && labData?.lab?.author?.id === session.user.id);
  const [isUploading, setIsUploading] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const deleteStorageObject = async (path: string | null) => {
    if (!path) return;
    await fetch(`/api/storage/upload?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch((error) => console.error('Failed to delete storage object', error));
  };

  const extractStoragePath = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) return null;

    try {
      const hasProtocol = /^https?:\/\//i.test(url);
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const parsed = hasProtocol ? new URL(url) : new URL(url, base);
      const marker = '/object/public/';
      const idx = parsed.pathname.indexOf(marker);
      if (idx === -1) return null;
      const relative = parsed.pathname.slice(idx + marker.length);
      const segments = relative.split('/');
      if (segments.length < 2) return null;
      return segments.slice(1).join('/');
    } catch (error) {
      console.error('Failed to parse storage path', error);
      return null;
    }
  };

  const handleTopologyFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget as HTMLInputElement | null;
    const file = inputEl?.files?.[0];
    if (!file) return;
    const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid image type. Use PNG, JPG or GIF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image exceeds 10MB limit');
      return;
    }
    let uploadedFilePath: string | null = null;
    const previousFilePath = extractStoragePath(labData?.lab?.topologyImageUrl);

    try {
      setIsUploading(true);
      setImageLoading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'topologies');

      const uploadResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const uploadPayload = await uploadResponse.json().catch(() => null) as {
        success?: boolean;
        data?: { publicUrl: string; path: string };
        error?: string;
      } | null;

      if (!uploadResponse.ok || !uploadPayload?.data) {
        const message = uploadPayload?.error || 'Failed to upload image';
        throw new Error(message);
      }

      uploadedFilePath = uploadPayload.data.path;
      const publicUrl = uploadPayload.data.publicUrl;

      const updateRes = await fetch(`/api/labs/${labId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ topologyImageUrl: publicUrl }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update image');
      }

      const updateData = await updateRes.json();

      setLabData((prev) =>
        prev
          ? {
              ...prev,
              lab: {
                ...prev.lab,
                topologyImageUrl: updateData.lab.topologyImageUrl,
                updatedAt: updateData.lab.updatedAt,
              },
            }
          : prev
      );

      setImageError(false);
      setImageLoading(false);
      toast.success('Topology image updated');

      if (previousFilePath && previousFilePath !== uploadedFilePath) {
        await deleteStorageObject(previousFilePath);
      }
    } catch (err) {
      console.error(err);
      if (uploadedFilePath) {
        await deleteStorageObject(uploadedFilePath);
      }
      const message =
        err instanceof Error ? err.message : 'Failed to update topology image';
      toast.error(message);
      setImageLoading(false);
    } finally {
      setIsUploading(false);
      if (inputEl) inputEl.value = '';
    }
  };

  const fetchRelatedLabs = useCallback(
    async (category: string) => {
      try {
        const response = await fetch(`/api/labs?category=${category}&limit=3`);
        if (response.ok) {
          const data: LabsListResponse = await response.json();
          setRelatedLabs(data.labs.filter((lab) => lab.id !== labId));
        }
      } catch (error) {
        console.error('Error fetching related labs:', error);
      }
    },
    [labId]
  );

  const fetchLabDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labs/${labId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard');
          toast.error('Lab not found');
          return;
        }
        throw new Error('Failed to fetch lab details');
      }

      const data: LabDetailResponse = await response.json();
      setLabData(data);
      setNotesDraft(data.lab.labNotes ?? '');

      // Fetch related labs (same category, different lab)
      fetchRelatedLabs(data.lab.category);
    } catch (error) {
      console.error('Error fetching lab detail:', error);
      toast.error('Failed to load lab details');
    } finally {
      setLoading(false);
    }
  }, [fetchRelatedLabs, labId, router]);

  useEffect(() => {
    fetchLabDetail();
  }, [fetchLabDetail]);

  useEffect(() => {
    if (!isEditingNotes && labData?.lab?.labNotes !== undefined) {
      setNotesDraft(labData.lab.labNotes ?? '');
    }
  }, [isEditingNotes, labData?.lab?.labNotes]);

  const handleSaveNotes = async (html: string) => {
    if (!isAuthor) {
      throw new Error('Only the author can edit this lab.');
    }

    setIsSavingNotes(true);
    try {
      const response = await fetch(`/api/labs/${labId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ labNotes: html }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null) as { error?: string } | null;
        const message = errorPayload?.error || 'Failed to save lab notes';
        throw new Error(message);
      }

      const payload = await response.json().catch(() => null) as {
        lab?: { labNotes?: string | null; updatedAt?: string };
      } | null;

      const updatedNotes = html;
      const updatedAt = payload?.lab?.updatedAt ?? new Date().toISOString();

      setLabData((prev) =>
        prev
          ? {
              ...prev,
              lab: {
                ...prev.lab,
                labNotes: updatedNotes,
                updatedAt,
              },
            }
          : prev
      );
      setNotesDraft(updatedNotes);
      setIsEditingNotes(false);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleToggleEditingNotes = () => {
    if (isEditingNotes) {
      setIsEditingNotes(false);
      setNotesDraft(labData?.lab?.labNotes ?? '');
    } else {
      setIsEditingNotes(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: labData?.lab.title,
          text: labData?.lab.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDownload = (file: LabFile) => {
    // In a real implementation, this would download from cloud storage
    // For now, we'll simulate the download
    toast.success(`Downloading ${file.fileName}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 rounded bg-slate-800/60"></div>
            <div className="h-64 rounded bg-slate-800/60"></div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-8 rounded bg-slate-800/60"></div>
                <div className="h-32 rounded bg-slate-800/60"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 rounded bg-slate-800/60"></div>
                <div className="h-32 rounded bg-slate-800/60"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Lab not found</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
            The lab you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
          </p>
          <Button asChild className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { lab, files } = labData;
  const CategoryIcon = categoryIcons[lab.category as keyof typeof categoryIcons];
  const lastUpdatedLabel = lab.updatedAt
    ? new Date(lab.updatedAt).toLocaleString()
    : 'Just now';

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard?category=${lab.category}`}>{lab.category}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lab.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Lab Header */}
      <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              {CategoryIcon && <CategoryIcon className="h-5 w-5 text-sky-500 dark:text-sky-300" />}
              <Badge variant="outline" className="border-slate-200/70 bg-white/80 text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100">
                {lab.category}
              </Badge>
              <Badge className={difficultyColors[lab.difficulty]}>
                {lab.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">{lab.title}</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" size="sm" className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button asChild variant="outline" size="sm" className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Labs
              </Link>
            </Button>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-relaxed text-gray-700 dark:text-slate-300 sm:text-lg">{lab.description}</p>

        {/* Tags */}
        {lab.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {lab.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-slate-100 text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-200 sm:text-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topology Image */}
          <Card className={surfaceCardStyles}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <ImageIcon className="h-5 w-5 text-sky-500 dark:text-sky-300" />
                Network Topology
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100 dark:border-slate-800/60 dark:bg-slate-900/60">
                {lab.topologyImageUrl && !imageError ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500 dark:border-slate-700 dark:border-t-sky-300"></div>
                      </div>
                    )}
                    <ImageZoom className="h-full w-full">
                      <Image
                        src={lab.topologyImageUrl}
                        alt={`${lab.title} topology diagram`}
                        fill
                        className="object-contain"
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageError(true)}
                      />
                    </ImageZoom>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="space-y-2 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm text-gray-600 dark:text-slate-300">No topology image available</p>
                    </div>
                  </div>
                )}

                {isAuthor && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <input
                      id="topology-file"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif"
                      className="hidden"
                      onChange={handleTopologyFileChange}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-full border-slate-200/80 bg-white/90 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => document.getElementById('topology-file')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Change Image'}
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Notes</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Last updated {lastUpdatedLabel}
                    </p>
                  </div>
                  {isAuthor && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        size="sm"
                        variant={isEditingNotes ? 'outline' : 'secondary'}
                        className="h-10 w-full gap-2 rounded-full px-4 sm:h-11 sm:w-auto"
                        onClick={handleToggleEditingNotes}
                        disabled={isSavingNotes}
                      >
                        {isEditingNotes ? (
                          <>
                            <X className="h-4 w-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Pencil className="h-4 w-4" />
                            Edit Notes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {isAuthor && isEditingNotes ? (
                  <NotionEditor
                    value={notesDraft}
                    onChange={setNotesDraft}
                    onSave={handleSaveNotes}
                    editable
                    isSaving={isSavingNotes}
                    className="mt-2"
                  />
                ) : lab.labNotes ? (
                  <div
                    className="prose prose-slate max-w-none rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:prose-invert dark:border-slate-800/60 dark:bg-slate-900/60 sm:p-6"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lab.labNotes) }}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200/70 bg-white/80 p-4 text-sm text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-300 sm:p-6">
                    The author hasn&apos;t added detailed notes yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Files */}
          {files.length > 0 && (
            <Card className={surfaceCardStyles}>
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-sky-500 dark:text-sky-300" />
                  Configuration Files & Resources
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-slate-300">
                  Download configuration files, packet traces, and additional resources
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 gap-2 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-900/60 sm:gap-3">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white/95 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800/70 dark:data-[state=active]:text-slate-100">
                      All Files
                    </TabsTrigger>
                    <TabsTrigger value="configs" className="data-[state=active]:bg-white/95 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800/70 dark:data-[state=active]:text-slate-100">
                      Configurations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {files.map((file) => {
                      const FileIcon = getFileIcon(file.fileType);
                      return (
                        <div key={file.id} className="flex flex-col gap-4 rounded-xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-sky-500 dark:text-sky-300" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file.fileName}</p>
                              <p className="text-sm text-gray-600 dark:text-slate-300">
                                {formatFileSize(file.fileSize)} | {file.fileType}
                              </p>
                              {file.description && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                                  {file.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="configs" className="space-y-3">
                    {files
                      .filter(file => file.fileType.includes('config') || file.fileType.includes('text'))
                      .map((file) => {
                        const FileIcon = getFileIcon(file.fileType);
                        return (
                          <div key={file.id} className="flex flex-col gap-4 rounded-xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-slate-700">
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-5 w-5 text-sky-500 dark:text-sky-300" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.fileName}</p>
                                <p className="text-sm text-gray-600 dark:text-slate-300">
                                  {formatFileSize(file.fileSize)} | {file.fileType}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:w-auto dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        );
                      })}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lab Information */}
          <Card className={surfaceCardStyles}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-gray-900 dark:text-white">Lab Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={lab.author.image} alt={lab.author.name} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {lab.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{lab.author.name}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">Lab Author</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Created: {formatDate(lab.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Updated: {formatDate(lab.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Status: {lab.status}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Lab Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Category:</span>
                    <Badge variant="outline" className="border-slate-200/70 bg-white/80 text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100">
                      {lab.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Difficulty:</span>
                    <Badge className={difficultyColors[lab.difficulty]}>
                      {lab.difficulty}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Files:</span>
                    <span className="text-gray-700 dark:text-slate-200">{files.length} file(s)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={surfaceCardStyles}>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-4 sm:px-6 sm:py-6">
              <Button
                className="h-11 w-full bg-sky-600 text-white shadow-sm transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                variant="default"
                onClick={() => {
                  const element = document.getElementById('ai-assistant-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>

              <Button className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800" variant="outline" asChild>
                <Link href={`/upload?duplicate=${lab.id}`}>
                  <Package className="mr-2 h-4 w-4" />
                  Duplicate Lab
                </Link>
              </Button>

              <Button
                className="h-11 w-full border-slate-200/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-800"
                variant="outline"
                onClick={() => window.open(`/api/labs/${lab.id}/export`, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Lab
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div id="ai-assistant-section" className="space-y-6">
        <Separator />
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">AI Lab Assistant</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
            Get personalized help understanding this network topology, configurations, and concepts
          </p>
          <div className="max-w-4xl">
            <AiChat
              labId={lab.id}
              labTitle={lab.title}
              onMessageSent={(message) => {
                console.log('AI message sent:', message);
              }}
            />
          </div>
        </div>
      </div>

      {/* Related Labs */}
      {relatedLabs.length > 0 && (
        <div className="space-y-6">
          <Separator />
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Related Labs</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {relatedLabs.map((relatedLab) => (
                <LabCard key={relatedLab.id} {...relatedLab} />
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

















