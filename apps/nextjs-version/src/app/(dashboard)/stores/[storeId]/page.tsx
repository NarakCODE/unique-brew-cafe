"use client";

import { useStore } from "@/hooks/use-store";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Star,
  Users,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OpeningHours, OpeningHoursDay } from "@/types/store";

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-75 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export default function StoreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { store, isLoading } = useStore(storeId);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
        <h2 className="text-xl font-bold">Store not found</h2>
        <p className="text-muted-foreground">
          The store you are looking for does not exist.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push(`/stores/${storeId}/edit`)}>
            Edit Store
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative h-75 w-full overflow-hidden rounded-lg bg-muted border">
          {store.imageUrl ? (
            <Image
              src={store.imageUrl}
              alt={store.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No cover image
            </div>
          )}
          <div className="absolute bottom-4 left-6 flex gap-2">
            <Badge
              variant={store.isOpenNow ? "default" : "destructive"}
              className="shadow-md"
            >
              {store.isOpenNow ? "Open Now" : "Closed"}
            </Badge>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h3 className="text-2xl font-bold">{store.name}</h3>
                <div className="text-sm text-muted-foreground">
                  Created {format(new Date(store.createdAt), "PPP")}
                </div>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                  {store.description}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Location
                  </h3>
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <p>{store.address}</p>
                    <p>
                      {store.city}, {store.state} {store.postalCode}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {store.country}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <Phone className="mr-2 h-5 w-5 text-primary" />
                    Contact
                  </h3>
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{store.phone}</span>
                    </div>
                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{store.email}</span>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <Star className="mr-2 h-5 w-5 text-primary" />
                    Rating & Reviews
                  </h3>
                  <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/20">
                    <div className="text-4xl font-bold">{store.rating}</div>
                    <div>
                      <div className="flex text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(store.rating)
                                ? "fill-current"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {store.totalReviews} reviews
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Opening Hours
                  </h3>
                  <div className="rounded-lg border divide-y">
                    {DAYS_ORDER.map((day) => {
                      const hours = store.openingHours[
                        day as keyof OpeningHours
                      ] as OpeningHoursDay;
                      const isToday =
                        new Date()
                          .toLocaleDateString("en-US", {
                            weekday: "long",
                          })
                          .toLowerCase() === day;

                      if (typeof hours !== "object") return null;

                      return (
                        <div
                          key={day}
                          className={`flex items-center justify-between p-3 text-sm ${
                            isToday ? "bg-accent/50 font-medium" : ""
                          }`}
                        >
                          <span className="capitalize">{day}</span>
                          <span className="font-mono">
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                    Features
                  </h3>
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        {store.features.parking ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        Parking
                      </li>
                      <li className="flex items-center gap-2">
                        {store.features.wifi ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        Wi-Fi
                      </li>
                      <li className="flex items-center gap-2">
                        {store.features.outdoorSeating ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        Outdoor Seating
                      </li>
                      <li className="flex items-center gap-2">
                        {store.features.driveThrough ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        Drive Through
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 flex items-center text-lg font-semibold">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                    Prep Time
                  </h3>
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <p className="text-2xl font-bold">
                      {store.averagePrepTime} mins
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Average preparation time
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
