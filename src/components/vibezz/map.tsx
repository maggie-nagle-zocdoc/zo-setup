"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { VIBEZZ_MAP_STYLE, defaultMapOptions } from "@/lib/map-theme"
import type { MapStyleElement } from "@/lib/map-theme"

// =============================================================================
// TYPES
// =============================================================================

export interface LatLng {
  lat: number
  lng: number
}

export interface MapProps {
  /** Center coordinates for the map */
  center?: LatLng
  /** Zoom level (1-20) */
  zoom?: number
  /** Additional CSS classes */
  className?: string
  /** Custom map styles (defaults to VIBEZZ_MAP_STYLE) */
  styles?: MapStyleElement[]
  /** Disable all default UI controls */
  disableDefaultUI?: boolean
  /** Show zoom controls */
  zoomControl?: boolean
  /** Show fullscreen control */
  fullscreenControl?: boolean
  /** Show scale control */
  scaleControl?: boolean
  /** Google Maps API key (required for production) */
  apiKey?: string
  /** Callback when map is clicked */
  onMapClick?: (e: { lat: number; lng: number }) => void
  /** Children (markers, info windows, etc.) */
  children?: React.ReactNode
}

export interface MapMarkerProps {
  /** Position of the marker */
  position: LatLng
  /** Marker title (shown on hover) */
  title?: string
  /** Custom marker label */
  label?: string
  /** Whether marker is draggable */
  draggable?: boolean
  /** Callback when marker is clicked */
  onClick?: () => void
  /** Callback when marker position changes (if draggable) */
  onDragEnd?: (position: LatLng) => void
}

// =============================================================================
// CONTEXT
// =============================================================================

interface MapContextValue {
  map: google.maps.Map | null
}

const MapContext = React.createContext<MapContextValue | null>(null)

export function useMap() {
  const context = React.useContext(MapContext)
  if (!context) {
    throw new Error("useMap must be used within a Map component")
  }
  return context
}

// =============================================================================
// MAP COMPONENT
// =============================================================================

// Default center: NYC (Zocdoc HQ area)
const DEFAULT_CENTER: LatLng = { lat: 40.7128, lng: -74.006 }
const DEFAULT_ZOOM = 12

/**
 * Map component with Vibezz-branded styling
 * 
 * @example
 * ```tsx
 * <Map
 *   center={{ lat: 40.7128, lng: -74.006 }}
 *   zoom={12}
 *   className="h-[400px] w-full rounded-lg"
 * >
 *   <MapMarker position={{ lat: 40.7128, lng: -74.006 }} title="NYC" />
 * </Map>
 * ```
 */
export function Map({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className,
  styles = VIBEZZ_MAP_STYLE,
  disableDefaultUI = false,
  zoomControl = true,
  fullscreenControl = true,
  scaleControl = true,
  apiKey,
  onMapClick,
  children,
}: MapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Load Google Maps script
  React.useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Check for API key
    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      setError("Google Maps API key is required. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or pass apiKey prop.")
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true))
      return
    }

    // Load script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => setError("Failed to load Google Maps")
    document.head.appendChild(script)

    return () => {
      // Cleanup is tricky with Google Maps, so we leave the script
    }
  }, [apiKey])

  // Initialize map
  React.useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      styles,
      ...defaultMapOptions,
      disableDefaultUI,
      zoomControl,
      fullscreenControl,
      scaleControl,
    }

    const newMap = new google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // Add click listener
    if (onMapClick) {
      newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
        }
      })
    }
  }, [isLoaded, center, zoom, styles, disableDefaultUI, zoomControl, fullscreenControl, scaleControl, onMapClick, map])

  // Update center when prop changes
  React.useEffect(() => {
    if (map && center) {
      map.setCenter(center)
    }
  }, [map, center])

  // Update zoom when prop changes
  React.useEffect(() => {
    if (map && zoom) {
      map.setZoom(zoom)
    }
  }, [map, zoom])

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--background-default-greige)] text-[var(--text-whisper)]",
          "rounded-lg border border-[var(--stroke-default)]",
          className
        )}
      >
        <div className="text-center p-6">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <MapContext.Provider value={{ map }}>
      <div
        ref={mapRef}
        className={cn(
          "w-full h-full min-h-[200px] rounded-lg overflow-hidden",
          !isLoaded && "bg-[var(--background-default-greige)] animate-pulse",
          className
        )}
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-[var(--text-whisper)]">Loading map...</span>
          </div>
        )}
      </div>
      {map && children}
    </MapContext.Provider>
  )
}

// =============================================================================
// MAP MARKER COMPONENT
// =============================================================================

/**
 * Marker component for use within Map
 * 
 * @example
 * ```tsx
 * <MapMarker
 *   position={{ lat: 40.7128, lng: -74.006 }}
 *   title="Location"
 *   onClick={() => console.log("Marker clicked")}
 * />
 * ```
 */
export function MapMarker({
  position,
  title,
  label,
  draggable = false,
  onClick,
  onDragEnd,
}: MapMarkerProps) {
  const { map } = useMap()
  const markerRef = React.useRef<google.maps.Marker | null>(null)

  React.useEffect(() => {
    if (!map) return

    // Create marker
    const marker = new google.maps.Marker({
      position,
      map,
      title,
      label,
      draggable,
    })

    markerRef.current = marker

    // Add click listener
    if (onClick) {
      marker.addListener("click", onClick)
    }

    // Add drag end listener
    if (onDragEnd && draggable) {
      marker.addListener("dragend", () => {
        const pos = marker.getPosition()
        if (pos) {
          onDragEnd({ lat: pos.lat(), lng: pos.lng() })
        }
      })
    }

    return () => {
      marker.setMap(null)
    }
  }, [map, position, title, label, draggable, onClick, onDragEnd])

  // Update position when prop changes
  React.useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setPosition(position)
    }
  }, [position])

  return null
}

// =============================================================================
// STATIC MAP COMPONENT (No API key required for preview)
// =============================================================================

export interface StaticMapProps {
  /** Center coordinates */
  center?: LatLng
  /** Zoom level */
  zoom?: number
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Additional CSS classes */
  className?: string
  /** Show a marker at center */
  showMarker?: boolean
}

/**
 * Static map image using Google Static Maps API
 * Useful for previews or when interactive map isn't needed
 */
export function StaticMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  width = 400,
  height = 300,
  className,
  showMarker = true,
}: StaticMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--background-default-greige)]",
          "rounded-lg border border-[var(--stroke-default)]",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm text-[var(--text-whisper)]">Map preview unavailable</span>
      </div>
    )
  }

  const markerParam = showMarker ? `&markers=color:red%7C${center.lat},${center.lng}` : ""
  const src = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&scale=2${markerParam}&key=${apiKey}`

  return (
    <img
      src={src}
      alt="Map"
      width={width}
      height={height}
      className={cn("rounded-lg", className)}
    />
  )
}

