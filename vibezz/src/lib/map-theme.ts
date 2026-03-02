// =============================================================================
// GOOGLE MAPS THEME - VIBEZZ BRANDED STYLE
// =============================================================================
// Adapted from V3 map style using Vibezz design tokens
// For use with Google Maps JavaScript API

/**
 * Color constants derived from Vibezz design tokens
 * These values match the CSS custom properties in tokens.css
 */
export const mapColors = {
  // Text/Label colors
  charcoal90: '#333333',
  charcoal70: '#545454', // Approximated from rgba(51, 51, 51, 0.68) for hex compatibility
  
  // Surface colors
  greige10: '#f9f8f7',
  greige20: '#f5f4f2', // Approximated for road fills
  greige30: '#e8e6e3', // Approximated for airport
  greige40: '#d6d4d1', // Approximated for strokes
  
  // Accent colors
  blue10: '#dce9fd',
  blue60: '#4e93f3',
  
  // Neutral
  white: '#ffffff',
} as const

/**
 * TypeScript interface for Google Maps style object
 */
export interface MapStyleElement {
  featureType?: string
  elementType?: string
  stylers: Array<Record<string, string | number | boolean>>
}

/**
 * Vibezz-branded Google Maps style
 * Clean, minimal aesthetic with muted colors that complement the Vibezz design system
 */
export const VIBEZZ_MAP_STYLE: MapStyleElement[] = [
  // Administrative labels
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal70 }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal90 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal90 }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal90 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal90 }],
  },

  // Landscape
  {
    featureType: 'landscape',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal70 }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ weight: 4 }],
  },

  // Points of Interest - simplified/hidden for cleaner look
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ color: mapColors.charcoal70 }, { visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal70 }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },

  // Roads - clean white/light gray aesthetic
  {
    featureType: 'road',
    stylers: [{ color: mapColors.white }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal70 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [{ color: mapColors.greige40 }, { visibility: 'off' }],
  },

  // Transit
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.charcoal70 }],
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'geometry.fill',
    stylers: [{ color: mapColors.greige30 }],
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },

  // Water - branded blue
  {
    featureType: 'water',
    stylers: [{ color: mapColors.blue10 }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapColors.blue60 }],
  },
]

/**
 * Map ID for cloud-based styling (optional)
 * Users can create their own Map ID in Google Cloud Console
 */
export const DEFAULT_MAP_ID = 'VIBEZZ_MAP'

/**
 * Default map options for consistent UX
 */
export const defaultMapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  clickableIcons: false,
} as const

