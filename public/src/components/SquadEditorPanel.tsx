/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SquadIconConfig, Affiliation, RoleSymbol, Echelon, SquadMarker, TacticalPreset } from '../types';
import { renderSquadSVG, DEFAULT_COLORS } from '../utils/squadRenderer';
import { Save, Copy, Trash2, Shield, AlertTriangle, RefreshCw, Crosshair, MapPin } from 'lucide-react';

interface SquadEditorPanelProps {
  selectedSquad: SquadMarker | null;
  onUpdateSquad: (squadId: string, updates: Partial<SquadMarker>) => void;
  onDeleteSquad: (squadId: string) => void;
  onDuplicateSquad: (squadId: string) => void;
  onAddSquadToCenter: (config: SquadIconConfig) => void;
  presets: TacticalPreset[];
  onSavePreset: (name: string, config: SquadIconConfig) => void;
  onLoadPreset: (config: SquadIconConfig) => void;
  onDeletePreset: (id: string) => void;
  onFocusSquad: (squad: SquadMarker) => void;
}

const DEFAULT_SQUAD_CONFIG: SquadIconConfig = {
  affiliation: 'friendly',
  role: 'infantry',
  echelon: 'company',
  designation: '1 Coy',
  speed: '25 km/h',
  strength: '95%',
  extraLabel: 'ALPHA',
  size: 52,
  customFillColor: '',
  customStrokeColor: '',
  customTextColor: '',
  hasFill: true,
  hasGlow: false,
  rotation: 0,
  showRotationArrow: true,
  status: 'active'
};

