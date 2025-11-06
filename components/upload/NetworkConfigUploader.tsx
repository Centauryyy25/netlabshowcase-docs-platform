'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  UploadCloud,
  ShieldCheck,
  TriangleAlert,
  FileText,
  HardDrive,
  Server,
  Ban,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  allowedBackupExtensions,
  buildBackupMetadata,
  vendorMap,
} from '@/src/lib/allowed-backup-extensions';

type BackupMetadata = ReturnType<typeof buildBackupMetadata>;

export type NetworkConfigUploaderFilePayload = {
  file: File;
  metadata: BackupMetadata;
};

type NetworkConfigUploaderProps = {
  className?: string;
  disabled?: boolean;
  maxSizeBytes?: number;
  resetSignal?: number | string | boolean;
  onFileAccepted?: (payload: NetworkConfigUploaderFilePayload) => void;
  onFileRejected?: (reason: string) => void;
  onReset?: () => void;
};

const ACCEPTED_TYPES = allowedBackupExtensions.join(',');
const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;

const formatBytes = (bytes?: number | null): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${
    units[exponent]
  }`;
};

export default function NetworkConfigUploader({
  className,
  disabled = false,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  resetSignal,
  onFileAccepted,
  onFileRejected,
  onReset,
}: NetworkConfigUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<BackupMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [iconErrored, setIconErrored] = useState(false);

  const vendorNames = useMemo(() => Object.keys(vendorMap), []);

  useEffect(() => {
    setIconErrored(false);
  }, [metadata?.vendorIcon]);

  const resetUploader = useCallback(() => {
    setSelectedFile(null);
    setMetadata(null);
    setError(null);
    setIconErrored(false);
    onReset?.();
  }, [onReset]);

  useEffect(() => {
    if (resetSignal !== undefined) {
      resetUploader();
    }
  }, [resetSignal, resetUploader]);

  const emitRejection = useCallback(
    (message: string, toastDescription?: string) => {
      setError(message);
      onFileRejected?.(message);
      toast.error(message, toastDescription ? { description: toastDescription } : undefined);
    },
    [onFileRejected],
  );

  const handleProcessedFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      const metadataForFile = buildBackupMetadata(file.name);

      if (!metadataForFile.isValid) {
        resetUploader();
        emitRejection(
          'Unsupported file type',
          `"${file.name}" is not part of the supported backup formats.`,
        );
        return;
      }

      if (maxSizeBytes && file.size > maxSizeBytes) {
        resetUploader();
        emitRejection(
          `File exceeds ${formatBytes(maxSizeBytes)} limit`,
          `"${file.name}" is larger than allowed.`,
        );
        return;
      }

      setSelectedFile(file);
      setMetadata(metadataForFile);
      setError(null);

      toast.success('Backup file accepted', {
        description: `${metadataForFile.vendor} · ${metadataForFile.fileType}`,
      });

      onFileAccepted?.({
        file,
        metadata: metadataForFile,
      });
    },
    [disabled, emitRejection, maxSizeBytes, onFileAccepted, resetUploader],
  );

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      await handleProcessedFile(file);
    }
    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const [file] = Array.from(event.dataTransfer.files ?? []);
    if (file) {
      await handleProcessedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsDragging(false);
  };

  const statusBadge = (() => {
    if (disabled)
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <Ban className="size-3.5" />
          Disabled
        </Badge>
      );

    if (error)
      return (
        <Badge variant="destructive" className="gap-1">
          <TriangleAlert className="size-3.5" />
          {error}
        </Badge>
      );

    if (metadata && selectedFile)
      return (
        <Badge
          variant={metadata.isBinaryOnly ? 'default' : 'secondary'}
          className={cn(
            'gap-1',
            metadata.isBinaryOnly
              ? 'bg-sky-500/80 text-white hover:bg-sky-500'
              : '',
          )}
        >
          {metadata.isBinaryOnly ? (
            <HardDrive className="size-3.5" />
          ) : (
            <ShieldCheck className="size-3.5" />
          )}
          {metadata.isBinaryOnly ? 'Binary backup' : 'Valid extension'}
        </Badge>
      );

    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <UploadCloud className="size-3.5" />
        Awaiting file
      </Badge>
    );
  })();

  const maxSizeLabel = maxSizeBytes ? formatBytes(maxSizeBytes) : null;

  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-md transition dark:bg-black/30",
        "container-type:inline-size container-name:upload",
        disabled && "opacity-60",
        className
      )}
    >

      <CardHeader className="space-y-4 p-0 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Upload Backup Config
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Only vendor-approved backup extensions are accepted.
            </p>
          </div>
          {statusBadge}
        </div>
      </CardHeader>

      {/* Grid improved for responsive */}
      <CardContent
        className="
          grid gap-6
          [@container(min-width:640px)]:grid-cols-1
          [@container(min-width:900px)]:grid-cols-[1.1fr_0.9fr]
          container-type:inline-size
          container-name:upload
          w-full
        "
      >

              <div className="space-y-6">
          <label
            htmlFor="network-config-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'group relative flex min-h-[200px] sm:min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4 sm:p-6 text-center transition hover:border-primary/60 hover:from-white/20 hover:to-white/5 focus:outline-none',
              isDragging &&
                !disabled &&
                'border-primary/80 bg-primary/5 shadow-[0_0_35px_rgba(14,165,233,.35)]',
              selectedFile &&
                !error &&
                'border-emerald-500/40 from-emerald-500/10 to-cyan-500/10',
              error && 'border-destructive/60 from-destructive/5 to-destructive/0',
              disabled && 'cursor-not-allowed border-white/5',
            )}
          >
            <Input
              id="network-config-upload"
              type="file"
              className="sr-only"
              onChange={handleInputChange}
              accept={ACCEPTED_TYPES}
              disabled={disabled}
            />
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-white/10 text-primary shadow-inner shadow-white/20">
              <UploadCloud className="size-6" />
            </div>
            <div className="mt-3 sm:mt-4 space-y-1">
              <p className="text-sm sm:text-base font-medium">
                Drop your network backup here
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Supports {allowedBackupExtensions.length}+ extensions for{' '}
                {vendorNames.length}+ vendors
              </p>
              {maxSizeLabel && (
                <p className="text-xs text-muted-foreground/80">
                  Up to {maxSizeLabel} per upload
                </p>
              )}
            </div>
            <p className="mt-3 text-[10px] sm:text-xs text-muted-foreground/80">
              File must match the approved vendor extensions configured in NetLab (see docs for full list).
            </p>
          </label>

          {selectedFile && metadata && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-inner shadow-black/5 dark:bg-black/40">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex size-10 sm:size-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10">
                    {iconErrored || !metadata.vendorIcon ? (
                      <Server className="size-5 sm:size-6 text-muted-foreground" />
                    ) : (
                      <Image
                        src={metadata.vendorIcon}
                        alt={`${metadata.vendor} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                        onError={() => setIconErrored(true)}
                        unoptimized
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Vendor
                    </p>
                    <p className="text-base sm:text-lg font-semibold">
                      {metadata.vendor}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetUploader}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  disabled={disabled}
                >
                  Reset
                </Button>
              </div>

              <dl className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 w-full text-xs sm:text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/10 p-3 sm:p-4 dark:bg-black/60">
                  <dt className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                    <FileText className="size-3.5 sm:size-4 text-primary" />
                    File Type
                  </dt>
                  <dd className="mt-2 font-medium">{metadata.fileType}</dd>
                  <dd className="text-[10px] sm:text-xs text-muted-foreground">
                    {metadata.extension?.toUpperCase()}
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/10 p-3 sm:p-4 dark:bg-black/60">
                  <dt className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                    <Server className="size-3.5 sm:size-4 text-primary" />
                    Filename
                  </dt>
                  <dd className="mt-2 font-medium break-all">
                    {selectedFile.name}
                  </dd>
                  <dd className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
