"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

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
import { PageHeader } from "@/components/layout/page-header";

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
    description: z.string().max(1000).or(z.literal("")),
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
    country: z.string(),
    postalCode: z.string().or(z.literal("")),
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
});

type FormValues = z.infer<typeof formSchema>;

export default function StoreCreatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            phone: "",
            email: "",
            address: "",
            city: "",
            state: "",
            country: "Cambodia",
            postalCode: "",
            latitude: "",
            longitude: "",
        },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            // Construct the full payload including openingHours (defaulting to standard hours for now)
            // In a real app, we'd have a UI to edit these.
            const payload = {
                ...values,
                latitude: parseFloat(values.latitude),
                longitude: parseFloat(values.longitude),
                openingHours: {
                    monday: { open: "08:00", close: "20:00" },
                    tuesday: { open: "08:00", close: "20:00" },
                    wednesday: { open: "08:00", close: "20:00" },
                    thursday: { open: "08:00", close: "20:00" },
                    friday: { open: "08:00", close: "20:00" },
                    saturday: { open: "09:00", close: "21:00" },
                    sunday: { open: "09:00", close: "21:00" },
                },
                // Remove empty strings for optional fields
                email: values.email === "" ? undefined : values.email,
                description:
                    values.description === "" ? undefined : values.description,
                postalCode:
                    values.postalCode === "" ? undefined : values.postalCode,
                images: [], // Start with no images
            };

            await api.stores.create(payload);
            toast.success("Store created successfully");
            router.push("/stores");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create store. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <PageHeader
                title="Create Store"
                description="Add a new store/branch to the system."
            >
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </PageHeader>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* General Info */}
                        <Card className="col-span-2 lg:col-span-2">
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
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        // Auto-generate slug from name if slug is empty or matches previous slugified name
                                                        if (
                                                            !form.getValues(
                                                                "slug"
                                                            ) ||
                                                            form.getValues(
                                                                "slug"
                                                            ) ===
                                                                (
                                                                    field.value ||
                                                                    ""
                                                                )
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        /[^a-z0-9-]/g,
                                                                        "-"
                                                                    )
                                                        ) {
                                                            form.setValue(
                                                                "slug",
                                                                e.target.value
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        /[^a-z0-9-]/g,
                                                                        "-"
                                                                    )
                                                                    .replace(
                                                                        /-+/g,
                                                                        "-"
                                                                    )
                                                                    .replace(
                                                                        /^-|-$/g,
                                                                        ""
                                                                    )
                                                            );
                                                        }
                                                    }}
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
                                                <Input
                                                    placeholder="unique-brew-central-market"
                                                    {...field}
                                                />
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
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>
                                    How customers can reach the store.
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
                                            <FormLabel>
                                                Email (Optional)
                                            </FormLabel>
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

                        {/* Location */}
                        <Card className="col-span-2 lg:col-span-3">
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
                            {isSubmitting ? "Creating..." : "Create Store"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
