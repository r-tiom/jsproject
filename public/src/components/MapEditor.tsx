/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { 
  SquadMarker, 
  TacticalShape, 
  MapPreferences, 
  TacticalLayer, 
  SquadIconConfig 
} from '../types';
import { renderSquadSVG } from '../utils/squadRenderer';
import { 
  Plus, 
  MousePointer, 
  Paintbrush, 
  PenTool, 
  Eye, 
  Grid, 
  Check, 
  Locate,
  HelpCircle
} from 'lucide-react';

interface MapEditorProps {
  layers: TacticalLayer[];
  squads: SquadMarker[];
  onUpdateSquadCoordinates: (id: string, lat: number, lng: number) => void;
  selectedSquadId: string | null;
  onSelectSquadId: (id: string | null) => void;

  shapes: TacticalShape[];
  onAddShape: (shape: Omit<TacticalShape, 'id'>) => void;
  onUpdateShapeCoordinates: (id: string, coordinates: any) => void;
  selectedShapeId?: string | null;
  onSelectShapeId?: (id: string | null) => void;
  selectedLayerId: string;
  activeLayerObj: TacticalLayer | undefined;

  mapPreferences: MapPreferences;
  onUpdatePreferences: (pref: Partial<MapPreferences>) => void;
  
  onMouseMoveCoordinates: (coords: { lat: number; lng: number } | null) => void;
}

// Available draw brushing styles
const BRUSH_COLORS = [
  { hex: '#3b82f6', name: 'Синий (Allied)' },
  { hex: '#ef4444', name: 'Красный (Hostile)' },
  { hex: '#22c55e', name: 'Зелёный (Neutral)' },
  { hex: '#eab308', name: 'Жёлтый (Intel)' },
  { hex: '#a855f7', name: 'Фиолетовый (Special)' },
  { hex: '#ffffff', name: 'Белый' }
];

const STROKE_WEIGHTS = [0, 1, 1.5, 3, 5, 8];
const LINE_STYLES = [
  { strokeDash: '', name: 'Сплошная' },
  { strokeDash: '8,6', name: 'Пунктир' },
  { strokeDash: '3,3', name: 'Мелкий пунктир' },
  { strokeDash: '12,5,3,5', name: 'Штрих-пунктир' }
];

