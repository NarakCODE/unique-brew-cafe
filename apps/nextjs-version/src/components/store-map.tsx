"use client";

import {
  Map,
  MapLayers,
  MapLayersControl,
  MapMarker,
  MapSearchControl,
  MapTileLayer,
  MapZoomControl,
  MapLocateControl,
} from "./ui/map";
import type { LatLngExpression } from "leaflet";
import { MapPinIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { toast } from "sonner";

interface StoreMapProps {
  center: LatLngExpression;
  zoom?: number;
  markerPosition?: LatLngExpression | null;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export function StoreMap({
  center,
  zoom = 13,
  markerPosition,
  onLocationSelect,
}: StoreMapProps) {
  return (
    <div className="h-[400px] w-full rounded-md border overflow-hidden relative z-0">
      <Map
        center={center}
        zoom={zoom}
        attributionControl
        className="h-full w-full"
      >
        <MapLayers>
          <MapLayersControl />
          <MapTileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapTileLayer
            name="Satellite"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        </MapLayers>

        <MapController center={center} />

        <MapEvents onLocationSelect={onLocationSelect} />

        <MapSearchControlWrapper onLocationSelect={onLocationSelect} />

        {/* Show the marker if position is provided */}
        {markerPosition && (
          <MapMarker
            position={markerPosition}
            icon={
              <MapPinIcon className="size-8 text-primary fill-primary/20" />
            }
          />
        )}

        <div className="absolute right-1 bottom-5 z-1000 grid gap-1">
          <MapLocateControl
            className="static"
            watch={false}
            onLocationFound={(e) => {
              onLocationSelect?.(e.latlng.lat, e.latlng.lng);
            }}
            onLocationError={(error) => toast.error(error.message)}
          />
          <MapZoomControl className="static" />
        </div>
      </Map>
    </div>
  );
}

// Controller to update map center programmatically when props change
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

function MapEvents({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapSearchControlWrapper({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  return (
    <MapSearchControl
      onPlaceSelect={(feature) => {
        // Feature coordinates from search are [lng, lat] (GeoJSON).
        const [lng, lat] = feature.geometry.coordinates;

        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
        map.flyTo([lat, lng], 16);
      }}
    />
  );
}
