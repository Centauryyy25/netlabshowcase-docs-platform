'use client';

import Image from "next/image";
import { useRef, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

type Props = {
  onUploaded: (publicUrl: string | null, path: string | null) => void;
  prefix?: string;
  className?: string;
  onUploadingChange?: (isUploading: boolean) => void;
};

type UploadPayload = {
  success: boolean;
  data?: {
    publicUrl: string;
    path: string;
  };
  error?: string;
};

const uploadFile = async (file: File, prefix: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", prefix);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as UploadPayload | null;

  if (!response.ok || !payload?.data) {
    const message = payload?.error || "Failed to upload image";
    throw new Error(message);
  }

  return payload.data;
};

const deleteFile = async (path: string) => {
  await fetch(`/api/storage/upload?path=${encodeURIComponent(path)}`, {
    method: "DELETE",
    credentials: "include",
  }).catch((error) => {
    console.error("Failed to delete uploaded file", error);
  });
};

export default function UploadTopologyImage({
  onUploaded,
  prefix = "topologies",
  className,
  onUploadingChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateImageFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please upload an image file (PNG or JPG).";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Image must be 10MB or less.";
    }
    return null;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        onUploadingChange?.(false);
        return;
      }

      setError(null);
      setUploading(true);
      onUploadingChange?.(true);

      try {
        if (uploadedPath) {
          await deleteFile(uploadedPath);
          setUploadedPath(null);
          setPreviewUrl(null);
          onUploaded(null, null);
        }

        const data = await uploadFile(file, prefix);

        setPreviewUrl(data.publicUrl);
        setUploadedPath(data.path);
        onUploaded(data.publicUrl, data.path);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload image";
        setError(message);
        toast.error(message);
      } finally {
        setUploading(false);
        onUploadingChange?.(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [onUploaded, prefix, uploadedPath, onUploadingChange, validateImageFile]
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setError(null);
    await processFile(file);
  };

  const handleRemove = async () => {
    if (uploadedPath) {
      await deleteFile(uploadedPath);
    }
    setUploadedPath(null);
    setPreviewUrl(null);
    setError(null);
    onUploaded(null, null);
    onUploadingChange?.(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setError(null);
    await processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDragActive) {
      setIsDragActive(false);
    }
  };

  const triggerBrowse = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
          "hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
          isDragActive ? "border-primary bg-primary/5" : "",
          uploading ? "pointer-events-none opacity-70" : ""
        )}
        onClick={triggerBrowse}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerBrowse();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {previewUrl ? (
          <div className="w-full space-y-4">
            <Image
              src={previewUrl}
              alt="Topology preview"
              width={960}
              height={384}
              className="h-48 w-full rounded-lg object-cover"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={triggerBrowse}>
                Replace Image
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Drag & drop topology image</p>
              <p>or click to browse your files</p>
              <p className="text-xs text-muted-foreground/80">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
      {uploading && <div className="mt-2 text-sm text-muted-foreground">Uploading...</div>}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
