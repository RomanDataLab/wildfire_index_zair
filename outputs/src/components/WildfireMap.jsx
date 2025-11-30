import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, ImageOverlay, useMap, GeoJSON, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import './WildfireMap.css'

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

// Bounds extracted from GeoJSON boundary (drc_admin_wei.geojson)
// All images use these bounds to align with the GeoJSON boundary
const GEOJSON_BOUNDS = [
  [-13.4538086000, 12.2136719000],  // Southwest [lat, lon]
  [5.3121094000, 31.2740234000]     // Northeast [lat, lon]
]

// All layers use the same bounds as the GeoJSON boundary
const LAYER_BOUNDS = {
  'wildfire_index': GEOJSON_BOUNDS,
  'historical_fires': GEOJSON_BOUNDS,
  'fire_weather_lst': GEOJSON_BOUNDS,
  'vegetation_ndvi': GEOJSON_BOUNDS,
  'population_urban': GEOJSON_BOUNDS,
  'terrain_slope': GEOJSON_BOUNDS
}

// Main DRC bounds for map initialization (using GeoJSON bounds)
const DRC_BOUNDS = GEOJSON_BOUNDS

// Center of DRC
const CENTER = [
  (DRC_BOUNDS[0][0] + DRC_BOUNDS[1][0]) / 2,
  (DRC_BOUNDS[0][1] + DRC_BOUNDS[1][1]) / 2
]

// Image layer configurations
// All images are served from the component_maps folder in public directory
// Each layer uses its exact bounds from the raster file
const IMAGE_LAYERS = [
  {
    id: 'wildfire_index',
    name: 'Wildfire Index',
    image: '/component_maps/wildfire_intensity_overlay.png',
    bounds: LAYER_BOUNDS['wildfire_index'],
    opacity: 0.0,
    visible: false,
    emoji: '🔥'
  },
  {
    id: 'historical_fires',
    name: 'Historical Fires',
    image: '/component_maps/historical_fires_overlay.png',
    bounds: LAYER_BOUNDS['historical_fires'],
    opacity: 0.0,
    visible: false,
    emoji: '🔥'
  },
  {
    id: 'fire_weather_lst',
    name: 'Fire Weather (LST)',
    image: '/component_maps/fire_weather_(lst)_overlay.png',
    bounds: LAYER_BOUNDS['fire_weather_lst'],
    opacity: 0.0,
    visible: false,
    emoji: '🌡️'
  },
  {
    id: 'vegetation_ndvi',
    name: 'Vegetation Index (NDVI)',
    image: '/component_maps/vegetation_index_(ndvi)_overlay.png',
    bounds: LAYER_BOUNDS['vegetation_ndvi'],
    opacity: 0.0,
    visible: false,
    emoji: '🌿'
  },
  {
    id: 'population_urban',
    name: 'Population/Urban',
    image: '/component_maps/population_urban_overlay.png',
    bounds: LAYER_BOUNDS['population_urban'],
    opacity: 0.0,
    visible: false,
    emoji: '🏙️'
  },
  {
    id: 'terrain_slope',
    name: 'Terrain Slope (DEM)',
    image: '/component_maps/terrain_slope_overlay.png',
    bounds: LAYER_BOUNDS['terrain_slope'],
    opacity: 0.9,
    visible: true,
    emoji: '⛰️'
  }
]

// Component to update map bounds when layers change
function MapBoundsUpdater({ bounds }) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, bounds])
  
  return null
}

function WildfireMap() {
  const [layers, setLayers] = useState(IMAGE_LAYERS)
  const [mapInstance, setMapInstance] = useState(null)
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [citiesData, setCitiesData] = useState(null)

  // Load GeoJSON data
  useEffect(() => {
    fetch('/drc_admin_wei.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => setGeoJsonData(data))
      .catch(error => {
        console.error('Error loading GeoJSON:', error)
        // Continue without boundary if it fails
      })
  }, [])

  // Load cities data (optional)
  useEffect(() => {
    fetch('/drc_cities_filtered.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => setCitiesData(data))
      .catch(error => {
        console.error('Error loading cities GeoJSON:', error)
        // Continue without cities if it fails
      })
  }, [])

  const toggleLayer = (layerId) => {
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          const newVisible = !layer.visible
          return {
            ...layer,
            visible: newVisible,
            opacity: newVisible ? 0.9 : 0.0
          }
        }
        return layer
      })
    )
  }

  const visibleLayers = layers.filter(layer => layer.visible)
  const activeLayer = visibleLayers.length > 0 ? visibleLayers[visibleLayers.length - 1] : null
  
  // Color palettes for each layer type
  const layerPalettes = {
    'wildfire_index': ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    'historical_fires': ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    'fire_weather_lst': ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
    'vegetation_ndvi': ['#8b4513', '#a0522d', '#cd853f', '#daa520', '#9acd32', '#7cfc00', '#32cd32', '#228b22', '#006400'],
    'population_urban': ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    'terrain_slope': ['#006837', '#238443', '#41ab5d', '#78c679', '#addd8e', '#d9f0a3', '#f7fcb9', '#fee08b', '#fdae61', '#f46d43', '#d73027', '#a50026']
  }
  
  // Get palette for active layer or default to wildfire index
  const activePalette = activeLayer ? (layerPalettes[activeLayer.id] || layerPalettes['wildfire_index']) : layerPalettes['wildfire_index']
  const legendTitle = activeLayer ? activeLayer.name : 'Wildfire Index'

  return (
    <div className="wildfire-map-container">
      {/* Layer Control Panel */}
      <div className="layer-control-panel">
        <h4>Map Layers</h4>
        <div className="layer-buttons">
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`layer-button ${layer.visible ? 'active' : ''}`}
            >
              {layer.name} {layer.visible ? '(ON)' : '(OFF)'}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMapInstance}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render ImageOverlay for each layer */}
        {layers.map(layer => (
          <ImageOverlay
            key={layer.id}
            url={layer.image}
            bounds={layer.bounds}
            opacity={layer.opacity}
            zIndex={layer.id === 'wildfire_index' ? 1 : 2}
          />
        ))}
        
        {/* DRC Administrative Boundary */}
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={{
              fillColor: 'none',
              color: '#000000',
              weight: 2,
              opacity: 1.0,
              fillOpacity: 0
            }}
            zIndex={1000}
          />
        )}
        
        <MapBoundsUpdater bounds={DRC_BOUNDS} />
      </MapContainer>

      {/* Title */}
      <div className="map-title">
        Democratic Republic of the Congo - Wildfire Risk Intensity
      </div>

      {/* Legend - show when any layer is visible */}
      {activeLayer && (
        <div className="map-legend">
          <h4>{legendTitle}</h4>
          <div className="legend-gradient">
            <div 
              className="gradient-bar"
              style={{
                background: `linear-gradient(to top, ${activePalette.join(', ')})`
              }}
            ></div>
          </div>
          <div className="legend-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WildfireMap

