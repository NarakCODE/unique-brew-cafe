"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: File[]) => void; // Passes new files back to parent
    onRemove: (value: string) => void; // Passes URL to remove back to parent
    value: string[]; // Array of current image URLs (from DB)
    maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    maxFiles = 5,
}) => {
    const [newFiles, setNewFiles] = useState<{ file: File; url: string }[]>([]);
    const filesRef = useRef<{ file: File; url: string }[]>([]);

    useEffect(() => {
        filesRef.current = newFiles;
    }, [newFiles]);

    useEffect(() => {
        return () => {
            filesRef.current.forEach((file) => URL.revokeObjectURL(file.url));
        };
    }, []);

    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const incomingFiles = filesArray.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));

            const combinedFiles = [...newFiles, ...incomingFiles];
            const updatedFiles = combinedFiles.slice(0, maxFiles);

            // Cleanup excess files that won't be used
            combinedFiles
                .slice(maxFiles)
                .forEach((f) => URL.revokeObjectURL(f.url));

            setNewFiles(updatedFiles);
            onChange(updatedFiles.map((f) => f.file));
        }
    };

    const removeNewFile = (index: number) => {
        const fileToRemove = newFiles[index];
        URL.revokeObjectURL(fileToRemove.url);

        const updatedFiles = newFiles.filter((_, i) => i !== index);
        setNewFiles(updatedFiles);
        onChange(updatedFiles.map((f) => f.file));
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {/* 1. Render Existing Images from DB (value prop) */}
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative h-[200px] w-[200px] overflow-hidden rounded-md"
                    >
                        <div className="absolute right-2 top-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}

                {/* 2. Render Newly Selected Files (Previews) */}
                {newFiles.map((file, index) => (
                    <div
                        key={file.url}
                        className="relative h-[200px] w-[200px] overflow-hidden rounded-md border-2 border-dashed border-gray-300"
                    >
                        <div className="absolute right-2 top-2 z-10">
                            <Button
                                type="button"
                                onClick={() => removeNewFile(index)}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover opacity-80"
                            alt="New Upload"
                            src={file.url}
                        />
                    </div>
                ))}
            </div>

            {/* 3. Upload Button */}
            {value.length + newFiles.length < maxFiles && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple={maxFiles > 1}
                        className="hidden"
                        id="image-upload-input"
                        onChange={onUpload}
                        disabled={disabled}
                    />
                    <label htmlFor="image-upload-input">
                        <Button
                            type="button"
                            disabled={disabled}
                            variant="secondary"
                            className="pointer-events-none" // Helper to make the label clickable instead
                            asChild
                        >
                            <span className="pointer-events-auto cursor-pointer">
                                <ImagePlus className="mr-2 h-4 w-4" />
                                Upload Images
                            </span>
                        </Button>
                    </label>
                </div>
            )}
        </div>
    );
};
