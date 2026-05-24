/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TacticalLayer, 
  SquadMarker, 
  TacticalShape, 
  MapPreferences, 
  TacticalPreset, 
  SquadIconConfig 
} from './types';
import Sidebar from './components/Sidebar';
import MapEditor from './components/MapEditor';
import SquadEditorPanel from './components/SquadEditorPanel';
import { Shield, MapPin, Swords, Download, Info, Upload, Trash2, FileJson, RotateCcw, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'tactical_editor_v2_data';

// ---------------- DEMO DATASETS FOR INCREDIBLE VISUAL DRILLDOWN ----------------
const DEFAULT_LAYERS: TacticalLayer[] = [
  { id: 'def-blue', name: 'Синий Рубеж Обороны', isVisible: true, isLocked: false },
  { id: 'un-buffer', name: 'Буферная Зона ООН', isVisible: true, isLocked: false },
  { id: 'adv-recon', name: 'Разведсводка (Hostile)', isVisible: true, isLocked: false }
];

const DEFAULT_SQUADS: SquadMarker[] = [
  {
    id: 'sq-1',
    name: 'Авангард-1',
    lat: 48.4712,
    lng: 35.0354,
    layerId: 'def-blue',
    notes: 'Механизированная рота на БМП-3. Прикрытие речного брода.',
    updatedAt: new Date().toISOString(),
    config: {
      affiliation: 'friendly',
      role: 'mechanized',
      echelon: 'company',
      designation: '1 МПЦ',
      speed: '20 км/ч',
      strength: '92%',
      extraLabel: 'АВАНГАРД',
      size: 50,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: true,
      rotation: 45,
      showRotationArrow: true,
      status: 'active'
    }
  },
  {
    id: 'sq-2',
    name: 'КП Восток',
    lat: 48.4556,
    lng: 35.0221,
    layerId: 'def-blue',
    notes: 'Командный пункт бригады стратегического резерва.',
    updatedAt: new Date().toISOString(),
    config: {
      affiliation: 'friendly',
      role: 'hq',
      echelon: 'brigade',
      designation: 'ШТАБ 93',
      speed: '0',
      strength: '100%',
      extraLabel: 'КП ВОСТОК',
      size: 58,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 0,
      showRotationArrow: false,
      status: 'active'
    }
  },
  {
    id: 'sq-3',
    name: 'Ударная группа ГР',
    lat: 48.4821,
    lng: 35.0682,
    layerId: 'adv-recon',
    notes: 'Тяжелый танковый батальон противника (Т-80БВ). Замечено движение во фланги.',
    updatedAt: new Date().toISOString(),
    config: {
      affiliation: 'hostile',
      role: 'armor',
      echelon: 'battalion',
      designation: 'Т-80БВ',
      speed: '35 км/ч',
      strength: '78%',
      extraLabel: 'ОТ КРАСНЫХ',
      size: 54,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: true,
      rotation: 240,
      showRotationArrow: true,
      status: 'alert'
    }
  },
  {
    id: 'sq-4',
    name: 'БПЛА Глаз-9',
    lat: 48.4754,
    lng: 35.0481,
    layerId: 'adv-recon',
    notes: 'Беспилотный комплекс Орлан-10. Ведёт аэрофотосъемку.',
    updatedAt: new Date().toISOString(),
    config: {
      affiliation: 'hostile',
      role: 'uav',
      echelon: 'section',
      designation: 'Орлан',
      speed: '110 км/ч',
      strength: '100%',
      extraLabel: 'БПЛА 5',
      size: 44,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 180,
      showRotationArrow: true,
      status: 'active'
    }
  },
  {
    id: 'sq-5',
    name: 'Палата ООН',
    lat: 48.4623,
    lng: 35.0515,
    layerId: 'un-buffer',
    notes: 'Патрульный взвод миротворческих сил ООН.',
    updatedAt: new Date().toISOString(),
    config: {
      affiliation: 'neutral',
      role: 'infantry',
      echelon: 'platoon',
      designation: 'UN-P4',
      speed: '12 км/ч',
      strength: '100%',
      extraLabel: 'ПАТРУЛЬ',
      size: 46,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 90,
      showRotationArrow: true,
      status: 'active'
    }
  }
];

const DEFAULT_SHAPES: TacticalShape[] = [
  {
    id: 'sh-1',
    type: 'polyline',
    layerId: 'def-blue',
    name: 'Рубеж Обороны Днепр-Река',
    coordinates: [
      [48.4820, 35.0200],
      [48.4720, 35.0450],
      [48.4600, 35.0700]
    ],
    style: {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      weight: 4,
      opacity: 0.9,
      fillOpacity: 0,
      dashArray: '8,6'
    },
    notes: 'Линия окопов и подготовленных ДОТов.'
  },
  {
    id: 'sh-2',
    type: 'polygon',
    layerId: 'adv-recon',
    name: 'Сектор Рассредоточения Красных',
    coordinates: [
      [48.4850, 35.0600],
      [48.4900, 35.0750],
      [48.4800, 35.0800],
      [48.4750, 35.0650]
    ],
    style: {
      color: '#ef4444',
      fillColor: '#ef4444',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.22,
      dashArray: '3,3'
    },
    notes: 'Зона скрытного накопления танковых резервов агрессора.'
  },
  {
    id: 'sh-3',
    type: 'circle',
    layerId: 'un-buffer',
    name: 'Зона Ограничения Вооружения',
    coordinates: {
      center: { lat: 48.4623, lng: 35.0515 },
      radius: 1200
    },
    style: {
      color: '#22c55e',
      fillColor: '#22c55e',
      weight: 3,
      opacity: 0.85,
      fillOpacity: 0.1,
      dashArray: '12,5,3,5'
    },
    notes: 'Договорная зона запрета артиллерии.'
  }
];

const DEFAULT_PRESETS: TacticalPreset[] = [
  {
    id: 'p-1',
    name: 'Мотострелковая рота',
    config: {
      affiliation: 'friendly',
      role: 'mechanized',
      echelon: 'company',
      designation: 'МС Рота',
      speed: '25 км/ч',
      strength: '95%',
      extraLabel: 'ШТАБНАЯ',
      size: 52,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 0,
      showRotationArrow: true,
      status: 'active'
    }
  },
  {
    id: 'p-2',
    name: 'Танковая колонна вр.',
    config: {
      affiliation: 'hostile',
      role: 'armor',
      echelon: 'battalion',
      designation: 'Т-Колонна',
      speed: '30 км/ч',
      strength: '80%',
      extraLabel: 'УГРОЗА-1',
      size: 56,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: true,
      rotation: 180,
      showRotationArrow: true,
      status: 'alert'
    }
  },
  {
    id: 'p-3',
    name: 'Развед-взвод (Blue)',
    config: {
      affiliation: 'friendly',
      role: 'recon',
      echelon: 'platoon',
      designation: 'Развед.9',
      speed: '40 км/ч',
      strength: '100%',
      extraLabel: 'ПЛАСТУНЫ',
      size: 46,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 90,
      showRotationArrow: true,
      status: 'active'
    }
  },
  {
    id: 'p-4',
    name: 'Штаб Главный ООН',
    config: {
      affiliation: 'neutral',
      role: 'hq',
      echelon: 'brigade',
      designation: 'ШТАБ ООН',
      speed: '0',
      strength: '100%',
      extraLabel: 'СЕКТОР-2',
      size: 60,
      customFillColor: '',
      customStrokeColor: '',
      customTextColor: '',
      hasFill: true,
      hasGlow: false,
      rotation: 0,
      showRotationArrow: false,
      status: 'active'
    }
  }
];

const DEFAULT_PREFERENCES: MapPreferences = {
  tileProvider: 'dark', // default stealth black layout
  showGrid: true,
  gridType: 'mgrs',
  centerLatitude: 48.468,
  centerLongitude: 35.044,
  zoom: 13
};

export default function App() {
  // Main Tactical States
  const [layers, setLayers] = useState<TacticalLayer[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('def-blue');
  const [squads, setSquads] = useState<SquadMarker[]>(DEFAULT_SQUADS);
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shapes, setShapes] = useState<TacticalShape[]>(DEFAULT_SHAPES);
  const [presets, setPresets] = useState<TacticalPreset[]>(DEFAULT_PRESETS);
  const [mapPreferences, setMapPreferences] = useState<MapPreferences>(DEFAULT_PREFERENCES);
  
  // Floating pointer telemetry
  const [mouseCoordinates, setMouseCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const importInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClearAll = () => {
    if (window.confirm('Вы уверены, что хотите полностью очистить карту (удалить все отряды и фигуры)?')) {
      setSquads([]);
      setShapes([]);
      setSelectedSquadId(null);
      setSelectedShapeId(null);
    }
  };

  // Real-time double clock states for high fidelity design
  const [timeState, setTimeState] = useState({
    localTime: new Date().toLocaleTimeString(),
    zuluTime: new Date().toISOString().substring(11, 19) + 'Z'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeState({
        localTime: now.toLocaleTimeString(),
        zuluTime: now.toISOString().substring(11, 19) + 'Z'
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Load initial state from LocalStorage if exists
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.layers) setLayers(parsed.layers);
        if (parsed.selectedLayerId) setSelectedLayerId(parsed.selectedLayerId);
        if (parsed.squads) setSquads(parsed.squads);
        if (parsed.shapes) setShapes(parsed.shapes);
        if (parsed.presets) setPresets(parsed.presets);
        if (parsed.mapPreferences) setMapPreferences(parsed.mapPreferences);
      }
    } catch (e) {
      console.error('Failed to restore tactical cache:', e);
    }
  }, []);

  // 2. Autosave state changes to LocalStorage
  useEffect(() => {
    try {
      const dataToSave = {
        layers,
        selectedLayerId,
        squads,
        shapes,
        presets,
        mapPreferences
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Local Storage Cache syncing failed:', e);
    }
  }, [layers, selectedLayerId, squads, shapes, presets, mapPreferences]);

  // Derived current active squad
  const currentSelectedSquad = squads.find(s => s.id === selectedSquadId) || null;

  // Layer objects helper
  const activeLayerObj = layers.find(l => l.id === selectedLayerId);

  // Filter squads and shapes belonging ONLY to visible layers
  const visibleLayersIds = useMemo(() => layers.filter(l => l.isVisible).map(l => l.id), [layers]);
  const visibleSquads = useMemo(() => squads.filter(s => visibleLayersIds.includes(s.layerId)), [squads, visibleLayersIds]);
  const visibleShapes = useMemo(() => shapes.filter(s => visibleLayersIds.includes(s.layerId)), [shapes, visibleLayersIds]);

  // -------------- LAYER HANDLERS --------------
  const handleAddLayer = (name: string) => {
    const id = `layer-${Date.now()}`;
    const newLayer: TacticalLayer = { id, name, isVisible: true, isLocked: false };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(id); // switch to newly created layout
  };

  const handleToggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l));
  };

  const handleToggleLayerLock = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, isLocked: !l.isLocked } : l));
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter(l => l.id !== id));
    // Remove all squads & shapes linked to this layer
    setSquads(squads.filter(s => s.layerId !== id));
    setShapes(shapes.filter(s => s.layerId !== id));
    // Re-adjust active focused layer
    if (selectedLayerId === id) {
      const remaining = layers.filter(l => l.id !== id);
      setSelectedLayerId(remaining[0].id);
    }
  };

  // -------------- SQUAD HANDLERS --------------
  const handleAddSquadToCenter = (config: SquadIconConfig) => {
    if (activeLayerObj?.isLocked) return;

    const id = `squad-${Date.now()}`;
    // Place unit slightly offset if map already has markers at center
    const latOffset = (Math.random() - 0.5) * 0.005;
    const lngOffset = (Math.random() - 0.5) * 0.005;

    const newSquad: SquadMarker = {
      id,
      name: config.designation || 'МПГ Отряд',
      lat: mapPreferences.centerLatitude + latOffset,
      lng: mapPreferences.centerLongitude + lngOffset,
      layerId: selectedLayerId,
      notes: 'Сформировано на тактической карте.',
      updatedAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(config))
    };

    setSquads([...squads, newSquad]);
    setSelectedSquadId(id); // focus custom parameters immediately
  };

  const handleUpdateSquad = (squadId: string, updates: Partial<SquadMarker>) => {
    if (activeLayerObj?.isLocked) return;

    setSquads(squads.map(s => {
      if (s.id === squadId) {
        return {
          ...s,
          ...updates,
          name: updates.config?.designation || s.name,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  const handleUpdateSquadCoordinates = (id: string, lat: number, lng: number) => {
    if (activeLayerObj?.isLocked) return;
    setSquads(squads.map(s => s.id === id ? { ...s, lat, lng } : s));
  };

  const handleDeleteSquad = (id: string) => {
    if (activeLayerObj?.isLocked) return;
    setSquads(squads.filter(s => s.id !== id));
    if (selectedSquadId === id) {
      setSelectedSquadId(null);
    }
  };

  const handleDuplicateSquad = (id: string) => {
    if (activeLayerObj?.isLocked) return;
    const orig = squads.find(s => s.id === id);
    if (!orig) return;

    const dupId = `squad-${Date.now()}`;
    const duplicate: SquadMarker = {
      ...JSON.parse(JSON.stringify(orig)),
      id: dupId,
      lat: orig.lat + 0.003, // slide slightly northeast so it shifts visually
      lng: orig.lng + 0.003,
      updatedAt: new Date().toISOString()
    };

    setSquads([...squads, duplicate]);
    setSelectedSquadId(dupId);
  };

  // -------------- GEOMAN DRAWN SHAPES HANDLERS --------------
  const handleAddShape = (shape: Omit<TacticalShape, 'id'>) => {
    if (activeLayerObj?.isLocked) return;
    
    const id = `shape-${Date.now()}`;
    const newShape: TacticalShape = { ...shape, id };
    setShapes([...shapes, newShape]);
  };

  const handleUpdateShapeCoordinates = (id: string, coordinates: any) => {
    if (activeLayerObj?.isLocked) return;
    setShapes(shapes.map(s => s.id === id ? { ...s, coordinates } : s));
  };

  const handleDeleteShape = (id: string) => {
    if (activeLayerObj?.isLocked) return;
    setShapes(shapes.filter(s => s.id !== id));
  };

  // -------------- PRESETS HANDLERS --------------
  const handleSavePreset = (name: string, config: SquadIconConfig) => {
    const id = `preset-${Date.now()}`;
    setPresets([...presets, { id, name, config: JSON.parse(JSON.stringify(config)) }]);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  // Focus utility / teleporter click matching
  const handleFocusItem = (lat: number, lng: number) => {
    setMapPreferences(prev => ({
      ...prev,
      centerLatitude: lat,
      centerLongitude: lng,
      zoom: 14 // deep zoom focus
    }));
  };

  const handleSelectSquad = (squad: SquadMarker | null) => {
    setSelectedSquadId(squad ? squad.id : null);
    setSelectedShapeId(null);
    if (squad) {
      setSelectedLayerId(squad.layerId);
      // Auto make layer visible so they can see what they selected!
      setLayers(prev => prev.map(l => l.id === squad.layerId ? { ...l, isVisible: true } : l));
    }
  };

  const handleSelectShape = (shape: TacticalShape | null) => {
    setSelectedShapeId(shape ? shape.id : null);
    setSelectedSquadId(null);
    if (shape) {
      setSelectedLayerId(shape.layerId);
      // Auto make layer visible so they can see what they selected!
      setLayers(prev => prev.map(l => l.id === shape.layerId ? { ...l, isVisible: true } : l));
    }
  };

  const handleFocusSquad = (squad: SquadMarker) => {
    handleSelectSquad(squad);
    handleFocusItem(squad.lat, squad.lng);
  };

  const handleFocusShape = (sh: TacticalShape) => {
    handleSelectShape(sh);
    if (sh.type === 'polyline' || sh.type === 'polygon' || sh.type === 'rectangle') {
      const coords = sh.coordinates;
      if (coords && coords.length > 0) {
        const item = coords[0];
        if (item) {
          const lat = typeof item.lat === 'number' ? item.lat : (item[0] || 55.751244);
          const lng = typeof item.lng === 'number' ? item.lng : (item[1] || 37.618423);
          handleFocusItem(lat, lng);
        }
      }
    } else if (sh.type === 'circle') {
      handleFocusItem(sh.coordinates.center.lat, sh.coordinates.center.lng);
    } else if (sh.type === 'text') {
      handleFocusItem(sh.coordinates.lat, sh.coordinates.lng);
    }
  };

  // -------------- EXPORT & IMPORT UTILITIES --------------
  const handleExportData = () => {
    const dataObj = {
      layers,
      selectedLayerId,
      squads,
      shapes,
      presets,
      mapPreferences,
      savedAt: new Date().toISOString(),
      app: 'Tactical Map Editor'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Tactical_Plan_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.layers) setLayers(parsed.layers);
        if (parsed.selectedLayerId) setSelectedLayerId(parsed.selectedLayerId);
        if (parsed.squads) setSquads(parsed.squads);
        if (parsed.shapes) setShapes(parsed.shapes);
        if (parsed.presets) setPresets(parsed.presets);
        if (parsed.mapPreferences) setMapPreferences(parsed.mapPreferences);
      } catch (err) {
        alert('Невозможно импортировать файл: неверная структура данных JSON.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* 1. LEFT Command Sidebar */}
      <Sidebar
        layers={layers}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
        onAddLayer={handleAddLayer}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onToggleLayerLock={handleToggleLayerLock}
        onDeleteLayer={handleDeleteLayer}
        squads={squads}
        onSelectSquad={handleSelectSquad}
        selectedSquadId={selectedSquadId}
        onDeleteSquad={handleDeleteSquad}
        onFocusSquad={handleFocusSquad}
        shapes={shapes}
        onDeleteShape={handleDeleteShape}
        onFocusShape={handleFocusShape}
        selectedShapeId={selectedShapeId}
        onSelectShape={handleSelectShape}
        mapPreferences={mapPreferences}
        onUpdatePreferences={(pref) => setMapPreferences(prev => ({ ...prev, ...pref }))}
        onExportData={handleExportData}
        onImportData={handleImportData}
        mouseCoordinates={mouseCoordinates}
      />

      {/* 2. CENTER Tactical Map Stage Canvas */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        
        {/* App Top C2 Bar with custom visual layout and real-time military indicators */}
        <header className="h-14 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-6 select-none z-10 shrink-0 shadow-lg shadow-black/30 relative">
          <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          
          <div className="flex items-center gap-3">
            <div className="p-1 px-1.5 rounded bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center">
              <Swords className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-cyan-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5 label-main-c2">
                TACTICAL CONTROL PANEL
                <span className="text-[10px] px-1 bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded font-normal font-sans tracking-normal select-none relative top-[-1px]">v3.0</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                СЕНСОРНЫЕ ДАННЫЕ ОНЛАЙН • РЕЖИМ СВЯЗИ АКТИВЕН
              </span>
            </div>
          </div>
          
          {/* Live Clock Tickers & Real-time Sensor Telemetry Box */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
            {/* Live Dual Military Clocks */}
            <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800/80">
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-slate-500 leading-none">LOCAL TС</span>
                <span className="text-cyan-400 leading-snug tracking-wider text-xs font-bold">{timeState.localTime}</span>
              </div>
              <div className="w-[1px] h-6 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 leading-none flex items-center gap-1 font-mono">ZULU (UTC) <span className="w-1 h-1 bg-red-500 rounded-full animate-ping" /></span>
                <span className="text-pink-500 leading-snug tracking-wider text-xs font-bold">{timeState.zuluTime}</span>
              </div>
            </div>

            {/* Simulated Ping Metrics */}
            <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800/80 text-[11px] text-slate-300">
              <div className="flex flex-col">
                <span className="text-[8.5px] text-slate-500">ОБЪЕКТЫ</span>
                <span className="text-slate-100 font-semibold">ОТРЯДЫ: <strong className="text-cyan-400">{squads.length}</strong></span>
              </div>
              <div className="w-[1px] h-4 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[8.5px] text-slate-500">СЛОИ</span>
                <span className="text-slate-100 font-semibold">КАРТЫ: <strong className="text-emerald-400">{layers.length}</strong></span>
              </div>
              <div className="w-[1px] h-4 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-[8.5px] text-slate-500">ФИГУРЫ</span>
                <span className="text-slate-100 font-semibold">ЗОНЫ: <strong className="text-pink-400">{shapes.length}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Quick state indicators */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 text-[10px]">СЛОЙ:</span>
              <span className="text-cyan-400 font-bold tracking-tight text-xs max-w-[120px] truncate" title={activeLayerObj?.name}>{activeLayerObj?.name || 'НЕТ'}</span>
              {activeLayerObj?.isLocked ? (
                <span className="text-red-400 text-[10px] ml-1 flex items-center gap-0.5" title="Изменения в текущем слое заблокированы">🔒 БЛОК</span>
              ) : (
                <span className="text-emerald-400 text-[9px] ml-1 font-semibold" title="Редактирование доступно">🔓 РАЗБЛОК</span>
              )}
            </div>

            {/* Tactical JSON Action Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800/80 shadow-inner">
              <input 
                type="file" 
                ref={importInputRef} 
                onChange={handleImportData} 
                className="hidden" 
                accept=".json" 
              />
              
              <button
                onClick={() => importInputRef.current?.click()}
                title="Импортировать тактическую схему (JSON)"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition flex items-center gap-1 text-[11px] font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Импорт</span>
              </button>

              <button
                onClick={handleExportData}
                title="Экспортировать тактическую схему в файл JSON"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition flex items-center gap-1 text-[11px] font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-800 mx-1" />

              <button
                onClick={handleClearAll}
                title="Полностью очистить все отряды и фигуры на карте"
                className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition flex items-center gap-1 text-[11px] font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-red-400">Очистить Кару</span>
              </button>
            </div>
          </div>
        </header>

         {/* Leaflet Editor wrapper */}
        <div className="flex-1 min-w-0">
          <MapEditor
            layers={layers}
            squads={visibleSquads}
            onUpdateSquadCoordinates={handleUpdateSquadCoordinates}
            selectedSquadId={selectedSquadId}
            onSelectSquadId={(id) => handleSelectSquad(squads.find(s => s.id === id) || null)}
            shapes={visibleShapes}
            onAddShape={handleAddShape}
            onUpdateShapeCoordinates={handleUpdateShapeCoordinates}
            selectedShapeId={selectedShapeId}
            onSelectShapeId={(id) => handleSelectShape(shapes.find(s => s.id === id) || null)}
            selectedLayerId={selectedLayerId}
            activeLayerObj={activeLayerObj}
            mapPreferences={mapPreferences}
            onUpdatePreferences={(pref) => setMapPreferences(prev => ({ ...prev, ...pref }))}
            onMouseMoveCoordinates={setMouseCoordinates}
          />
        </div>
      </div>

      {/* 3. RIGHT Custom Symbology panel */}
      <div className="w-80 shrink-0 h-full border-l border-slate-800 bg-slate-900">
        <SquadEditorPanel
          selectedSquad={currentSelectedSquad}
          onUpdateSquad={handleUpdateSquad}
          onDeleteSquad={handleDeleteSquad}
          onDuplicateSquad={handleDuplicateSquad}
          onAddSquadToCenter={handleAddSquadToCenter}
          presets={presets}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          onLoadPreset={(cfg) => handleAddSquadToCenter(cfg)}
          onFocusSquad={(s) => handleFocusItem(s.lat, s.lng)}
        />
      </div>

    </div>
  );
}
