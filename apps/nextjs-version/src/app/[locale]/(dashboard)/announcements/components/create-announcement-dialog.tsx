"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateAnnouncement } from "@/hooks/use-announcement";
import { useState } from "react";
import { useUpload } from "@/hooks/use-upload";
import type { UploadResponse } from "@/api/upload";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  endDate: z.date({
    required_error: "End date is required",
  }),
});

interface CreateAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAnnouncementDialog({
  open,
  onOpenChange,
}: CreateAnnouncementDialogProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();
  const { mutate: uploadImage, isPending: isUploading } = useUpload();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      // endDate is undefined initially
    },
  });

  const imageUrl = form.watch("imageUrl");

  const handleImageUpload = (file: File) => {
    uploadImage(file, {
      onSuccess: (response: UploadResponse) => {
        form.setValue("imageUrl", response.data.url, { shouldDirty: true });
        toast.success("Image uploaded successfully");
      },
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Format endDate to ISO string as expected by the API
    // Ensure we send the date part and maybe set time to end of day if desired,
    // but the payload example shows T23:59:59Z, which is end of day.
    // However, the input is a Date object. Let's just ISO string it.
    // Better yet, let's set it to end of day local time then convert to ISO,
    // or just send as is if the backend handles it.
    // The example provided "2026-01-18T23:59:59Z".
    // If user picks a date, `date-fns` or standard Date is usually 00:00:00 local.
    // Let's set it to 23:59:59 of that day to ensure it lasts the full day.

    const endDate = new Date(values.endDate);
    endDate.setHours(23, 59, 59, 999);

    createAnnouncement(
      {
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl || undefined,
        endDate: endDate.toISOString(),
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Create a new announcement to be displayed to users.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Seasonal Dessert Special"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Discover our limited-edition winter cakes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Image</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="flex flex-1 gap-2">
                        <Input
                          placeholder="https://example.com/announcement.jpg"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={isUploading}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="announcement-image-upload-create"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            document
                              .getElementById("announcement-image-upload-create")
                              ?.click()
                          }
                          disabled={isUploading}
                          title="Upload image"
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {imageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(imageUrl, "_blank")}
                          title="Preview image"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal cursor-pointer",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
