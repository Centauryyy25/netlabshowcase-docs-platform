'use client';

import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  onUploaded: (publicUrl: string | null, path: string | null) => void;
  prefix?: string;
  className?: string;
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
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

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
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (uploadedPath) {
      await deleteFile(uploadedPath);
    }
    setUploadedPath(null);
    setPreviewUrl(null);
    setError(null);
    onUploaded(null, null);
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && (
          <div className="text-sm text-muted-foreground">Uploading...</div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Topology preview"
            width={960}
            height={384}
            className="h-48 w-full rounded-lg object-cover"
          />
        )}
        {!uploading && previewUrl && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

