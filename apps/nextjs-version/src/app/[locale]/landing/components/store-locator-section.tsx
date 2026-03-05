"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePublicStores } from "@/hooks/use-public-stores"

export function StoreLocatorSection() {
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [radius, setRadius] = useState(5)

  const filters = useMemo(() => {
    if (coords) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius,
        limit: 6,
      }
    }

    return {
      city: city.trim() || undefined,
      limit: 6,
    }
  }, [city, coords, radius])

  const { stores, isLoading } = usePublicStores(filters)

  const handleUseLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        // ignore geolocation errors silently
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <section id="stores" className="bg-muted/20 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">Store Locator</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Find Your Nearest {""}Cafe
          </h2>
          <p className="text-lg text-muted-foreground">
            Search by city or use your current location to see nearby stores and real-time availability.
          </p>
        </div>

        <div className="mx-auto mb-8 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input
            placeholder="Search city (e.g. Phnom Penh)"
            value={city}
            onChange={(event) => {
              setCity(event.target.value)
              if (coords) setCoords(null)
            }}
            aria-label="Search stores by city"
          />
          <Button variant="outline" onClick={handleUseLocation}>
            Use My Location
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCity("")
              setCoords(null)
              setRadius(5)
            }}
          >
            Reset
          </Button>
        </div>

        {coords && (
          <div className="mx-auto mb-8 flex max-w-3xl items-center gap-3 text-sm text-muted-foreground">
            <span>Radius (km):</span>
            <Input
              type="number"
              min={1}
              max={50}
              value={radius}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isNaN(value) && value > 0) {
                  setRadius(value)
                }
              }}
              className="h-9 w-28"
            />
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            Loading stores...
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Card key={store.id || store._id} className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {store.address}, {store.city}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={store.isOpenNow ? "text-green-600" : "text-amber-600"}>
                      {store.isOpenNow ? "Open now" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prep Time</span>
                    <span>{store.averagePrepTime || 15} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span>{store.rating ? store.rating.toFixed(1) : "-"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            No stores found for the selected filters.
          </div>
        )}
      </div>
    </section>
  )
}
