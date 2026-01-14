"use client";

import { useState } from "react";
import {
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "../hooks/use-file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CloudUpload,
  ImageIcon,
  TriangleAlert,
  Upload,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CoverUploadProps {
  maxSize?: number;
  accept?: string;
  className?: string;
  initialImageUrl?: string | null;
  onImageChange?: (file: File | null) => void;
  onRemoveImage?: () => void;
  isUploading?: boolean;
}

export default function CoverUpload({
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = "image/*",
  className,
  initialImageUrl,
  onImageChange,
  onRemoveImage,
  isUploading: externalIsUploading = false,
}: CoverUploadProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [internalPreview, setInternalPreview] = useState<string | null>(null);

  const hasImage = !!(internalPreview || initialImageUrl);
  const currentImage = internalPreview || initialImageUrl;

  const [
    { isDragging, errors },
    {
      getInputProps,
      openFileDialog,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept,
    multiple: false,
    onFilesChange: (files: { file: File; id: string; preview: string }[]) => {
      if (files.length > 0) {
        setImageLoading(true);
        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
          const file = files[0].file;
          if (file) {
            const previewUrl = URL.createObjectURL(file);
            setInternalPreview(previewUrl);
            onImageChange?.(file);

            // Simulate upload progress for UX if not controlled externally
            if (!externalIsUploading) {
              simulateUpload();
            }
          }
        } catch (err) {
          console.error("Error handling file selection:", err);
          setUploadError("Failed to process selected file.");
          setIsUploading(false);
        }
      }
    },
  });

  // Effect to sync external uploading state
  useState(() => {
    if (externalIsUploading) {
      setIsUploading(true);
    } else if (!externalIsUploading && uploadProgress >= 100) {
      // keep it 100 or reset? usually reset when done.
      // Let's rely on component logic largely.
    }
  });

  // Simulate upload progress - strictly for visual feedback if not provided
  const simulateUpload = () => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        const increment = Math.random() * 20 + 10;
        return Math.min(prev + increment, 100);
      });
    }, 200);
  };

  const removeCoverImage = () => {
    setInternalPreview(null);
    setImageLoading(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    onRemoveImage?.(); // Trigger parent removal logic
  };

  const retryUpload = () => {
    setUploadError(null);
    openFileDialog();
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Cover Upload Area */}
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl transition-all duration-200 border border-border aspect-square",
          isDragging
            ? "border-dashed border-primary bg-primary/5"
            : hasImage
              ? "border-border bg-background hover:border-primary/50"
              : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input {...getInputProps()} className="sr-only" />

        {hasImage && currentImage ? (
          <>
            {/* Cover Image Display */}
            <div className="relative w-full h-full">
              {/* Loading placeholder */}
              {imageLoading && (
                <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <span className="text-sm">Loading image...</span>
                  </div>
                </div>
              )}

              {/* Actual image */}
              <Image
                src={currentImage}
                alt="Cover"
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

              {/* Action buttons overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={openFileDialog}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    onClick={removeCoverImage}
                    variant="destructive"
                    size="sm"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Upload progress */}
              {(isUploading || externalIsUploading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                  <div className="relative">
                    <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-white/20"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                        className="text-white transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            className="flex w-full h-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center"
            onClick={openFileDialog}
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Store Image</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Square aspect ratio recommended • Max 5MB
              </p>
            </div>

            <Button variant="outline" size="sm" type="button">
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error: string, index: number) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive" className="mt-5">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>
            <p>{uploadError}</p>
            <Button
              type="button"
              onClick={retryUpload}
              variant="outline"
              size="sm"
              className="mt-2 text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive/10"
            >
              Retry Upload
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Tips */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">Image Guidelines</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Use high-quality images with good lighting</li>
          <li>• Recommended ratio: 1:1 (Square)</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  );
}
