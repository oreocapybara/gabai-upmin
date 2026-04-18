import { View, Text } from 'react-native'
import React from 'react'

export default function MapMarker() {
     const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

            const marker = new AdvancedMarkerElement({
                map: map,
                position: { lat: 7.08577271110286, lng: 125.4853479996858 },
            });

  return (
    
  )
}