export default function MapEditor({
  layers,
  squads,
  onUpdateSquadCoordinates,
  selectedSquadId,
  onSelectSquadId,
  shapes,
  onAddShape,
  onUpdateShapeCoordinates,
  selectedShapeId = null,
  onSelectShapeId,
  selectedLayerId,
  activeLayerObj,
  mapPreferences,
  onUpdatePreferences,
  onMouseMoveCoordinates
}: MapEditorProps) {
  
  const onSelectSquadIdRef = useRef(onSelectSquadId);
  useEffect(() => {
    onSelectSquadIdRef.current = onSelectSquadId;
  }, [onSelectSquadId]);

  const onSelectShapeIdRef = useRef(onSelectShapeId);
  useEffect(() => {
    onSelectShapeIdRef.current = onSelectShapeId;
  }, [onSelectShapeId]);

  const lastInteractionTimeRef = useRef<number>(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);

  // References to keep track of active leaflet markers/layers drawn by our React loop
  const squadMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const shapesGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Map Brush/Stroke preferences for newly drawn Geoman shapes
  const [brushColor, setBrushColor] = useState('#ef4444'); // default hostile red frontlines
  const [fillColor, setFillColor] = useState('#ef4444');
  const [fillEnabled, setFillEnabled] = useState(false);
  const [strokeWeight, setStrokeWeight] = useState(3);
  const [lineStyle, setLineStyle] = useState('');
  const [fillOpacity, setFillOpacity] = useState(0.25);

  const [instructionsVisible, setInstructionsVisible] = useState(true);

  // 1. Initialize map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [mapPreferences.centerLatitude, mapPreferences.centerLongitude],
      zoom: mapPreferences.zoom,
      zoomControl: false,
      attributionControl: true
    });

    mapRef.current = map;

    // Add scale indicator
    L.control.scale({ 
      metric: true, 
      imperial: false, 
      position: 'bottomleft' 
    }).addTo(map);

    // Add zoom control at bottom right for clean UI look
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create marker & shape layer groups
    squadMarkersGroupRef.current = L.layerGroup().addTo(map);
    shapesGroupRef.current = L.layerGroup().addTo(map);
    gridLayerRef.current = L.layerGroup().addTo(map);

    // 2. Configure Geoman toolbar controls
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawText: true,
      drawPolyline: true,
      drawPolygon: true,
      drawCircle: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    // Custom Geoman translations in Russian
    map.pm.setLang('ru');

    // Setup Geoman style matching current brush settings
    map.pm.setPathOptions({
      color: brushColor,
      fillColor: fillColor,
      fillOpacity: fillEnabled ? fillOpacity : 0,
      weight: strokeWeight,
      dashArray: lineStyle,
    });

    // Handle Geoman creation event
    map.on('pm:create', (e: any) => {
      const { layer, shape } = e;
      
      // Determine coordinates structure depending on drawn type
      let coords: any;
      let shapeType: 'polyline' | 'polygon' | 'circle' | 'rectangle' | 'text' = 'polyline';

      if (shape === 'Polyline') {
        shapeType = 'polyline';
        coords = (layer as L.Polyline).getLatLngs();
      } else if (shape === 'Polygon') {
        shapeType = 'polygon';
        coords = (layer as L.Polygon).getLatLngs();
      } else if (shape === 'Rectangle') {
        shapeType = 'rectangle';
        coords = (layer as L.Rectangle).getLatLngs();
      } else if (shape === 'Circle') {
        shapeType = 'circle';
        coords = {
          center: (layer as L.Circle).getLatLng(),
          radius: (layer as L.Circle).getRadius()
        };
      } else if (shape === 'Text') {
        shapeType = 'text';
        coords = (layer as L.Marker).getLatLng();
      }

      // Convert leaflet latlng structures to serializable array
      const serializableCoords = JSON.parse(JSON.stringify(coords));

      // Build shape payload
      const shapePayload = {
        type: shapeType,
        coordinates: serializableCoords,
        style: {
          color: brushColor,
          fillColor: fillColor,
          weight: strokeWeight,
          opacity: 0.9,
          fillOpacity: fillEnabled ? fillOpacity : 0,
          dashArray: lineStyle
        },
        name: `${shape} ${shapes.length + 1}`,
        layerId: selectedLayerId,
        notes: `Начерчено в слое #${selectedLayerId}`
      };

      // Add to react state
      onAddShape(shapePayload);

      // Immediately remove drawn raw layer from map. React's loop will render it safely
      map.removeLayer(layer);
    });

    // Listen to mouse moving telemetry coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      onMouseMoveCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('mouseout', () => {
      onMouseMoveCoordinates(null);
    });

    // Map click and double-click handlers to deselect active squad securely
    // bypassing buggy HTML synthetic event bubble delegation
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (Date.now() - lastInteractionTimeRef.current < 200) {
        return;
      }
      if (e.originalEvent && e.originalEvent.target) {
        const target = e.originalEvent.target as HTMLElement;
        if (
          target.closest('.leaflet-marker-icon') || 
          target.closest('.squad-interactive-icon-wrapper') ||
          target.closest('.squad-icon-marker-container') ||
          target.closest('.tactical-text-markup') ||
          target.tagName === 'path' || 
          target.closest('svg')
        ) {
          return;
        }
      }
      if (map.pm && (
        map.pm.globalDrawModeEnabled?.() || 
        map.pm.globalEditModeEnabled?.() || 
        map.pm.globalDragModeEnabled?.() || 
        map.pm.globalRemovalModeEnabled?.()
      )) {
        return;
      }
      onSelectSquadIdRef.current(null);
      onSelectShapeIdRef.current?.(null);
    });

    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (Date.now() - lastInteractionTimeRef.current < 200) {
        return;
      }
      if (e.originalEvent) {
        L.DomEvent.stopPropagation(e.originalEvent);
        if (e.originalEvent.target) {
          const target = e.originalEvent.target as HTMLElement;
          if (
            target.closest('.leaflet-marker-icon') || 
            target.closest('.squad-interactive-icon-wrapper') ||
            target.closest('.squad-icon-marker-container') ||
            target.closest('.tactical-text-markup') ||
            target.tagName === 'path' || 
            target.closest('svg')
          ) {
            return;
          }
        }
      }
      if (map.pm && (
        map.pm.globalDrawModeEnabled?.() || 
        map.pm.globalEditModeEnabled?.() || 
        map.pm.globalDragModeEnabled?.() || 
        map.pm.globalRemovalModeEnabled?.()
      )) {
        return;
      }
      onSelectSquadIdRef.current(null);
      onSelectShapeIdRef.current?.(null);
    });

    // Capture map pan/zoom changes to persist user preferences
    map.on('moveend', () => {
      const center = map.getCenter();
      onUpdatePreferences({
        centerLatitude: center.lat,
        centerLongitude: center.lng,
        zoom: map.getZoom()
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  // 3. Dynamic Tile Layer adjustments
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove old tile layers
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let options: L.TileLayerOptions = {
      maxZoom: 19,
      attribution: '© OpenStreetMap drivers'
    };

    switch (mapPreferences.tileProvider) {
      case 'satellite':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        options = {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; HQ Satellite imagery'
        };
        break;
      case 'dark':
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        options = {
          maxZoom: 20,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> Стелс-Режим'
        };
        break;
      case 'light':
        url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        options = {
          maxZoom: 20,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> Позитрон (Светлый)'
        };
        break;
      case 'voyager':
        url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        options = {
          maxZoom: 20,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> Вояджер (Цветной)'
        };
        break;
      case 'grey':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        options = {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri &mdash; Grey Canvas'
        };
        break;
      case 'terrain':
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
        options = {
          maxZoom: 15,
          attribution: 'Map &copy; Esri &mdash; Physical Relief'
        };
        break;
      case 'topo':
        url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        options = {
          maxZoom: 17,
          attribution: 'Map data &copy; OpenTopoMap topography contours'
        };
        break;
      case 'osm':
      default:
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        options = {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        };
        break;
    }

    tileLayerRef.current = L.tileLayer(url, options).addTo(map);

  }, [mapPreferences.tileProvider]);

  // 4. Update geoman default draw brush configuration
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.pm.setPathOptions({
      color: brushColor,
      fillColor: fillColor,
      fillOpacity: fillEnabled ? fillOpacity : 0,
      weight: strokeWeight,
      dashArray: lineStyle,
    });
  }, [brushColor, fillColor, fillEnabled, strokeWeight, lineStyle, fillOpacity]);

  // 5. Draw Coordinate Grid Overlays on Map
  useEffect(() => {
    if (!mapRef.current || !gridLayerRef.current) return;
    const grid = gridLayerRef.current;
    const map = mapRef.current;

    grid.clearLayers();

    if (!mapPreferences.showGrid) return;

    // We can draw coordinate grid lines every 0.1, 0.5, 1.0 depending on zoom
    const drawGridLines = () => {
      grid.clearLayers();
      
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      let interval = 0.5;
      if (zoom > 14) interval = 0.01;
      else if (zoom > 11) interval = 0.05;
      else if (zoom > 8) interval = 0.2;
      else if (zoom > 5) interval = 1.0;
      else interval = 5.0;

      const south = Math.floor(bounds.getSouth() / interval) * interval;
      const north = Math.ceil(bounds.getNorth() / interval) * interval;
      const west = Math.floor(bounds.getWest() / interval) * interval;
      const east = Math.ceil(bounds.getEast() / interval) * interval;

      // Draw horizontal Latitude lines
      for (let lat = south; lat <= north; lat += interval) {
        const line = L.polyline([[lat, west], [lat, east]], {
          color: mapPreferences.tileProvider === 'dark' ? '#334155' : '#94a3b8',
          weight: 0.5,
          opacity: 0.55,
          dashArray: '4,4',
          interactive: false
        });
        
        // Add coordinates label near the edge
        const textIcon = L.divIcon({
          className: 'grid-coord-label',
          html: `<div class="font-mono text-[9px] text-slate-400 bg-slate-900/60 px-1 rounded">${lat.toFixed(2)}N</div>`,
          iconSize: [40, 12]
        });

        const labelMarker = L.marker([lat, bounds.getWest() + (bounds.getEast() - bounds.getWest()) * 0.05], {
          icon: textIcon,
          interactive: false
        });

        grid.addLayer(line);
        grid.addLayer(labelMarker);
      }

      // Draw vertical Longitude lines
      for (let lng = west; lng <= east; lng += interval) {
        const line = L.polyline([[south, lng], [north, lng]], {
          color: mapPreferences.tileProvider === 'dark' ? '#334155' : '#94a3b8',
          weight: 0.5,
          opacity: 0.55,
          dashArray: '4,4',
          interactive: false
        });

        const textIcon = L.divIcon({
          className: 'grid-coord-label',
          html: `<div class="font-mono text-[9px] text-slate-400 bg-slate-900/60 px-1 rounded">${lng.toFixed(2)}E</div>`,
          iconSize: [40, 12]
        });

        const labelMarker = L.marker([bounds.getSouth() + (bounds.getNorth() - bounds.getSouth()) * 0.05, lng], {
          icon: textIcon,
          interactive: false
        });

        grid.addLayer(line);
        grid.addLayer(labelMarker);
      }
    };

    drawGridLines();
    map.on('move', drawGridLines);

    return () => {
      map.off('move', drawGridLines);
    };

  }, [mapPreferences.showGrid, mapPreferences.tileProvider, mapPreferences.gridType]);


  // 6. Reconciliation Loop: Draw & Update Squad Markers
  useEffect(() => {
    if (!mapRef.current || !squadMarkersGroupRef.current) return;
    const markerGroup = squadMarkersGroupRef.current;
    
    // Clear old squad markers completely
    markerGroup.clearLayers();

    // Iterate and render active visible layers' squads
    squads.forEach(sq => {
      const isSelected = selectedSquadId === sq.id;
      const hasGlow = sq.config.hasGlow;

      // Create custom SVG element
      const svgHTML = renderSquadSVG(sq.config, isSelected);

      const factionGlowColors: Record<string, string> = {
        friendly: '#3b82f6',
        hostile: '#ef4444',
        neutral: '#22c55e',
        unknown: '#eab308',
        custom: '#94a3b8'
      };
      const factionColor = factionGlowColors[sq.config.affiliation] || '#3b82f6';

      let extraClasses = '';
      if (isSelected) {
        extraClasses += ' squad-selected-pulsing-glowing';
      }
      if (hasGlow) {
        extraClasses += ' squad-spec-glow';
      }
      
      const customDivIcon = L.divIcon({
        className: `squad-interactive-icon-wrapper${extraClasses}`,
        html: `<div class="squad-icon-marker-container select-none" style="--glow-color: ${factionColor}">${svgHTML}</div>`,
        iconSize: [sq.config.size, sq.config.size],
        iconAnchor: [sq.config.size / 2, sq.config.size / 2]
      });

      const squadLayer = layers.find(l => l.id === sq.layerId);
      const isLocked = squadLayer?.isLocked || false;

      const marker = L.marker([sq.lat, sq.lng], {
        icon: customDivIcon,
        draggable: !isLocked,
        autoPan: true,
        bubblingMouseEvents: false
      });

      // Clicking selects squad
      marker.on('click', (e: any) => {
        lastInteractionTimeRef.current = Date.now();
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        onSelectSquadIdRef.current(sq.id);
      });

      // Moving coordinate update trigger
      marker.on('dragend', (e) => {
        const finalLatLng = e.target.getLatLng();
        onUpdateSquadCoordinates(sq.id, finalLatLng.lat, finalLatLng.lng);
      });

      // Double-click resets rotation/bearing angle
      marker.on('dblclick', (e: any) => {
        lastInteractionTimeRef.current = Date.now();
        if (e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
      });

      // Mouse tooltip showing basic parameters
      marker.bindTooltip(`
        <div class="font-mono text-xs text-slate-100 bg-slate-950 p-2 rounded border border-slate-800 shadow-xl">
          <div class="font-bold border-b border-slate-800 pb-1 text-cyan-400">${sq.config.designation || 'Отряд'}</div>
          <div>Широта: ${sq.lat.toFixed(5)}°</div>
          <div>Долгота: ${sq.lng.toFixed(5)}°</div>
          <div>Азимут: ${sq.config.rotation}°</div>
          <div>Состояние: ${sq.config.status}</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.95,
        className: 'custom-military-tooltip'
      });

      markerGroup.addLayer(marker);
    });

  }, [squads, selectedSquadId, layers]);


  // 7. Reconciliation Loop: Render Static Vector shapes list (Polygons/Polylines)
  useEffect(() => {
    if (!mapRef.current || !shapesGroupRef.current) return;
    const shapeGroup = shapesGroupRef.current;

    shapeGroup.clearLayers();

    shapes.forEach(sh => {
      let vectorLayer: L.Layer | null = null;
      const shapeLayer = layers.find(l => l.id === sh.layerId);
      const isLocked = shapeLayer?.isLocked || false;
      const isSelected = selectedShapeId === sh.id;

      const baseOption = {
        color: isSelected ? '#22d3ee' : sh.style.color,
        fillColor: sh.style.fillColor,
        weight: isSelected ? sh.style.weight + 3 : sh.style.weight,
        opacity: isSelected ? 1.0 : sh.style.opacity,
        fillOpacity: sh.style.fillOpacity,
        dashArray: sh.style.dashArray,
        pmIgnore: isLocked, // Ignore edits if locked
        interactive: true,
        bubblingMouseEvents: false
      };

      if (sh.type === 'polyline') {
        vectorLayer = L.polyline(sh.coordinates, baseOption);
      } else if (sh.type === 'polygon') {
        vectorLayer = L.polygon(sh.coordinates, baseOption);
      } else if (sh.type === 'rectangle') {
        vectorLayer = L.rectangle(sh.coordinates, baseOption);
      } else if (sh.type === 'circle') {
        vectorLayer = L.circle(sh.coordinates.center, {
          radius: sh.coordinates.radius,
          ...baseOption
        });
      } else if (sh.type === 'text') {
        // Text labels inside markers
        const textIcon = L.divIcon({
          className: 'tactical-text-markup',
          html: `<div class="font-mono text-xs font-black px-1.5 py-0.5 rounded text-white bg-slate-900/80 border border-slate-700 shadow shadow-black whitespace-nowrap">${sh.name}</div>`,
          iconSize: [20, 20]
        });
        vectorLayer = L.marker(sh.coordinates, { icon: textIcon, draggable: !isLocked });
      }

      if (vectorLayer) {
        // Stop propagation of click/dblclick events on shapes so background map handles don't deselect squads
        vectorLayer.on('click', (e: any) => {
          lastInteractionTimeRef.current = Date.now();
          if (e.originalEvent) {
            L.DomEvent.stopPropagation(e.originalEvent);
          }
          onSelectShapeIdRef.current?.(sh.id);
        });

        vectorLayer.on('dblclick', (e: any) => {
          lastInteractionTimeRef.current = Date.now();
          if (e.originalEvent) {
            L.DomEvent.stopPropagation(e.originalEvent);
          }
        });

        // Enable Geoman adjustments on drawn polygons if layer is editable
        if (!isLocked) {
          vectorLayer.on('pm:edit', (e: any) => {
            let finalCoords: any;
            if (sh.type === 'polyline' || sh.type === 'polygon' || sh.type === 'rectangle') {
              finalCoords = e.target.getLatLngs();
            } else if (sh.type === 'circle') {
              finalCoords = {
                center: e.target.getLatLng(),
                radius: e.target.getRadius()
              };
            } else if (sh.type === 'text') {
              finalCoords = e.target.getLatLng();
            }
            const cleanCoords = JSON.parse(JSON.stringify(finalCoords));
            onUpdateShapeCoordinates(sh.id, cleanCoords);
          });
        }

        // Add small tooltip showing info on click or hover
        const shapeLayer = layers.find(l => l.id === sh.layerId);
        vectorLayer.bindTooltip(`
          <div class="font-mono text-xs text-slate-300">
            <strong>${sh.name}</strong><br/>
            Слой: ${shapeLayer?.name || 'Основной'}
          </div>
        `, { sticky: true });

        shapeGroup.addLayer(vectorLayer);
      }
    });

  }, [shapes, selectedShapeId, layers]);

  // Center map on standard active operational coordinates
  const triggerFocusToCoords = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    mapRef.current.setView([lat, lng], 14, { animate: true });
  };

  return (
    <div className="flex-1 h-full relative flex flex-col min-w-0">
      
      {/* Dynamic Floating Style toolbar Brush */}
      <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-[340px] bg-slate-900/95 border border-slate-800 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
          <Paintbrush className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider font-extrabold text-slate-100">
            Краска начертания (Geoman Brush)
          </span>
        </div>

        {/* Brush colors options */}
        <div className="space-y-1.5">
          <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Цвет линий</span>
          <div className="flex gap-1.5">
            {BRUSH_COLORS.map(color => (
              <button
                key={color.hex}
                onClick={() => {
                  setBrushColor(color.hex);
                  setFillColor(color.hex);
                }}
                className={`w-6 h-6 rounded-full border relative transition-all ${
                  brushColor === color.hex 
                    ? 'border-white scale-110 shadow-lg ring-2 ring-cyan-500/50' 
                    : 'border-slate-950 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Thickness and line style matrices */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Толщина (Weigth)</span>
            <select
              value={strokeWeight}
              onChange={(e) => setStrokeWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 text-slate-100"
            >
              {STROKE_WEIGHTS.map(w => (
                <option key={w} value={w}>{w} px</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Тип контура</span>
            <select
              value={lineStyle}
              onChange={(e) => setLineStyle(e.target.value)}
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 text-slate-100"
            >
              {LINE_STYLES.map(opt => (
                <option key={opt.strokeDash} value={opt.strokeDash}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fill opacity triggers */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 mt-1">
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id="fillEnabledCheck"
              checked={fillEnabled}
              onChange={(e) => setFillEnabled(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-3.5 w-3.5 cursor-pointer"
            />
            <label htmlFor="fillEnabledCheck" className="text-[10px] font-mono uppercase tracking-wider text-slate-300 select-none cursor-pointer">
              Заливка зон
            </label>
          </div>

          {fillEnabled && (
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={fillOpacity}
              onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 bg-slate-950 h-1 rounded cursor-pointer"
              title={`Прозрачность заливки: ${Math.round(fillOpacity * 100)}%`}
            />
          )}
        </div>
      </div>

      {/* Floaty Help / Tactical Info Board */}
      {instructionsVisible && (
        <div className="absolute bottom-16 right-4 z-[9999] bg-slate-950/95 border border-slate-800 p-3 rounded-lg max-w-[340px] shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-start border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-extrabold">Штабное Наставление</span>
            <button
              onClick={() => setInstructionsVisible(false)}
              className="text-slate-500 hover:text-slate-200 font-mono text-xs scale-90 px-1"
            >
              Свернуть
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 font-sans leading-relaxed">
            <li><strong>Режим черчения:</strong> Выберите фигуру на панели слева на карте (круг, ломаная, полигон) для нанесения позиций и рубежей.</li>
            <li><strong>Параметры пера:</strong> Отрегулируйте цвет, штрих и толщину в панели справа.</li>
            <li><strong>Отряды:</strong> Для перетаскивания отрядов схватите их левой кнопкой мыши.</li>
            <li><strong>Настройки:</strong> Кликните по отряду на карте, чтобы настроить его азимут движения, пометку и род войск.</li>
          </ul>
        </div>
      )}

      {/* Small floating button to restore instructions if closed */}
      {!instructionsVisible && (
        <button
          onClick={() => setInstructionsVisible(true)}
          className="absolute bottom-16 right-4 z-[9999] p-2 rounded-full bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 shadow-xl transition"
          title="Показать наставление"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      )}

      {/* Core Map Frame Layer container */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full h-full mix-blend-normal outline-none bg-slate-950" 
        id="leaflet-canvas-container"
      />
    </div>
  );
}
