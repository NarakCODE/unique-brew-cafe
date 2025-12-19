"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

import { api } from "@/lib/api";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { slugify } from "@/lib/utils";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { FileDropzone } from "@/components/shared/dropzone";
import { FileList } from "@/components/shared/file-list";
import { CreateStoreData, Store, UpdateStoreData } from "@/types";
import Image from "next/image";

const formSchema = z.object({
    name: z.string().min(1, "Store name is required").max(100),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(100)
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        ),
    description: z.string().max(1000).optional(),
    phone: z
        .string()
        .regex(
            /^0\d{8,9}$/,
            "Phone number must start with 0 and be 9-10 digits long"
        ),
    email: z.string().email("Invalid email format").or(z.literal("")),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().default("Cambodia"),
    postalCode: z.string().optional(),
    latitude: z
        .string()
        .min(1, "Latitude is required")
        .refine(
            (val) =>
                !isNaN(parseFloat(val)) &&
                parseFloat(val) >= -90 &&
                parseFloat(val) <= 90,
            "Must be valid latitude (-90 to 90)"
        ),
    longitude: z
        .string()
        .min(1, "Longitude is required")
        .refine(
            (val) =>
                !isNaN(parseFloat(val)) &&
                parseFloat(val) >= -180 &&
                parseFloat(val) <= 180,
            "Must be valid longitude (-180 to 180)"
        ),
    isActive: z.boolean(),
    features: z.object({
        parking: z.boolean(),
        wifi: z.boolean(),
        outdoorSeating: z.boolean(),
        driveThrough: z.boolean(),
    }),
    image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StoreFormProps {
    initialData?: Store;
}

export function StoreForm({ initialData }: StoreFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileProgresses, setFileProgresses] = useState<
        Record<string, number>
    >({});
    const [existingImage, setExistingImage] = useState<string | undefined>(
        initialData?.imageUrl
    );

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            phone: initialData?.phone || "",
            email: initialData?.email || "",
            address: initialData?.address || "",
            city: initialData?.city || "",
            state: initialData?.state || "",
            // This default value logic is now perfectly valid
            country: initialData?.country || "Cambodia",
            postalCode: initialData?.postalCode || "",
            latitude: initialData ? String(initialData.latitude) : "",
            longitude: initialData ? String(initialData.longitude) : "",
            isActive: initialData ? initialData.isActive : true,
            features: {
                parking: initialData?.features?.parking || false,
                wifi: initialData?.features?.wifi || false,
                outdoorSeating: initialData?.features?.outdoorSeating || false,
                driveThrough: initialData?.features?.driveThrough || false,
            },
            image: undefined,
        },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("slug", values.slug);
            if (values.description)
                formData.append("description", values.description);
            formData.append("phone", values.phone);
            if (values.email) formData.append("email", values.email);
            formData.append("address", values.address);
            formData.append("city", values.city);
            formData.append("state", values.state);
            formData.append("country", values.country);
            if (values.postalCode)
                formData.append("postalCode", values.postalCode);
            formData.append("latitude", values.latitude);
            formData.append("longitude", values.longitude);
            formData.append("isActive", String(values.isActive));
            formData.append("features", JSON.stringify(values.features));

            formData.append(
                "openingHours",
                JSON.stringify({
                    monday: { open: "08:00", close: "20:00" },
                    tuesday: { open: "08:00", close: "20:00" },
                    wednesday: { open: "08:00", close: "20:00" },
                    thursday: { open: "08:00", close: "20:00" },
                    friday: { open: "08:00", close: "20:00" },
                    saturday: { open: "09:00", close: "21:00" },
                    sunday: { open: "09:00", close: "21:00" },
                })
            );

            if (values.image) {
                formData.append("image", values.image);
            }

            if (initialData) {
                await api.stores.update(
                    initialData.id,
                    formData as unknown as UpdateStoreData
                );
                toast.success("Store updated successfully");
            } else {
                await api.stores.create(formData as unknown as CreateStoreData);
                toast.success("Store created successfully");
            }

            router.push("/stores");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(
                initialData
                    ? "Failed to update store"
                    : "Failed to create store"
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void
    ) => {
        const nameValue = e.target.value;
        fieldChange(nameValue);
        const currentSlug = form.getValues("slug");
        const isSlugEmpty = !currentSlug;
        const isSlugMatchingName =
            currentSlug === slugify(nameValue.slice(0, -1));

        if (isSlugEmpty || isSlugMatchingName) {
            form.setValue("slug", slugify(nameValue), { shouldValidate: true });
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            form.setValue("image", file, { shouldValidate: true });
            setFileProgresses({ [file.name]: 100 });
            setExistingImage(undefined);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            form.setValue("image", file, { shouldValidate: true });
            setFileProgresses({ [file.name]: 100 });
            setExistingImage(undefined);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeFile = (filename: string) => {
        const currentFile = form.getValues("image");
        if (currentFile && currentFile.name === filename) {
            form.setValue("image", undefined, { shouldValidate: true });
            setFileProgresses({});
            if (initialData?.imageUrl) {
                setExistingImage(initialData.imageUrl);
            }
        }
    };

    const removeExistingImage = () => {
        setExistingImage(undefined);
    };

    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Store Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Details</CardTitle>
                                <CardDescription>
                                    Basic information about the store.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Unique Brew - Central Market"
                                                    {...field}
                                                    onChange={(e) =>
                                                        handleNameChange(
                                                            e,
                                                            field.onChange
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            {...field}
                                                            data-testid="slug-input"
                                                            placeholder="Slug (e.g. unique-brew-central-market)"
                                                        />
                                                        <InputGroupAddon align="inline-end">
                                                            <InputGroupButton
                                                                aria-label="Generate"
                                                                title="Generate"
                                                                size="icon-xs"
                                                                onClick={() => {
                                                                    const name =
                                                                        form.getValues(
                                                                            "name"
                                                                        );
                                                                    form.setValue(
                                                                        "slug",
                                                                        slugify(
                                                                            name
                                                                        ),
                                                                        {
                                                                            shouldValidate: true,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                <HugeiconsIcon
                                                                    icon={
                                                                        Refresh01Icon
                                                                    }
                                                                />{" "}
                                                            </InputGroupButton>
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                URL-friendly identifier. Must be
                                                unique.
                                            </FormDescription>
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
                                                    placeholder="A cozy coffee shop in the heart of the city."
                                                    className="resize-none min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                                <CardDescription>
                                    Where the store is physically located.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123 Street 456"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Phnom Penh"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                State / Province
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Phnom Penh"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Cambodia"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Postal Code (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="12000"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="latitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="11.5564"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="longitude"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitude</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="104.9282"
                                                        {...field}
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

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Status</CardTitle>
                                <CardDescription>
                                    Manage visibility from consumers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Active
                                                </FormLabel>
                                                <FormDescription>
                                                    Publicly visible
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Store Logo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Logo</CardTitle>
                                <CardDescription>
                                    Upload a logo for the store.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="w-full">
                                                    {!field.value &&
                                                        !existingImage && (
                                                            <FileDropzone
                                                                fileInputRef={
                                                                    fileInputRef
                                                                }
                                                                handleBoxClick={
                                                                    handleBoxClick
                                                                }
                                                                handleDragOver={
                                                                    handleDragOver
                                                                }
                                                                handleDrop={
                                                                    handleDrop
                                                                }
                                                                handleFileSelect={
                                                                    handleFileSelect
                                                                }
                                                                label="Upload Store Logo"
                                                            />
                                                        )}
                                                    {field.value && (
                                                        <FileList
                                                            uploadedFiles={[
                                                                field.value,
                                                            ]}
                                                            fileProgresses={
                                                                fileProgresses
                                                            }
                                                            removeFile={
                                                                removeFile
                                                            }
                                                        />
                                                    )}
                                                    {existingImage &&
                                                        !field.value && (
                                                            <div className="relative w-full mt-4 flex items-center space-x-4 rounded-md border p-4">
                                                                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                                                    <Image
                                                                        src={
                                                                            existingImage
                                                                        }
                                                                        alt="Current Store Logo"
                                                                        fill
                                                                        className="object-cover"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">
                                                                        Current
                                                                        Logo
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        This
                                                                        image is
                                                                        currently
                                                                        active.
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={
                                                                        removeExistingImage
                                                                    }
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Features</CardTitle>
                                <CardDescription>
                                    Select available amenities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="features.parking"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Parking</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="features.wifi"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Free Wi-Fi
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="features.outdoorSeating"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Outdoor Seating
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="features.driveThrough"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Drive Through
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact</CardTitle>
                                <CardDescription>
                                    Store contact details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="+855 12 345 678"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="store@uniquebrew.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        type="button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting
                            ? initialData
                                ? "Updating..."
                                : "Creating..."
                            : initialData
                              ? "Update Store"
                              : "Create Store"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
