/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Affiliation = 'friendly' | 'hostile' | 'neutral' | 'unknown' | 'custom';

export type RoleSymbol = 
  | 'infantry' 
  | 'armor' 
  | 'artillery' 
  | 'mechanized' 
  | 'recon' 
  | 'airborne' 
  | 'engineer' 
  | 'signal' 
  | 'medical' 
  | 'uav' 
  | 'hq'
  | 'custom-label';

export type Echelon = 
  | 'none'
  | 'team'       // ∅
  | 'squad'      // ●
  | 'section'    // ●●
  | 'platoon'    // ●●●
  | 'company'    // I
  | 'battalion'  // II
  | 'regiment'   // III
  | 'brigade'    // X
  | 'division'   // XX
  | 'corps'      // XXX
  | 'army';      // XXXX

export interface SquadIconConfig {
  affiliation: Affiliation;
  role: RoleSymbol;
  echelon: Echelon;
  
  // Custom text attributes
  designation: string; // Left/Right label or main identifier (e.g. "3 Bn", "1/4")
  speed: string;       // e.g. "25 km/h"
  strength: string;    // e.g. "90%" or "12 vehicles"
  extraLabel: string;  // Top/bottom identifier text
  
  // Custom Visuals
  size: number;            // Icon dimension in px (32 to 80)
  customFillColor: string; // Hex color overrides
  customStrokeColor: string;
  customTextColor: string;
  hasFill: boolean;
  hasGlow: boolean;        // Selected/High alert status
  rotation: number;        // Facing angle (0 - 359)
  showRotationArrow: boolean;
  status: 'active' | 'alert' | 'damaged' | 'lost'; // Status effect
  
  // Custom Shape/Icon overrides
  frameShape?: 'auto' | 'rectangle' | 'diamond' | 'square' | 'circle' | 'shield' | 'none';
  customIconType?: 'standard' | 'emoji' | 'url';
  customIconValue?: string; // Contains URL link or Emoji string
  
  // Custom Outline / Branch label properties
  customStrokeWidth?: number;
  customStrokeDash?: 'solid' | 'dashed' | 'dotted' | 'double' | 'dash-dot' | 'long-dash';
  showRoleLabelAbove?: boolean;
}

export interface SquadMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  config: SquadIconConfig;
  layerId: string;
  notes?: string;
  updatedAt: string;
}

export interface TacticalShape {
  id: string;
  type: 'polyline' | 'polygon' | 'circle' | 'rectangle' | 'marker' | 'text';
  coordinates: any; // Leaflet coordinates state (JSON)
  style: {
    color: string;
    fillColor: string;
    weight: number;
    opacity: number;
    fillOpacity: number;
    dashArray: string;
  };
  name: string;
  layerId: string;
  notes?: string;
}

export interface TacticalLayer {
  id: string;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
}

export interface TacticalPreset {
  id: string;
  name: string;
  config: SquadIconConfig;
}

export interface MapPreferences {
  tileProvider: 'osm' | 'satellite' | 'dark' | 'terrain' | 'topo' | 'light' | 'voyager' | 'grey';
  showGrid: boolean; // overlay for coordinate grid
  gridType: 'mgrs' | 'degrees';
  centerLatitude: number;
  centerLongitude: number;
  zoom: number;
}
