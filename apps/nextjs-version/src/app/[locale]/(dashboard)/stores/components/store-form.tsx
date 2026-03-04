/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Link2,
  Link2Off,
  RefreshCw,
  Clock3,
  Copy,
  Wifi,
  ParkingMeter,
  Armchair,
  CarFront,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Store } from "@/types/store";
import CoverUpload from "@/components/cover-upload";
import { UploadResponse } from "@/api/upload";
import { CountryDropdown } from "@/components/country-dropdown";
import { StateDropdown } from "@/components/state-dropdown";
import { CityDropdown } from "@/components/city-dropdown";
import { State, Country, City } from "country-state-city";
import { countries } from "country-data-list";
import { StoreMap } from "@/components/store-map";
import { usePickupTimes } from "@/hooks/use-pickup-times";
import { useStoreHours } from "@/hooks/use-store-hours";
import { useUpdateStoreStatus } from "@/hooks/use-update-store-status";
import { Badge } from "@/components/ui/badge";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<(typeof DAYS)[number], { full: string; short: string }> = {
  monday: { full: "Monday", short: "Mon" },
  tuesday: { full: "Tuesday", short: "Tue" },
  wednesday: { full: "Wednesday", short: "Wed" },
  thursday: { full: "Thursday", short: "Thu" },
  friday: { full: "Friday", short: "Fri" },
  saturday: { full: "Saturday", short: "Sat" },
  sunday: { full: "Sunday", short: "Sun" },
};

interface StoreFormProps {
  initialData?: Store;
}