export default function SquadEditorPanel({
  selectedSquad,
  onUpdateSquad,
  onDeleteSquad,
  onDuplicateSquad,
  onAddSquadToCenter,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onFocusSquad
}: SquadEditorPanelProps) {
  
  // Local state for active config panel (either editing existing or drafting a new one)
  const [draftConfig, setDraftConfig] = useState<SquadIconConfig>(DEFAULT_SQUAD_CONFIG);
  const [newPresetName, setNewPresetName] = useState('');
  const [customColorsEnabled, setCustomColorsEnabled] = useState(false);

  // Sync customColorsEnabled if activeConfig has custom colors on load
  React.useEffect(() => {
    const active = selectedSquad ? selectedSquad.config : draftConfig;
    if (active.customFillColor || active.customStrokeColor || active.customTextColor) {
      setCustomColorsEnabled(true);
    } else {
      setCustomColorsEnabled(false);
    }
  }, [selectedSquad?.id]);

  // Determine current active config to edit
  const activeConfig = selectedSquad ? selectedSquad.config : draftConfig;

  const updateActiveConfig = (updates: Partial<SquadIconConfig>) => {
    if (selectedSquad) {
      onUpdateSquad(selectedSquad.id, {
        config: { ...selectedSquad.config, ...updates },
        updatedAt: new Date().toISOString()
      });
    } else {
      setDraftConfig(prev => ({ ...prev, ...updates }));
    }
  };

  const handleCreateNewSquad = () => {
    onAddSquadToCenter(draftConfig);
  };

  const handleSaveToPresets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim(), activeConfig);
    setNewPresetName('');
  };

  // Convert affiliation to clear display names
  const affiliationsList: { id: Affiliation; label: string; bg: string; border: string }[] = [
    { id: 'friendly', label: 'Дружествен. (Cиние)', bg: 'bg-blue-900/50', border: 'border-blue-500' },
    { id: 'hostile', label: 'Враждебные (Красные)', bg: 'bg-red-950/50', border: 'border-red-600' },
    { id: 'neutral', label: 'Нейтральные (Зелёные)', bg: 'bg-emerald-950/50', border: 'border-emerald-500' },
    { id: 'unknown', label: 'Неизвестные (Жёлтые)', bg: 'bg-amber-950/50', border: 'border-amber-500' },
    { id: 'custom', label: 'Особые (Серые)', bg: 'bg-slate-800/60', border: 'border-slate-500' }
  ];

  const rolesList: { id: RoleSymbol; label: string }[] = [
    { id: 'infantry', label: 'Пехота (Infantry)' },
    { id: 'armor', label: 'Бронетехника (Armored)' },
    { id: 'mechanized', label: 'Мотопехота (Mech)' },
    { id: 'recon', label: 'Разведка (Recon)' },
    { id: 'artillery', label: 'Артиллерия (Artillery)' },
    { id: 'airborne', label: 'ВДВ (Airborne)' },
    { id: 'engineer', label: 'Инженеры (Engineers)' },
    { id: 'signal', label: 'Связь (Signals)' },
    { id: 'medical', label: 'Медики (Medical)' },
    { id: 'uav', label: 'БПЛА (UAV/Drone)' },
    { id: 'hq', label: 'Штаб / КП (HQ)' },
    { id: 'custom-label', label: 'Свой текст (Custom Text)' }
  ];

  const echelonsList: { id: Echelon; label: string; symbol: string }[] = [
    { id: 'none', label: 'Нет ранга', symbol: '—' },
    { id: 'team', label: 'Группа / Тройка (Fireteam)', symbol: '∅' },
    { id: 'squad', label: 'Отделение (Squad)', symbol: '●' },
    { id: 'section', label: 'Секция / Полувзвод', symbol: '●●' },
    { id: 'platoon', label: 'Взвод (Platoon)', symbol: '●●●' },
    { id: 'company', label: 'Рота / Батарея (Company)', symbol: 'I' },
    { id: 'battalion', label: 'Батальон / Дивизион (Bn)', symbol: 'II' },
    { id: 'regiment', label: 'Полк (Regiment)', symbol: 'III' },
    { id: 'brigade', label: 'Бригада (Brigade)', symbol: 'X' },
    { id: 'division', label: 'Дивизия (Division)', symbol: 'XX' },
    { id: 'corps', label: 'Корпус (Corps)', symbol: 'XXX' },
    { id: 'army', label: 'Армия (Army)', symbol: 'XXXX' }
  ];

  const conditionsList: { id: 'active' | 'alert' | 'damaged' | 'lost'; label: string; color: string }[] = [
    { id: 'active', label: 'Боеготовность (Active)', color: 'bg-emerald-500' },
    { id: 'alert', label: 'Тревога / Начеку (Alert)', color: 'bg-red-500' },
    { id: 'damaged', label: 'Ослаблен (Damaged)', color: 'bg-orange-500' },
    { id: 'lost', label: 'Потери / Уничтожен (Lost)', color: 'bg-slate-600' }
  ];

  // Render SVG live preview safely
  const svgMarkup = renderSquadSVG(activeConfig, !!selectedSquad);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-y-auto">
      {/* Upper Status Indicator */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 height-5 text-cyan-400" />
          <span className="font-mono text-sm uppercase tracking-wider font-semibold">
            {selectedSquad ? 'Свойства отряда' : 'Новый шаблон отряда'}
          </span>
        </div>
        {selectedSquad && (
          <button
            onClick={() => onFocusSquad(selectedSquad)}
            title="Показать на карте"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 font-mono text-xs transition duration-150"
          >
            <MapPin className="w-3.5 h-3.5" />
            На карту
          </button>
        )}
      </div>

      {/* 2D Symbology Canvas Preview */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border-b border-slate-800 min-h-[160px] relative pattern-tactical">
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 font-mono text-[10px] text-slate-400">
          СВЕЖИЙ ПРОСМОТР
        </div>
        
        {/* Real-time interactive scaled display */}
        <div 
          className="flex items-center justify-center bg-slate-900/40 p-5 rounded-xl border border-dashed border-slate-800 max-w-[120px] max-h-[120px] shadow-2xl shadow-black/40"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />

        <div className="mt-3 font-mono text-[11px] text-slate-400 flex items-center gap-1">
          <span>Тип: </span>
          <span className="text-cyan-400 font-bold uppercase">{selectedSquad ? 'ВЫБРАН НА КАРТЕ' : 'ПРЕСЕТ'}</span>
          <span>• Масштаб: {activeConfig.size}px</span>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* QUICK CONTROL MATRIX: Add Squad to Center or Apply */}
        {!selectedSquad && (
          <button
            onClick={handleCreateNewSquad}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-950 font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 active:shadow-inner text-sm transition duration-150 transform hover:-translate-y-0.5"
          >
            <Crosshair className="w-4 h-4" />
            Материализовать отряд в центре
          </button>
        )}

        {selectedSquad && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDuplicateSquad(selectedSquad.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded text-sm font-medium transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Копировать
            </button>
            <button
              onClick={() => onDeleteSquad(selectedSquad.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/70 hover:bg-red-900/90 text-red-300 border border-red-900/80 rounded text-sm font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Удалить
            </button>
          </div>
        )}

        {/* 1. STATE DECORATION / STATUS */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Состояние подразделения</label>
          <div className="grid grid-cols-2 gap-1.5">
            {conditionsList.map(cond => (
              <button
                key={cond.id}
                type="button"
                onClick={() => updateActiveConfig({ status: cond.id })}
                className={`flex items-center gap-2 px-2.5 py-2 rounded text-xs border text-left transition ${
                  activeConfig.status === cond.id
                    ? 'bg-slate-800 border-cyan-500/70 text-slate-50 font-semibold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${cond.color}`} />
                {cond.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 2. AFFILIATION / FRIENDLINESS */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Принадлежность (Свой-Чужой)</label>
          <div className="space-y-1">
            {affiliationsList.map(aff => (
              <button
                key={aff.id}
                onClick={() => updateActiveConfig({ affiliation: aff.id })}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded border transition ${
                  activeConfig.affiliation === aff.id
                    ? `${aff.bg} ${aff.border} text-slate-100 font-bold`
                    : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm border ${aff.border} ${aff.bg}`} />
                  {aff.label}
                </div>
                {activeConfig.affiliation === aff.id && <span className="text-cyan-400 text-[10px]">АКТИВ</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 3. BRANCH ROLE SYMBOL / CUSTOM ICON */}
        <div className="space-y-3 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Внутренний символ / Иконка</label>
          
          <div className="flex rounded bg-slate-950 p-0.5 border border-slate-800">
            {(['standard', 'emoji', 'url'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateActiveConfig({ customIconType: type })}
                className={`flex-1 py-1 text-center font-mono text-[10px] uppercase rounded transition ${
                  (activeConfig.customIconType || 'standard') === type
                    ? 'bg-slate-800 text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'standard' && 'НАТО'}
                {type === 'emoji' && 'Эмодзи'}
                {type === 'url' && 'Файл / URL'}
              </button>
            ))}
          </div>

          {(activeConfig.customIconType || 'standard') === 'standard' && (
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Род войск</label>
              <select
                value={activeConfig.role}
                onChange={(e) => updateActiveConfig({ role: e.target.value as RoleSymbol })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {rolesList.map(roleOpt => (
                  <option key={roleOpt.id} value={roleOpt.id}>
                    {roleOpt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(activeConfig.customIconType || 'standard') === 'emoji' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Введите эмодзи или символ</label>
              <input
                type="text"
                maxLength={4}
                placeholder="например: ⚔️"
                value={activeConfig.customIconValue || ''}
                onChange={(e) => updateActiveConfig({ customIconValue: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 text-center text-lg font-bold"
              />
              {/* Quick Emojis list */}
              <div className="grid grid-cols-8 gap-1 pt-1 bg-slate-950/60 p-1.5 rounded border border-slate-800/40">
                {['⚔️', '🛡️', '✈️', '⚓', '🚁', '📡', '🎯', '☠️', '⛺', '📻', '🛰️', '💥', '🏃', '☣️', '🔥', '🚑'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => updateActiveConfig({ customIconValue: em })}
                    className={`p-1 hover:bg-slate-800 rounded text-center transition text-sm ${
                      activeConfig.customIconValue === em ? 'bg-slate-800 border border-cyan-500' : ''
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(activeConfig.customIconType || 'standard') === 'url' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Ссылка на изображение (URL)</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={activeConfig.customIconValue || ''}
                  onChange={(e) => updateActiveConfig({ customIconValue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Drag n drop local file upload area */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Загрузить свой файл изображения</label>
                <div 
                  className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950 p-2.5 rounded text-center transition duration-150 cursor-pointer relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        updateActiveConfig({ customIconValue: base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          updateActiveConfig({ customIconValue: base64 });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[10px] font-semibold text-cyan-400">Нажмите или перетащите файл</span>
                    <span className="text-[8px] text-slate-550 font-mono">PNG, SVG, JPG, GIF (сжимается в Base64)</span>
                  </div>
                </div>
              </div>

              {activeConfig.customIconValue && activeConfig.customIconValue.startsWith('data:') && (
                <div className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded border border-slate-850">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={activeConfig.customIconValue} className="w-5 h-5 object-contain bg-slate-950 rounded border border-slate-800 shrink-0" alt="custom" />
                    <span className="text-[9px] text-slate-400 font-mono truncate">Файл загружен успешно</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateActiveConfig({ customIconValue: '' })}
                    className="text-[9px] text-red-400 hover:underline shrink-0"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3.1 SQUAD FRAME SHAPE */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Геометрическая форма тактического знака</label>
          <select
            value={activeConfig.frameShape || 'auto'}
            onChange={(e) => updateActiveConfig({ frameShape: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="auto">Авто (По фракции: Прямоугольник/Ромб/Квадрат)</option>
            <option value="rectangle">Прямоугольник (Friendly)</option>
            <option value="diamond">Ромб (Hostile)</option>
            <option value="square">Квадрат (Neutral)</option>
            <option value="circle">Круг (Circle)</option>
            <option value="shield">Щит / Восьмиугольник (Shield)</option>
            <option value="unknown">Спец-Клевер (Unknown)</option>
            <option value="none">Без внешней рамки (Only Icon)</option>
          </select>
        </div>

        {/* 4. SIZE / ECHELON */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Ранг формирования (Эшелон)</label>
          <select
            value={activeConfig.echelon}
            onChange={(e) => updateActiveConfig({ echelon: e.target.value as Echelon })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {echelonsList.map(ech => (
              <option key={ech.id} value={ech.id}>
                {ech.symbol} &nbsp;&nbsp; {ech.label}
              </option>
            ))}
          </select>
        </div>

        {/* 5. METADATA TEXT TAGS */}
        <div className="space-y-3 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">Текстовые Тактические Ярлыки</div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Номер / Название</label>
              <input
                type="text"
                placeholder="например: 3 бат"
                value={activeConfig.designation}
                onChange={(e) => updateActiveConfig({ designation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Численность / Предел</label>
              <input
                type="text"
                placeholder="например: 90% или 50чел"
                value={activeConfig.strength}
                onChange={(e) => updateActiveConfig({ strength: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Скорость / Путь</label>
              <input
                type="text"
                placeholder="например: 40км/ч"
                value={activeConfig.speed}
                onChange={(e) => updateActiveConfig({ speed: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Верхний заголовок</label>
              <input
                type="text"
                placeholder="например: АЛЬФА"
                value={activeConfig.extraLabel}
                onChange={(e) => updateActiveConfig({ extraLabel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 6. ROTATION-BEARING & ORIENTATION */}
        <div className="space-y-4 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Направление движения</span>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="showRotationArrow"
                checked={activeConfig.showRotationArrow}
                onChange={(e) => updateActiveConfig({ showRotationArrow: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 focus:ring-cyan-500 h-3.5 w-3.5"
              />
              <label htmlFor="showRotationArrow" className="text-[10px] font-mono text-slate-300">Вектор</label>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Азимут: {activeConfig.rotation}°</span>
              <button
                onClick={() => updateActiveConfig({ rotation: 0 })}
                className="text-cyan-500 text-[10px] hover:underline"
              >
                Сброс (Север)
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={activeConfig.rotation}
              onChange={(e) => updateActiveConfig({ rotation: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 7. SLIDER SIZE AND GENERAL STYLE FLAGS */}
        <div className="space-y-4 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Размер значка / Масштаб</span>
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/30">{activeConfig.size}px</span>
          </div>
          
          <input
            type="range"
            min="24"
            max="240"
            value={activeConfig.size}
            onChange={(e) => updateActiveConfig({ size: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer animate-none"
          />

          {/* Sizing Hotkeys */}
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {[24, 52, 96, 160, 240].map((sVal) => (
              <button
                key={sVal}
                type="button"
                onClick={() => updateActiveConfig({ size: sVal })}
                className={`text-[9px] font-mono py-1 rounded transition text-center ${
                  activeConfig.size === sVal
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/60 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {sVal}px
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Фоновая заливка</span>
              <input
                type="checkbox"
                checked={activeConfig.hasFill}
                onChange={(e) => updateActiveConfig({ hasFill: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-300">Спец-свечение</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <input
                type="checkbox"
                checked={activeConfig.hasGlow}
                onChange={(e) => updateActiveConfig({ hasGlow: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* 7.5 CUSTOM OUTLINE & ROLE LABEL OVERRIDES */}
        <div className="space-y-4 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">Настройки Контура и Надписей</div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">Показать род войск над иконкой</span>
            <input
              type="checkbox"
              checked={activeConfig.showRoleLabelAbove || false}
              onChange={(e) => updateActiveConfig({ showRoleLabelAbove: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-4 w-4 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-1.5 border-t border-slate-800/50">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Толщина линии контура: {activeConfig.customStrokeWidth !== undefined ? activeConfig.customStrokeWidth : 4.5}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={activeConfig.customStrokeWidth !== undefined ? activeConfig.customStrokeWidth : 4.5}
              onChange={(e) => updateActiveConfig({ customStrokeWidth: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-slate-400 uppercase">Стиль линии контура / Стиль обводки</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 border border-slate-800 rounded">
              {(['solid', 'dashed', 'dotted', 'double', 'dash-dot', 'long-dash'] as const).map((pattern) => (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => updateActiveConfig({ customStrokeDash: pattern })}
                  className={`py-1 text-center font-mono text-[9px] uppercase rounded transition ${
                    (activeConfig.customStrokeDash || 'solid') === pattern
                      ? 'bg-slate-800 text-cyan-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pattern === 'solid' && 'Сплошная'}
                  {pattern === 'dashed' && 'Штрих'}
                  {pattern === 'dotted' && 'Точки'}
                  {pattern === 'double' && 'Двойная'}
                  {pattern === 'dash-dot' && 'Штрих-Пкт'}
                  {pattern === 'long-dash' && 'Дл. Штрих'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 8. OVERRIDE RGB CUSTOM COLORS */}
        <div className="space-y-3 bg-slate-950/40 p-3 rounded border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Ручной выбор цветов</span>
            <input
              type="checkbox"
              id="customColorsEnabled"
              checked={customColorsEnabled}
              onChange={(e) => {
                setCustomColorsEnabled(e.target.checked);
                if (!e.target.checked) {
                  // Reset override colors when disabled
                  updateActiveConfig({
                    customFillColor: '',
                    customStrokeColor: '',
                    customTextColor: ''
                  });
                }
              }}
              className="rounded border-slate-800 bg-slate-950 text-cyan-500 h-4 w-4"
            />
          </div>

          {customColorsEnabled && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/40">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 mb-1">Контур</label>
                <input
                  type="color"
                  value={activeConfig.customStrokeColor || DEFAULT_COLORS[activeConfig.affiliation]?.stroke || '#3b82f6'}
                  onChange={(e) => updateActiveConfig({ customStrokeColor: e.target.value })}
                  className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-slate-400 mb-1">Фон</label>
                <input
                  type="color"
                  value={activeConfig.customFillColor || DEFAULT_COLORS[activeConfig.affiliation]?.fill || '#1e3a8a'}
                  onChange={(e) => updateActiveConfig({ customFillColor: e.target.value })}
                  className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-slate-400 mb-1">Текст</label>
                <input
                  type="color"
                  value={activeConfig.customTextColor || '#ffffff'}
                  onChange={(e) => updateActiveConfig({ customTextColor: e.target.value })}
                  className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 9. PRESETS AND TEMPLATES */}
        <div className="space-y-3 bg-slate-950/60 p-3 rounded border border-slate-800">
          <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">Быстрые шаблоны пресетов</div>
          
          <form onSubmit={handleSaveToPresets} className="flex gap-1">
            <input
              type="text"
              placeholder="Создать из текущего..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 px-2.5 bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 rounded text-xs font-bold font-mono transition"
            >
              ОК
            </button>
          </form>

          {presets.length === 0 ? (
            <div className="font-mono text-[10px] text-slate-500 text-center py-2">
              Сохраненных пресетов пока нет
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className="group flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-805 text-left transition"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSquad) {
                        onUpdateSquad(selectedSquad.id, { config: preset.config });
                      } else {
                        setDraftConfig(preset.config);
                      }
                    }}
                    className="flex-1 text-[11px] font-mono text-slate-300 group-hover:text-cyan-400 font-medium truncate text-left"
                    title={`Применить пресет "${preset.name}"`}
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePreset(preset.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
