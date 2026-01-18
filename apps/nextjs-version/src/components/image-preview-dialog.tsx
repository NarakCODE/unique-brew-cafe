import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImagePreviewDialogProps {
  children: React.ReactNode;
  imageSrc?: string | null;
  alt?: string;
}

const ImagePreviewDialog = ({
  children,
  imageSrc,
  alt = "Image preview",
}: ImagePreviewDialogProps) => {
  if (!imageSrc) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="cursor-pointer transition-opacity hover:opacity-90 bg-transparent border-none p-0"
          type="button"
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="relative flex h-[80vh] w-full items-center justify-center overflow-hidden rounded-lg">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-contain" // Ensures the whole image is visible without cropping
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