export function StoreForm({ initialData }: StoreFormProps) {
  const { mutate: createStore, isPending: isCreating } = useCreateStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore(
    initialData?._id ?? "",
  );
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateStoreStatus();
  const { mutate: uploadImage, isPending: isUploading } = useUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl ?? null,
  );

  const [imageError, setImageError] = useState(false);
  const [isSlugAuto, setIsSlugAuto] = useState(!initialData);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    11.5564, 104.9282,
  ]); // Default: Phnom Penh

  const { data: pickupTimesData, isLoading: isLoadingPickupTimes } =
    usePickupTimes(initialData?._id);

  const { data: storeHoursData } = useStoreHours(initialData?._id);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  useEffect(() => {
    // Hydrate country code from initial data or default
    const countryName = initialData?.country || "Cambodia";
    if (countryName) {
      const country = countries.all.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase(),
      );
      if (country) {
        setSelectedCountryCode(country.alpha2);

        // Hydrate state code if country matched
        const stateName = initialData?.state;
        if (stateName) {
          const states = State.getStatesOfCountry(country.alpha2);
          const state = states.find(
            (s) => s.name.toLowerCase() === stateName.toLowerCase(),
          );
          if (state) {
            setSelectedStateCode(state.isoCode);
            // Set map center to state
            if (state.latitude && state.longitude) {
              setMapCenter([
                parseFloat(state.latitude),
                parseFloat(state.longitude),
              ]);
            }
          }
        } else {
          // If only country is known
          const countryData = Country.getCountryByCode(country.alpha2);
          if (countryData && countryData.latitude && countryData.longitude) {
            setMapCenter([
              parseFloat(countryData.latitude),
              parseFloat(countryData.longitude),
            ]);
          }
        }
      }

      if (initialData?.latitude && initialData?.longitude) {
        setMapCenter([initialData.latitude, initialData.longitude]);
      }
    }
  }, [initialData]);

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
        country: "Cambodia",
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

  const watchName = form.watch("name");
  const watchedOpeningHours = form.watch("openingHours");
  const previousHoursRef = useRef(
    DAYS.reduce(
      (acc, day) => {
        acc[day] = defaultValues.openingHours?.[day] ?? {
          open: "09:00",
          close: "22:00",
        };
        return acc;
      },
      {} as Record<(typeof DAYS)[number], { open: string; close: string }>,
    ),
  );

  const applyHoursToDays = (
    source: { open: string; close: string },
    targetDays: readonly (typeof DAYS)[number][],
  ) => {
    targetDays.forEach((day) => {
      form.setValue(`openingHours.${day}.open`, source.open, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue(`openingHours.${day}.close`, source.close, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

  const isDayClosed = (day: (typeof DAYS)[number]) => {
    const hours = watchedOpeningHours?.[day];
    return !hours?.open || !hours?.close;
  };

  const toggleDayClosed = (day: (typeof DAYS)[number], closed: boolean) => {
    const current = form.getValues(`openingHours.${day}`);

    if (closed) {
      if (current?.open && current?.close) {
        previousHoursRef.current[day] = {
          open: current.open,
          close: current.close,
        };
      }
      form.setValue(`openingHours.${day}.open`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue(`openingHours.${day}.close`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const restore = previousHoursRef.current[day] ?? {
      open: "09:00",
      close: "22:00",
    };
    form.setValue(`openingHours.${day}.open`, restore.open, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`openingHours.${day}.close`, restore.close, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (isSlugAuto && watchName) {
      const generatedSlug = slugify(watchName);
      if (generatedSlug) {
        form.setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [watchName, isSlugAuto, form]);

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
        onSuccess: (response: UploadResponse) => {
          setImageUrl(response.data.url);
          form.setValue("imageUrl", response.data.url);
        },
      });
    }
  };

  const isLoading = isCreating || isUpdating || isUploading || isUpdatingStatus;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  General details about your store establishment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
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
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          Slug <span className="text-destructive">*</span>
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            if (!isSlugAuto) {
                              setIsSlugAuto(true);
                              form.setValue(
                                "slug",
                                slugify(form.getValues("name")),
                                {
                                  shouldValidate: true,
                                },
                              );
                            } else {
                              setIsSlugAuto(false);
                            }
                          }}
                        >
                          {isSlugAuto ? (
                            <>
                              <Link2 className="mr-1 h-3 w-3" />
                              Syncing
                            </>
                          ) : (
                            <>
                              <Link2Off className="mr-1 h-3 w-3" />
                              Manual
                            </>
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="store-slug"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (isSlugAuto) setIsSlugAuto(false);
                            }}
                          />
                          {!isSlugAuto && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => {
                                const newSlug = slugify(form.getValues("name"));
                                form.setValue("slug", newSlug, {
                                  shouldValidate: true,
                                });
                              }}
                              title="Re-generate from name"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        The slug is used for the store&apos;s public URL.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (Optional)
                        </span>
                      </FormLabel>
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
                        <FormLabel>
                          Phone <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="098765432" {...field} />
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
                        <FormLabel>
                          Email{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
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
                <CardDescription>
                  Address and geographical coordinates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-destructive">*</span>
                      </FormLabel>
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
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Postal Code{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </FormLabel>
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
                        <FormLabel>
                          Country <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <CountryDropdown
                            placeholder="Select country"
                            value={field.value}
                            onChange={(country) => {
                              field.onChange(country.name);
                              setSelectedCountryCode(country.alpha2);
                              form.setValue("state", "");
                              form.setValue("city", "");
                              setSelectedStateCode("");

                              const countryData = Country.getCountryByCode(
                                country.alpha2,
                              );
                              if (
                                countryData &&
                                countryData.latitude &&
                                countryData.longitude
                              ) {
                                setMapCenter([
                                  parseFloat(countryData.latitude),
                                  parseFloat(countryData.longitude),
                                ]);
                              }
                            }}
                            disabled={field.disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          State <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <StateDropdown
                            countryCode={selectedCountryCode}
                            value={field.value}
                            onChange={(name, code) => {
                              field.onChange(name);
                              setSelectedStateCode(code);
                              form.setValue("city", "");

                              const state = State.getStateByCodeAndCountry(
                                code,
                                selectedCountryCode,
                              );
                              if (state && state.latitude && state.longitude) {
                                setMapCenter([
                                  parseFloat(state.latitude),
                                  parseFloat(state.longitude),
                                ]);
                              }
                            }}
                            disabled={!selectedCountryCode || field.disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <CityDropdown
                            countryCode={selectedCountryCode}
                            stateCode={selectedStateCode}
                            value={field.value}
                            onChange={(name) => {
                              field.onChange(name);
                              const cities = City.getCitiesOfState(
                                selectedCountryCode,
                                selectedStateCode,
                              );
                              const city = cities.find((c) => c.name === name);
                              if (city && city.latitude && city.longitude) {
                                setMapCenter([
                                  parseFloat(city.latitude),
                                  parseFloat(city.longitude),
                                ]);
                              }
                            }}
                            disabled={!selectedStateCode || field.disabled}
                          />
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
                        <FormLabel>
                          Latitude <span className="text-destructive">*</span>
                        </FormLabel>
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
                        <FormLabel>
                          Longitude <span className="text-destructive">*</span>
                        </FormLabel>
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
                <StoreMap
                  center={mapCenter}
                  markerPosition={
                    form.watch("latitude") && form.watch("longitude")
                      ? [form.watch("latitude"), form.watch("longitude")]
                      : null
                  }
                  onLocationSelect={(lat, lng) => {
                    form.setValue("latitude", lat, { shouldValidate: true });
                    form.setValue("longitude", lng, { shouldValidate: true });
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
                <CardDescription>
                  Set daily opening and closing times. Use quick actions to
                  copy hours across days.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const monday = form.getValues("openingHours.monday");
                      applyHoursToDays(monday, DAYS);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Monday to all
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const weekdayHours = form.getValues("openingHours.monday");
                      applyHoursToDays(weekdayHours, DAYS.slice(0, 5));
                    }}
                  >
                    Weekdays = Monday
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      applyHoursToDays(
                        { open: "09:00", close: "22:00" },
                        DAYS,
                      )
                    }
                  >
                    <Clock3 className="mr-2 h-4 w-4" />
                    Reset 09:00-22:00
                  </Button>
                </div>

                <div className="space-y-3">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="rounded-lg border p-3 md:p-4 bg-card/40"
                    >
                      {(() => {
                        const closed = isDayClosed(day);
                        return (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[140px_1fr_1fr_auto] lg:items-end">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {DAY_LABELS[day].full}
                            </p>
                            {closed && (
                              <Badge variant="secondary" className="h-5 px-1.5">
                                Closed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {DAY_LABELS[day].short}
                            </p>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Checkbox
                                checked={closed}
                                onCheckedChange={(checked) =>
                                  toggleDayClosed(day, checked === true)
                                }
                              />
                              Closed
                            </label>
                          </div>
                        </div>

                        <FormField
                          control={form.control as any}
                          name={`openingHours.${day}.open`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel
                                htmlFor={`opening-hours-${day}-open`}
                                className="text-xs font-normal text-muted-foreground"
                              >
                                Open
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id={`opening-hours-${day}-open`}
                                  type="time"
                                  {...field}
                                  className="h-9"
                                  disabled={closed}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value) {
                                      previousHoursRef.current[day].open =
                                        e.target.value;
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control as any}
                          name={`openingHours.${day}.close`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel
                                htmlFor={`opening-hours-${day}-close`}
                                className="text-xs font-normal text-muted-foreground"
                              >
                                Close
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id={`opening-hours-${day}-close`}
                                  type="time"
                                  {...field}
                                  className="h-9"
                                  disabled={closed}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value) {
                                      previousHoursRef.current[day].close =
                                        e.target.value;
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start lg:justify-center"
                          onClick={() => {
                            const hours = form.getValues(`openingHours.${day}`);
                            const otherDays = DAYS.filter((d) => d !== day);
                            applyHoursToDays(hours, otherDays);
                          }}
                          disabled={closed}
                        >
                          <Copy className="mr-2 h-4 w-4 lg:mr-0" />
                          <span className="lg:sr-only">
                            Copy {DAY_LABELS[day].full} to other days
                          </span>
                        </Button>
                      </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {initialData && (
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Times Preview</CardTitle>
                  <CardDescription>
                    Generated pickup times for today (
                    {pickupTimesData?.data?.date
                      ? new Date(pickupTimesData.data.date).toLocaleDateString()
                      : "Today"}
                    ) based on current operation settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPickupTimes ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : pickupTimesData?.data?.pickupTimes?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {pickupTimesData.data.pickupTimes.map((time) => (
                        <Badge key={time} variant="secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No pickup times available for today.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end w-full ">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Store" : "Create Store"}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Store Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm relative cursor-pointer hover:bg-accent/50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="z-10"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer after:absolute after:inset-0 font-normal pb-2">
                          Open for Business
                          {storeHoursData?.data?.isOpenNow !== undefined && (
                            <Badge
                              variant={
                                storeHoursData.data.isOpenNow
                                  ? "default"
                                  : "destructive"
                              }
                              className="ml-2"
                            >
                              {storeHoursData.data.isOpenNow
                                ? "Open Now"
                                : "Closed"}
                            </Badge>
                          )}
                        </FormLabel>
                        <FormDescription>Accepting new orders?</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm relative cursor-pointer hover:bg-accent/50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            const newValue = checked === true;
                            field.onChange(newValue);

                            // If in edit mode, trigger immediate update
                            if (initialData?._id) {
                              updateStatus({
                                id: initialData._id,
                                isActive: newValue,
                              });
                            }
                          }}
                          disabled={isUpdatingStatus}
                          className="z-10"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer after:absolute after:inset-0 font-normal pb-2">
                          Platform Active
                          {isUpdatingStatus && (
                            <Loader2 className="ml-2 h-3 w-3 animate-spin inline" />
                          )}
                        </FormLabel>
                        <FormDescription>
                          Visible on the platform?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload store cover image.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
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
                      // Use aspect-video to maintain height in sidebar
                      className="w-full rounded-md overflow-hidden object-cover h-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <FormField
                    control={form.control as any}
                    name="features.parking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>
                            <ParkingMeter className="h-4 w-4" />
                            Parking
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="features.wifi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>
                            <Wifi className="h-4 w-4" /> Wifi
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="features.outdoorSeating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>
                            <Armchair className="h-4 w-4" /> Outdoor
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="features.driveThrough"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>
                            <CarFront className="h-4 w-4" />
                            Drive Thru
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
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
                      <FormLabel>
                        Avg Prep Time{" "}
                        <span className="text-xs text-muted-foreground">
                          (mins)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
