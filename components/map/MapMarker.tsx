"use client";

import React, { useEffect } from "react";

type Props = {
  map: google.maps.Map | null;
  position: { lat: number; lng: number };
};

export default function MapMarker({ map, position }: Props) {
  useEffect(() => {
    let marker: any | null = null;
    let cancelled = false;

    const createMarker = async () => {
      if (!map) return;
      const g = (window as any).google;

      // Preferred: use the marker library when available
      try {
        const lib = await g.maps.importLibrary?.("marker");
        const AdvancedMarkerElement = lib?.AdvancedMarkerElement ?? g?.maps?.Marker;

        marker = new AdvancedMarkerElement({
          map,
          position,
        });
      } catch (e) {
        // Fallback to classic Marker
        marker = new g.maps.Marker({
          map,
          position,
        });
      }
    };

    createMarker();

    return () => {
      cancelled = true;
      const g = (window as any).google;
      if (marker) {
        try {
          if (g?.maps?.event?.clearInstanceListeners) {
            g.maps.event.clearInstanceListeners(marker);
          }
          // remove marker from map
          if (typeof marker.setMap === "function") marker.setMap(null);
          marker = null;
        } catch (err) {
          // ignore cleanup errors
        }
      }
    };
  }, [map, position.lat, position.lng]);

  return null;
}
