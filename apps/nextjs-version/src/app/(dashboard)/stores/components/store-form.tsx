"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StoreFormValues, storeSchema } from "@/lib/validations/store";
import { useCreateStore } from "@/hooks/use-create-store";
import { useUpdateStore } from "@/hooks/use-update-store";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Store } from "@/types/store";
import CoverUpload from "@/components/cover-upload";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface StoreFormProps {
  initialData?: Store;
}

export function StoreForm({ initialData }: StoreFormProps) {
  const { mutate: createStore, isPending: isCreating } = useCreateStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore(
    initialData?._id ?? ""
  );
  const { mutate: uploadImage, isPending: isUploading } = useUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const defaultValues: Partial<StoreFormValues> = initialData
    ? {
        name: initialData.name,
        slug: initialData.slug || "",
        description: initialData.description || "",
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        postalCode: initialData.postalCode,
        country: initialData.country,
        phone: initialData.phone,
        email: initialData.email || "",
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        images: initialData.images || [],
        specialHours: initialData.specialHours || [],
        isOpen: initialData.isOpen,
        isActive: initialData.isActive,
        averagePrepTime: initialData.averagePrepTime || 0,
        imageUrl: initialData.imageUrl || "",
        features: {
          parking: initialData.features?.parking || false,
          wifi: initialData.features?.wifi || false,
          outdoorSeating: initialData.features?.outdoorSeating || false,
          driveThrough: initialData.features?.driveThrough || false,
        },
        openingHours: {
          monday: initialData.openingHours.monday,
          tuesday: initialData.openingHours.tuesday,
          wednesday: initialData.openingHours.wednesday,
          thursday: initialData.openingHours.thursday,
          friday: initialData.openingHours.friday,
          saturday: initialData.openingHours.saturday,
          sunday: initialData.openingHours.sunday,
        },
      }
    : {
        name: "",
        slug: "",
        description: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        email: "",
        latitude: 0,
        longitude: 0,
        images: [],
        specialHours: [],
        isOpen: true,
        isActive: true,
        averagePrepTime: 0,
        imageUrl: "",
        features: {
          parking: false,
          wifi: false,
          outdoorSeating: false,
          driveThrough: false,
        },
        openingHours: DAYS.reduce((acc, day) => {
          acc[day] = { open: "09:00", close: "22:00" };
          return acc;
        }, {} as any),
      };

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema) as any,
    defaultValues,
  });

  function onSubmit(data: StoreFormValues) {
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }
    if (initialData) {
      updateStore(data);
    } else {
      createStore(data);
    }
  }

  const handleImageUpload = (file: File) => {
    if (file) {
      uploadImage(file, {
        onSuccess: (response) => {
          setImageUrl(response.data.url);
          form.setValue("imageUrl", response.data.url);
        },
      });
    }
  };

  const isLoading = isCreating || isUpdating || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Store Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="store-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Store description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control as any}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Store Image</FormLabel>
                <FormControl>
                  <CoverUpload
                    initialImageUrl={imageUrl}
                    onImageChange={(file) => {
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    onRemoveImage={() => {
                      setImageUrl(null);
                      form.setValue("imageUrl", "");
                    }}
                    isUploading={isUploading}
                    className="h-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control as any}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Open</FormLabel>
                        <FormDescription>
                          Is the store currently open for business?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Is the store active on the platform?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <h4 className="text-sm font-medium">Features</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="features.parking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Parking</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="features.wifi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Wifi</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="features.outdoorSeating"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Outdoor Seating
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="features.driveThrough"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Drive Through
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <FormField
                control={form.control as any}
                name="averagePrepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg Prep Time (mins)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {DAYS.map((day) => (
                <div key={day} className="space-y-2 rounded-md border p-3">
                  <FormLabel className="capitalize">{day}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control as any}
                      name={`openingHours.${day}.open`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-0">
                          <FormControl>
                            <Input type="time" {...field} className="h-8" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <FormField
                      control={form.control as any}
                      name={`openingHours.${day}.close`}
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-0">
                          <FormControl>
                            <Input type="time" {...field} className="h-8" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Store" : "Create Store"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
