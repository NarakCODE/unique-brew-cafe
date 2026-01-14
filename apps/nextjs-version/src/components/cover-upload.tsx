"use client";

import { useState, useEffect } from "react";
import { useFileUpload } from "@/hooks/use-file-upload"; // Adjust path if needed
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
  const [internalPreview, setInternalPreview] = useState<string | null>(null);

  // Combine internal and external states
  const hasImage = !!(internalPreview || initialImageUrl);
  const currentImage = internalPreview || initialImageUrl;
  const isProcessing = externalIsUploading;

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
    onFilesChange: (files) => {
      if (files.length > 0) {
        setImageLoading(true);
        setUploadProgress(0);

        try {
          const file = files[0].file;
          if (file) {
            const previewUrl = URL.createObjectURL(file);
            setInternalPreview(previewUrl);
            onImageChange?.(file);
          }
        } catch (err) {
          console.error("Error handling file selection:", err);
        }
      }
    },
  });

  // Simulate upload progress when external loading starts
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return 95; // Wait for actual completion
          const increment = Math.random() * 10 + 5;
          return Math.min(prev + increment, 95);
        });
      }, 500);
    } else {
      setUploadProgress(100);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const removeCoverImage = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering upload click
    setInternalPreview(null);
    setImageLoading(false);
    setUploadProgress(0);
    onRemoveImage?.();
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFileDialog();
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      {/* Upload Dropzone */}
      <div
        className={cn(
          "group relative flex-1 overflow-hidden rounded-xl border transition-all duration-200 min-h-50",
          isDragging
            ? "border-dashed border-primary bg-primary/5 scale-[0.99]"
            : hasImage
              ? "border-border bg-background"
              : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!hasImage ? openFileDialog : undefined}
      >
        <input {...getInputProps()} className="sr-only" />

        {hasImage && currentImage ? (
          <>
            {/* Image Preview */}
            <div className="relative h-full w-full">
              <Image
                src={currentImage}
                alt="Cover"
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  imageLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
                )}
                onLoad={() => setImageLoading(false)}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/40" />

              {/* Action Buttons */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                    variant="secondary"
                    size="sm"
                    className="h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    onClick={removeCoverImage}
                    variant="destructive"
                    size="sm"
                    className="h-8 shadow-sm"
                  >
                    <XIcon className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Uploading State Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30 animate-in fade-in duration-300">
                  <div className="relative size-12">
                    <svg className="size-full -rotate-90" viewBox="0 0 64 64">
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
                        strokeDashoffset={`${
                          2 * Math.PI * 28 * (1 - uploadProgress / 100)
                        }`}
                        className="text-primary transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium text-white/90 animate-pulse">
                    Uploading...
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border transition-transform duration-200 group-hover:scale-110">
              <CloudUpload className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium leading-none text-foreground">
                Upload Image
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert
          variant="destructive"
          className="animate-in fade-in-50 slide-in-from-top-2"
        >
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {errors.map((error, i) => (
              <span key={i}>{error}</span>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="w-fit h-7 text-xs border-destructive/50 hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Helper Text (Only show if not in a tight space or if needed) */}
      {!hasImage && (
        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
          <div className="rounded border bg-muted/30 px-2 py-1.5 text-center">
            Max Size: 5MB
          </div>
          <div className="rounded border bg-muted/30 px-2 py-1.5 text-center">
            Format: JPG/PNG
          </div>
        </div>
      )}
    </div>
  );
}
