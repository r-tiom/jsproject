/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TacticalLayer, 
  SquadMarker, 
  TacticalShape, 
  MapPreferences 
} from '../types';
import { 
  Layers, 
  Map, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Compass, 
  Grid, 
  Focus, 
  ChevronRight, 
  FolderLock,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  layers: TacticalLayer[];
  selectedLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: (name: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  
  squads: SquadMarker[];
  onSelectSquad: (squad: SquadMarker | null) => void;
  selectedSquadId: string | null;
  onDeleteSquad: (id: string) => void;
  onFocusSquad: (squad: SquadMarker) => void;

  shapes: TacticalShape[];
  onDeleteShape: (id: string) => void;
  onFocusShape: (shape: TacticalShape) => void;
  selectedShapeId?: string | null;
  onSelectShape?: (shape: TacticalShape | null) => void;

  mapPreferences: MapPreferences;
  onUpdatePreferences: (pref: Partial<MapPreferences>) => void;
  
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  mouseCoordinates: { lat: number; lng: number } | null;
}

export default function Sidebar({
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteLayer,
  squads,
  onSelectSquad,
  selectedSquadId,
  onDeleteSquad,
  onFocusSquad,
  shapes,
  onDeleteShape,
  onFocusShape,
  selectedShapeId = null,
  onSelectShape,
  mapPreferences,
  onUpdatePreferences,
  onExportData,
  onImportData,
  mouseCoordinates
}: SidebarProps) {
  const [newLayerName, setNewLayerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'layers' | 'elements' | 'system'>('layers');

  const getLayerColor = (layerId: string) => {
    const LAYER_COLORS: Record<string, string> = {
      'def-blue': '#3b82f6',
      'un-buffer': '#10b981',
      'adv-recon': '#f43f5e',
    };
    if (LAYER_COLORS[layerId]) return LAYER_COLORS[layerId];
    const colors = ['#3b82f6', '#10b981', '#f43f5e', '#a855f7', '#eab308', '#ec4899', '#14b8a6'];
    let sum = 0;
    for (let i = 0; i < layerId.length; i++) {
      sum += layerId.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Filter squads & shapes by query
  const filteredSquads = squads.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.config.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.config.extraLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShapes = shapes.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayerName.trim()) return;
    onAddLayer(newLayerName.trim());
    setNewLayerName('');
  };

  // Standard military simulated NATO reference conversion
  const formatMGRS = (lat: number, lng: number) => {
    const latZone = Math.floor((lat + 80) / 8) + 1;
    const lngZone = Math.floor((lng + 180) / 6) + 1;
    const easting = Math.floor((lng * 10000 + 500000) % 100000).toString().padStart(5, '0');
    const northing = Math.floor((lat * 10000 + 10000000) % 100000).toString().padStart(5, '0');
    const zones = "CDEFGHJKLMQRSTUVWX";
    const zoneChar = zones[Math.min(zones.length - 1, Math.max(0, Math.floor((lat + 80) / 10)))];
    return `${lngZone}${zoneChar} QD ${easting.substring(0,4)} ${northing.substring(0,4)}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-hidden w-80">
      
      {/* Tactical C2 Banner */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h1 className="font-mono text-xs uppercase tracking-widest font-bold text-slate-100">
            ОПЕРАТИВНЫЙ РЕДАКТОР КАРТ
          </h1>
        </div>
        <p className="font-sans text-[11px] text-slate-400 mt-0.5">ВЫСОТО-СИСТЕМНОЕ УПРАВЛЕНИЕ ТАКТИКОЙ</p>
      </div>

      {/* Tabs with cyberpunk outline and lighting */}
      <div className="flex bg-slate-950 px-2 pt-2 border-b border-slate-800/80 gap-1 select-none">
        {(['layers', 'elements', 'system'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[10.5px] font-mono font-bold tracking-wider rounded-t transition-all duration-150 relative border-t ${
                isActive
                  ? 'bg-slate-900 border-t-cyan-500 border-x border-x-slate-800/80 text-cyan-400 font-extrabold shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                  : 'bg-slate-950/40 border-t-transparent border-x border-x-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 h-7">
                {tab === 'layers' && <Layers className="w-3.5 h-3.5" />}
                {tab === 'elements' && <Compass className="w-3.5 h-3.5" />}
                {tab === 'system' && <Map className="w-3.5 h-3.5" />}
                
                {tab === 'layers' && 'СЛОИ'}
                {tab === 'elements' && `ОБЪЕКТЫ (${squads.length + shapes.length})`}
                {tab === 'system' && 'ОПЦИИ'}
              </div>
              {isActive && (
                <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* TAB 1: LAYERS MANAGER */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            
            {/* Create Layer Form */}
            <form onSubmit={handleCreateLayer} className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Добавить Оперативный Слой</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="напр., Авангард Прорыв"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded flex-1 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs px-2.5 rounded hover:bg-cyan-900 transition flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Active Selectable Layer List */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Оперативные слои редактора</label>
              
              {layers.map(layer => {
                const layerSquadCount = squads.filter(s => s.layerId === layer.id).length;
                const layerShapeCount = shapes.filter(s => s.layerId === layer.id).length;
                const isSelected = selectedLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`flex flex-col p-2.5 rounded border text-left cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/80 border-cyan-500 shadow-md shadow-cyan-500/5'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
                        <span className={`text-xs font-mono font-bold truncate ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                          {layer.name}
                        </span>
                      </div>
                      
                      {/* Control buttons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* Lock toggle */}
                        <button
                          onClick={() => onToggleLayerLock(layer.id)}
                          className={`p-1 rounded hover:bg-slate-700 transition ${layer.isLocked ? 'text-red-400' : 'text-slate-400'}`}
                          title={layer.isLocked ? "Разблокировать" : "Заблокировать изменения"}
                        >
                          {layer.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        
                        {/* Visibility eye toggle */}
                        <button
                          onClick={() => onToggleLayerVisibility(layer.id)}
                          className={`p-1 rounded hover:bg-slate-700 transition ${layer.isVisible ? 'text-cyan-400' : 'text-slate-400'}`}
                          title={layer.isVisible ? "Скрыть слой" : "Показать слой"}
                        >
                          {layer.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>

                        {/* Delete layer */}
                        {layers.length > 1 && (
                          <button
                            onClick={() => onDeleteLayer(layer.id)}
                            className="p-1 rounded hover:bg-slate-700 hover:text-red-400 text-slate-500 transition"
                            title="Удалить слой и всё содержимое"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Footnote statistics */}
                    <div className="mt-1 pl-5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>Отряды: {layerSquadCount}</span>
                      <span>•</span>
                      <span>Фигуры: {layerShapeCount}</span>
                      {layer.isLocked && (
                        <span className="text-red-500 font-bold ml-auto flex items-center gap-0.5">
                          <FolderLock className="w-2.5 h-2.5" /> LOCK
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ELEMENTS NAVIGATOR */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            
            {/* Search items filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Поиск отряда или фигуры..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs pl-8 pr-3 py-2 rounded focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Squad lists */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Тактические отряды ({filteredSquads.length})</span>
                <span className="text-[10px] font-mono text-cyan-400">Свойства</span>
              </div>

              {filteredSquads.length === 0 ? (
                <div className="text-center font-mono py-4 text-xs text-slate-550 border border-slate-800/40 rounded bg-slate-950/20">
                  нет соответствующих отрядов
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredSquads.map(sq => {
                    const isSelected = selectedSquadId === sq.id;
                    const allianceColors: Record<string, string> = {
                      friendly: 'border-blue-500 bg-blue-950/40',
                      hostile: 'border-red-500 bg-red-950/40',
                      neutral: 'border-emerald-500 bg-emerald-950/40',
                      unknown: 'border-amber-500 bg-amber-950/40',
                    };
                    const borderCls = allianceColors[sq.config.affiliation] || 'border-slate-500 bg-slate-950/40';
                    const parentLayer = layers.find(l => l.id === sq.layerId);
                    const isHidden = parentLayer ? !parentLayer.isVisible : false;

                    return (
                      <div
                        key={sq.id}
                        onClick={() => onSelectSquad(sq)}
                        className={`flex flex-col gap-1.5 p-2 rounded text-xs transition border cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-800 border-cyan-500 text-slate-100 shadow shadow-cyan-950/20' 
                            : `${borderCls} border-opacity-30 hover:bg-slate-800/20`
                        } ${isHidden ? 'opacity-55' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            {/* Unit designation indicator */}
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <div className="truncate font-mono font-bold text-slate-200">
                              {sq.config.designation || 'Безымянный'}
                            </div>
                            {isHidden && (
                              <EyeOff className="w-3 h-3 text-amber-500 shrink-0" title="Слой скрыт" />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onFocusSquad(sq)}
                              className="p-1 rounded bg-slate-950/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                              title="Сфокусировать карту"
                            >
                              <Focus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteSquad(sq.id)}
                              className="p-1 rounded bg-slate-950/60 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                          <span className="truncate pr-1">
                            Азимут: {sq.config.rotation}° • {sq.config.role}
                          </span>
                          
                          {parentLayer && (
                            <span 
                              className="text-[8.5px] px-1 py-0.2 rounded font-mono font-bold border shrink-0 truncate max-w-[120px]"
                              style={{ 
                                color: getLayerColor(parentLayer.id), 
                                borderColor: `${getLayerColor(parentLayer.id)}35`, 
                                backgroundColor: `${getLayerColor(parentLayer.id)}12` 
                              }}
                              title={`Слой: ${parentLayer.name}`}
                            >
                              {parentLayer.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawn Shapes / Vector Line-Art lists */}
            <div className="space-y-3 pb-2 border-t border-slate-800/60 pt-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block px-1">Тактические линии и зоны ({filteredShapes.length})</span>
              
              {filteredShapes.length === 0 ? (
                <div className="text-center font-mono py-3 text-xs text-slate-550 border border-slate-800/40 rounded bg-slate-950/20">
                  нет начерченных фигур
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredShapes.map(sh => {
                    const isShapeSelected = selectedShapeId === sh.id;
                    const parentLayer = layers.find(l => l.id === sh.layerId);
                    const isHidden = parentLayer ? !parentLayer.isVisible : false;

                    return (
                      <div
                        key={sh.id}
                        onClick={() => onSelectShape?.(sh)}
                        className={`flex flex-col gap-1.5 p-2 rounded text-xs transition border cursor-pointer ${
                          isShapeSelected
                            ? 'bg-slate-850 border-cyan-500 text-slate-100 shadow shadow-cyan-950/20'
                            : 'bg-slate-950/30 border-slate-800 hover:bg-slate-800/20'
                        } ${isHidden ? 'opacity-55' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span 
                              className="w-2.5 h-1.5 rounded-sm block shrink-0" 
                              style={{ backgroundColor: sh.style.color || '#ef4444' }} 
                            />
                            <span className="font-mono text-slate-300 truncate font-semibold" title={sh.name}>
                              {sh.name}
                            </span>
                            {isHidden && (
                              <EyeOff className="w-3 h-3 text-amber-500 shrink-0" title="Слой скрыт" />
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onFocusShape(sh)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
                              title="Сфокусировать карту"
                            >
                              <Focus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteShape(sh.id)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                          <span className="capitalize">{sh.type}</span>
                          
                          {parentLayer && (
                            <span 
                              className="text-[8.5px] px-1 py-0.2 rounded font-mono font-bold border shrink-0 truncate max-w-[120px]"
                              style={{ 
                                color: getLayerColor(parentLayer.id), 
                                borderColor: `${getLayerColor(parentLayer.id)}35`, 
                                backgroundColor: `${getLayerColor(parentLayer.id)}12` 
                              }}
                              title={`Слой: ${parentLayer.name}`}
                            >
                              {parentLayer.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM - TILES AND IMPORT-EXPORT */}
        {activeTab === 'system' && (
          <div className="space-y-5">
            
            {/* Map Tiles selection */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Стиль картографии (Провайдер)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['osm', 'satellite', 'dark', 'terrain', 'topo', 'light', 'voyager', 'grey'] as const).map(style => {
                  const styleLabels = {
                    osm: 'Стандарт ЕС',
                    satellite: 'Спутник HQ',
                    dark: 'Стелс Чёрный',
                    terrain: 'Рельеф зоны',
                    topo: 'Топограф',
                    light: 'Светлый',
                    voyager: 'Карто Цветная',
                    grey: 'Серая Схема'
                  };

                  return (
                    <button
                      key={style}
                      onClick={() => onUpdatePreferences({ tileProvider: style })}
                      className={`px-2 py-1.5 text-xs rounded border font-mono transition text-left ${
                        mapPreferences.tileProvider === style
                          ? 'bg-slate-850 border-cyan-500 font-bold text-slate-50'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-850/30'
                      }`}
                    >
                      {styleLabels[style]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid overlay controls */}
            <div className="space-y-3 bg-slate-950/40 p-3 rounded border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                  <Grid className="w-4 h-4 text-cyan-400" />
                  Координатная Сетка
                </div>
                <input
                  type="checkbox"
                  checked={mapPreferences.showGrid}
                  onChange={(e) => onUpdatePreferences({ showGrid: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-4 w-4"
                />
              </div>

              {mapPreferences.showGrid && (
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/40">
                  <button
                    onClick={() => onUpdatePreferences({ gridType: 'degrees' })}
                    className={`px-2 py-1 text-[10px] font-mono rounded border ${
                      mapPreferences.gridType === 'degrees' ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-transparent border-slate-800 text-slate-500'
                    }`}
                  >
                    Градусы (WGS84)
                  </button>
                  <button
                    onClick={() => onUpdatePreferences({ gridType: 'mgrs' })}
                    className={`px-2 py-1 text-[10px] font-mono rounded border ${
                      mapPreferences.gridType === 'mgrs' ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-transparent border-slate-800 text-slate-500'
                    }`}
                  >
                    MGRS / Сетка НАТО
                  </button>
                </div>
              )}
            </div>

            {/* EXPORT IMPORT */}
            <div className="space-y-2 bg-slate-950/40 p-3 rounded border border-slate-800">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Оперативный Штабной Экспорт</span>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={onExportData}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 border border-slate-750 text-slate-200 transition text-xs font-mono font-bold rounded"
                >
                  <Download className="w-3.5 h-3.5" />
                  Сохранить тактическую схему
                </button>
                
                <label className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-950 hover:bg-slate-850 text-xs font-mono font-bold rounded border border-slate-800 cursor-pointer text-slate-400 transition hover:text-slate-100">
                  <Upload className="w-3.5 h-3.5" />
                  Загрузить файлы тактики
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Hover Coordinates Telemetry block (Footer) */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col justify-start">
        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-505 text-cyan-500 mb-1">
          КООРДИНАТНЫЙ ТЕЛЕМЕТРИЧЕСКИЙ БЛОК
        </span>
        
        {mouseCoordinates ? (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Широта (Lat):</span>
              <span className="text-emerald-400 font-bold">{mouseCoordinates.lat.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Долгота (Lng):</span>
              <span className="text-emerald-400 font-bold">{mouseCoordinates.lng.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono border-t border-slate-900 pt-1 mt-1">
              <span className="text-slate-400">Сетка MGRS:</span>
              <span className="text-cyan-400 text-[10px] font-extrabold">
                {formatMGRS(mouseCoordinates.lat, mouseCoordinates.lng)}
              </span>
            </div>
          </div>
        ) : (
          <div className="font-mono text-[10px] text-slate-500 text-center py-2.5">
            [ НАБЕРИТЕ КУРСОР НА КАРТУ ДЛЯ ПОЛУЧЕНИЯ СЕТКИ ]
          </div>
        )}
      </div>

    </div>
  );
}
