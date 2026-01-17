"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface FileWithPreview extends File {
  preview?: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number; // In bytes
  accept?: string;
  multiple?: boolean;
  onFilesChange?: (
    files: { file: File; id: string; preview: string }[]
  ) => void;
}

interface UseFileUploadReturn {
  isDragging: boolean;
  errors: string[];
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  openFileDialog: () => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

export type { FileWithPreview };

export interface FileMetadata extends File {
  id: string;
  url: string;
}

export function useFileUpload({
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  accept = "image/*",
  multiple = false,
  onFilesChange,
}: UseFileUploadOptions = {}): [
  { isDragging: boolean; errors: string[] },
  Omit<UseFileUploadReturn, "isDragging" | "errors">,
] {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB.`;
      }

      if (accept) {
        // Simple accept check - can be more robust
        const fileType = file.type;
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0];
            return fileType.startsWith(baseType + "/");
          }
          return fileType === type;
        });

        if (
          !acceptedTypes.some((t) => t === "image/*" || t === "*") &&
          !isAccepted
        ) {
          return `File ${file.name} has invalid type. Accepted: ${accept}`;
        }
      }
      return null;
    },
    [maxSize, accept]
  );

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newErrors: string[] = [];
      const validFiles: { file: File; id: string; preview: string }[] = [];
      const filesArray = Array.from(fileList);

      if (maxFiles && filesArray.length > maxFiles) {
        newErrors.push(`Limit of ${maxFiles} files exceeded.`);
      }

      const filesToProcess = maxFiles
        ? filesArray.slice(0, maxFiles)
        : filesArray;

      filesToProcess.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push({
            file,
            id: Math.random().toString(36).substring(7),
            preview: URL.createObjectURL(file), // Basic preview
          });
        }
      });

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onFilesChange?.(validFiles);
      }
    },
    [maxFiles, validateFile, onFilesChange]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      // Reset inputs so same file can be selected again
      if (e.target) e.target.value = "";
    },
    [processFiles]
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getInputProps = useCallback(
    () => ({
      type: "file",
      accept,
      multiple,
      ref: inputRef,
      style: { display: "none" },
      onChange: handleInputChange,
    }),
    [accept, multiple, handleInputChange]
  );

  return [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ];
}
