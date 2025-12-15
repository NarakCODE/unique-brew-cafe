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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Map,
    MapMarker,
    MapPopup,
    MapTileLayer,
    MapZoomControl,
} from "@/components/ui/map";

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
    description: z.string().max(1000),
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
    postalCode: z.string(),
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
});

type FormValues = z.infer<typeof formSchema>;

export default function StoreCreatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
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
            isActive: true,
            features: {
                parking: false,
                wifi: false,
                outdoorSeating: false,
                driveThrough: false,
            },
        },
    });

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            // Construct the full payload
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
                // Remove empty strings for optional fields to match strict API expectations if needed
                // But z.string() allows empty string, backend schema allows optional.
                // If backend validation says `z.string().optional()`, it means string OR undefined.
                // If I send "", it depends on backend. Backend schema says:
                // email: emailSchema.optional(). emailSchema is z.string().email().
                // So "" is INVALID for email. I MUST send undefined if empty.
                email: values.email === "" ? undefined : values.email,

                // description: max 1000. optional.
                // If I send "", backend z.string().trim().max(1000).optional()
                // "" is valid string.
                description: values.description,

                // postalCode: optional.
                postalCode:
                    values.postalCode === "" ? undefined : values.postalCode,

                images: [],
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
                                                        // Auto-generate slug logic
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
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Active Status
                                        </FormLabel>
                                        <FormDescription>
                                            Disabling will hide the store from
                                            consumers.
                                        </FormDescription>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Store Features */}
                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Features</CardTitle>
                                <CardDescription>
                                    Select available amenities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Parking */}
                                <FormField
                                    control={form.control}
                                    name="features.parking"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                                {/* Wifi */}
                                <FormField
                                    control={form.control}
                                    name="features.wifi"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                                {/* Outdoor Seating */}
                                <FormField
                                    control={form.control}
                                    name="features.outdoorSeating"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                                {/* Drive Through */}
                                <FormField
                                    control={form.control}
                                    name="features.driveThrough"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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

            <Map center={[11.5564, 104.9282]} zoom={13}>
                <MapTileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC"
                />
                <MapZoomControl />
                <MapMarker position={[11.5564, 104.9282]}>
                    <MapPopup>A map component for shadcn/ui.</MapPopup>
                </MapMarker>
            </Map>
        </div>
    );
}
