/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SquadIconConfig } from '../types';

// Standard NATO APP-6 Color Palette with high-readability night/tactical adjustments
export const DEFAULT_COLORS = {
  friendly: {
    fill: '#1e3a8a',      // Darker rich blue
    stroke: '#3b82f6',    // Neon blue outline
    text: '#ffffff',      // White
    glow: '#3b82f6',
  },
  hostile: {
    fill: '#7f1d1d',      // Darker tactical red
    stroke: '#ef4444',    // Neon red outline
    text: '#ffffff',
    glow: '#ef4444',
  },
  neutral: {
    fill: '#064e3b',      // Darker forest green
    stroke: '#22c55e',    // Neon green outline
    text: '#ffffff',
    glow: '#22c55e',
  },
  unknown: {
    fill: '#713f12',      // Dark amber / yellow
    stroke: '#eab308',    // Bright yellow outline
    text: '#ffffff',
    glow: '#eab308',
  },
  custom: {
    fill: '#1e293b',      // Dark slate
    stroke: '#94a3b8',    // Cyan/Slate
    text: '#ffffff',
    glow: '#94a3b8',
  }
};

const ROLE_NAMES_RU: Record<string, string> = {
  infantry: 'ПЕХОТА',
  armor: 'ТАНКИ',
  mechanized: 'МОТОПЕХ',
  recon: 'РАЗВЕДКА',
  artillery: 'АРТ',
  airborne: 'ВДВ',
  engineer: 'ИНЖЕНЕРЫ',
  signal: 'СВЯЗЬ',
  medical: 'МЕДИКИ',
  uav: 'БПЛА',
  hq: 'ШТАБ',
  'custom-label': 'НАТО'
};

/**
 * Generates highly polished SVG code representing a tactical squad.
 */
export function renderSquadSVG(config: SquadIconConfig, isSelected: boolean = false): string {
  const {
    affiliation,
    role,
    echelon,
    designation,
    speed,
    strength,
    extraLabel,
    size = 48,
    customFillColor,
    customStrokeColor,
    customTextColor,
    hasFill = true,
    hasGlow = false,
    rotation = 0,
    showRotationArrow = false,
    status = 'active',
    frameShape = 'auto',
    customIconType = 'standard',
    customIconValue = '',
    customStrokeWidth = 4.5,
    customStrokeDash = 'solid',
    showRoleLabelAbove = false
  } = config;

  // Decide colors
  const defaultPalette = DEFAULT_COLORS[affiliation] || DEFAULT_COLORS.friendly;
  const fillColor = customFillColor && customFillColor !== '' ? customFillColor : defaultPalette.fill;
  const strokeColor = customStrokeColor && customStrokeColor !== '' ? customStrokeColor : defaultPalette.stroke;
  const textColor = customTextColor && customTextColor !== '' ? customTextColor : defaultPalette.text;
  const glowThemeColor = defaultPalette.glow;

  // Determine border override styles
  let strokeDashArray = '';
  if (customStrokeDash === 'dashed') {
    strokeDashArray = '6,4';
  } else if (customStrokeDash === 'dotted') {
    strokeDashArray = '2,3';
  } else if (customStrokeDash === 'dash-dot') {
    strokeDashArray = '10,3,2,3';
  } else if (customStrokeDash === 'long-dash') {
    strokeDashArray = '16,6';
  }

  // Render SVG attributes
  const viewBoxSize = 100; // Constant local coordinate system for easier math
  const center = viewBoxSize / 2;

  // 1. Frame Path definition
  let framePath = '';
  let clipPath = ''; // For bounding inner shapes
  
  // Choose shape override or fallback to affiliation representation
  const activeShape = frameShape !== 'auto' ? frameShape : affiliation;
  
  switch (activeShape) {
    case 'friendly':
    case 'rectangle':
      // Horizontal rectangle
      framePath = `M 22 30 L 78 30 L 78 70 L 22 70 Z`;
      clipPath = `<rect x="22" y="30" width="56" height="40" />`;
      break;
    case 'hostile':
    case 'diamond':
      // Diamond
      framePath = `M 50 18 L 82 50 L 50 82 L 18 50 Z`;
      clipPath = `<polygon points="50,18  82,50  50,82  18,50" />`;
      break;
    case 'neutral':
    case 'square':
      // Square
      framePath = `M 26 26 L 74 26 L 74 74 L 26 74 Z`;
      clipPath = `<rect x="26" y="26" width="48" height="48" />`;
      break;
    case 'circle':
      // Circle shape
      framePath = `M 50 24 A 26 26 0 1 1 49.9 24 Z`;
      clipPath = `<circle cx="50" cy="50" r="26" />`;
      break;
    case 'shield':
    case 'custom':
      // Octagon / Shield style
      framePath = `M 32 20 L 68 20 L 82 45 L 68 80 L 32 80 L 18 45 Z`;
      clipPath = `<polygon points="32,20  68,20  82,45  68,80  32,80  18,45" />`;
      break;
    case 'unknown':
      // Clover-like frame / Rounded Squarish
      framePath = `M 50 20 C 65 20, 80 25, 80 50 C 80 75, 65 80, 50 80 C 35 80, 20 75, 20 50 C 20 25, 35 20, 50 20 Z`;
      clipPath = `<path d="M 50 20 C 65 20, 80 25, 80 50 C 80 75, 65 80, 50 80 C 35 80, 20 75, 20 50 C 20 25, 35 20, 50 20 Z" />`;
      break;
    case 'none':
    default:
      // Frameless/bare structure - clip using standard middle zone but frame remains empty
      framePath = ``;
      clipPath = `<rect x="20" y="20" width="60" height="60" />`;
      break;
  }

  // 2. Role icon inner SVG
  let innerIcon = '';

  if (customIconType === 'emoji' && customIconValue) {
    innerIcon = `
      <text x="50" y="52" font-size="28" text-anchor="middle" dominant-baseline="middle">
        ${customIconValue}
      </text>
    `;
  } else if (customIconType === 'url' && customIconValue) {
    innerIcon = `
      <image href="${customIconValue}" x="28" y="28" width="44" height="44" preserveAspectRatio="xMidYMid meet" />
    `;
  } else {
    switch (role) {
      case 'infantry':
        innerIcon = `<path d="M 20 20 L 80 80 M 80 20 L 20 80" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" />`;
        break;
      case 'armor':
        // Standard tank track oval
        innerIcon = `<rect x="28" y="40" width="44" height="20" rx="10" stroke="${strokeColor}" stroke-dasharray="2,2" stroke-width="3.5" fill="none" />`;
        break;
      case 'artillery':
        // Dot in center
        innerIcon = `<circle cx="50" cy="50" r="6" fill="${strokeColor}" />`;
        break;
      case 'mechanized':
        // Oval with infantry X
        innerIcon = `
          <rect x="28" y="40" width="44" height="20" rx="10" stroke="${strokeColor}" stroke-dasharray="2,2" stroke-width="2" fill="none" />
          <path d="M 33 42 L 67 58 M 67 42 L 33 58" stroke="${strokeColor}" stroke-width="2" />
        `;
        break;
      case 'recon':
        // Diagonal sash
        innerIcon = `<path d="M 20 80 L 80 20" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" />`;
        break;
      case 'airborne':
        // Wing / parabolic curve pointing down
        innerIcon = `
          <path d="M 30 40 Q 50 65 70 40 M 35 48 H 65 M 42 55 H 58" stroke="${strokeColor}" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <circle cx="50" cy="40" r="2.5" fill="${strokeColor}" />
        `;
        break;
      case 'engineer':
        // Castle wall profile / Double gate
        innerIcon = `
          <path d="M 32 60 V 40 H 40 V 48 H 45 V 40 H 55 V 48 H 60 V 40 H 68 V 60 Z" stroke="${strokeColor}" stroke-width="2.5" fill="none" stroke-linejoin="round" />
        `;
        break;
      case 'signal':
        // Lightning bolt icon
        innerIcon = `
          <path d="M 58 32 L 35 53 H 48 L 42 68 L 65 47 H 51 Z" fill="${strokeColor}" stroke="${strokeColor}" stroke-width="1.5" />
        `;
        break;
      case 'medical':
        // Cross
        innerIcon = `
          <path d="M 50 35 V 65 M 35 50 H 65" stroke="${strokeColor}" stroke-width="6" stroke-linecap="round" />
        `;
        break;
      case 'uav':
        // Triangle / Delta wing
        innerIcon = `
          <polygon points="50,34  70,58  50,51  30,58" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round" />
          <line x1="50" y1="34" x2="50" y2="51" stroke="${strokeColor}" stroke-width="2" />
        `;
        break;
      case 'hq':
        // Flagpole line on the left and full solid filled inner corner
        innerIcon = `
          <line x1="30" y1="25" x2="30" y2="75" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" />
          <polygon points="30,28  55,38  30,48" fill="${strokeColor}" />
        `;
        break;
      case 'custom-label':
        // Render clean text instead
        const labelShort = designation ? designation.substring(0, 3).toUpperCase() : 'HQ';
        innerIcon = `
          <text x="50" y="56" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="${textColor}" text-anchor="middle" letter-spacing="-0.5">
            ${labelShort}
          </text>
        `;
        break;
      default:
        innerIcon = ``;
    }
  }

  // 3. Echelon (Size Indicator) Top Symbols
  let echelonSVG = '';
  // Height position for echelon symbols (typically centered right above the top boundary of each frame)
  let echY = 22;
  switch (affiliation) {
    case 'friendly': echY = 25; break;
    case 'neutral': echY = 21; break;
    case 'hostile': echY = 13; break;
    case 'unknown': echY = 15; break;
    case 'custom': echY = 15; break;
  }

  const dotGroup = (cxList: number[], r: number = 2.5) => 
    cxList.map(cx => `<circle cx="${cx}" cy="${echY}" r="${r}" fill="${strokeColor}" stroke="none" />`).join('');

  const verticalLineGroup = (cxList: number[], h: number = 7) =>
    cxList.map(cx => `<line x1="${cx}" y1="${echY - h/2}" x2="${cx}" y2="${echY + h/2}" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />`).join('');

  switch (echelon) {
    case 'team':
      // Circle with a diagonal slash through it
      echelonSVG = `
        <circle cx="50" cy="${echY}" r="3.5" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <line x1="47" y1="${echY + 3}" x2="53" y2="${echY - 3}" stroke="${strokeColor}" stroke-width="1.8" />
      `;
      break;
    case 'squad': // ●
      echelonSVG = dotGroup([50]);
      break;
    case 'section': // ●●
      echelonSVG = dotGroup([45, 55]);
      break;
    case 'platoon': // ●●●
      echelonSVG = dotGroup([39, 50, 61]);
      break;
    case 'company': // I
      echelonSVG = verticalLineGroup([50]);
      break;
    case 'battalion': // II
      echelonSVG = verticalLineGroup([46, 54]);
      break;
    case 'regiment': // III
      echelonSVG = verticalLineGroup([42, 50, 58]);
      break;
    case 'brigade': // X
      echelonSVG = `
        <path d="M 46 ${echY - 4.5} L 54 ${echY + 4.5} M 54 ${echY - 4.5} L 46 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
      `;
      break;
    case 'division': // XX
      echelonSVG = `
        <path d="M 41 ${echY - 4.5} L 49 ${echY + 4.5} M 49 ${echY - 4.5} L 41 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.3" stroke-linecap="round" />
        <path d="M 51 ${echY - 4.5} L 59 ${echY + 4.5} M 59 ${echY - 4.5} L 51 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.3" stroke-linecap="round" />
      `;
      break;
    case 'corps': // XXX
      echelonSVG = `
        <path d="M 36 ${echY - 4.5} L 44 ${echY + 4.5} M 44 ${echY - 4.5} L 36 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 46 ${echY - 4.5} L 54 ${echY + 4.5} M 54 ${echY - 4.5} L 46 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 56 ${echY - 4.5} L 64 ${echY + 4.5} M 64 ${echY - 4.5} L 56 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
      `;
      break;
    case 'army': // XXXX
      echelonSVG = `
        <path d="M 31 ${echY - 4.5} L 39 ${echY + 4.5} M 39 ${echY - 4.5} L 31 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 41 ${echY - 4.5} L 49 ${echY + 4.5} M 49 ${echY - 4.5} L 41 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 51 ${echY - 4.5} L 59 ${echY + 4.5} M 59 ${echY - 4.5} L 51 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 61 ${echY - 4.5} L 69 ${echY + 4.5} M 69 ${echY - 4.5} L 61 ${echY + 4.5}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
      `;
      break;
    case 'none':
    default:
      echelonSVG = '';
  }

  // 4. Custom status decorations (damaged, lost, alert, healthy)
  let statusOverlay = '';
  switch (status) {
    case 'lost':
      // Huge diagonal red/orange slash across
      statusOverlay = `<line x1="15" y1="15" x2="85" y2="85" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />`;
      break;
    case 'damaged':
      // Red dashed overlay or slice
      statusOverlay = `<rect x="15" y="15" width="70" height="70" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3,3" fill="none" opacity="0.6" pointer-events="none" />`;
      break;
    case 'alert':
      // Pulsing outer glow handled in container css, but let's add a neat warning badge
      statusOverlay = `<circle cx="82" cy="18" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
                       <path d="M 82 15 V 19 M 82 21 H 82.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" />`;
      break;
    default:
      break;
  }

  // Glow filters
  const selectedFilter = isSelected || hasGlow
    ? `filter="url(#glow-filter-${strokeColor.replace('#', '')})"`
    : '';

  const dropShadowStr = `<filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
    <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6"/>
  </filter>`;

  const glowFilterStr = `<filter id="glow-filter-${strokeColor.replace('#', '')}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="3.5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>`;

  // 5. Rotation pointer layer (points to rotational bearing outside the frame border)
  let rotationSVG = '';
  if (showRotationArrow) {
    // We want a line pointing from center (50, 50) of length 48, heading 'rotation' degrees.
    // In CSS, we will just rotate the entire rotation pointer group around center (50, 50).
    rotationSVG = `
      <g transform="rotate(${rotation}, 50, 50)">
        <!-- Stronger dashed feedback line pointing way out -->
        <line x1="50" y1="50" x2="50" y2="-2" stroke="${strokeColor}" stroke-width="${Math.max(3.5, customStrokeWidth)}" stroke-dasharray="4,2" stroke-linecap="round" filter="url(#shadow)" />
        <!-- Larger, more prominent military directional arrowhead -->
        <polygon points="50,-16 63,4 37,4" fill="${strokeColor}" stroke="#10172a" stroke-width="1.5" stroke-linejoin="round" filter="url(#shadow)" />
      </g>
    `;
  }

  // 6. Lateral Metadata Text (Military-like data readout placement)
  // Left Label = Designation, Right Label = Strength, Bottom Label = Speed / Extra text
  const metadataTexts = [];
  
  if (designation && designation.trim() !== '' && role !== 'custom-label') { // skip designation overlap
    metadataTexts.push(`
      <text x="12" y="52" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="bold" fill="${strokeColor}" text-anchor="end" filter="url(#shadow)">
        ${designation}
      </text>
    `);
  }
  
  if (strength && strength.trim() !== '') {
    metadataTexts.push(`
      <text x="88" y="52" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="bold" fill="${textColor}" text-anchor="start" filter="url(#shadow)">
        ${strength}
      </text>
    `);
  }

  if (speed && speed.trim() !== '') {
    metadataTexts.push(`
      <text x="50" y="93" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#94a3b8" text-anchor="middle" filter="url(#shadow)">
        ${speed}
      </text>
    `);
  }

  if (extraLabel && extraLabel.trim() !== '') {
    metadataTexts.push(`
      <text x="50" y="8" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" letter-spacing="0.5" filter="url(#shadow)">
        ${extraLabel.substring(0, 16)}
      </text>
    `);
  }

  if (showRoleLabelAbove && role) {
    const roleText = ROLE_NAMES_RU[role] || (role as string).toUpperCase();
    metadataTexts.push(`
      <g filter="url(#shadow)">
        <!-- Background fills with faction side color, border outline in neon accent -->
        <rect x="${50 - (roleText.length * 3.5) - 4}" y="-13" width="${(roleText.length * 7) + 8}" height="11" rx="2" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.2" opacity="0.95" />
        <text x="50" y="-5" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="800" fill="${textColor}" text-anchor="middle" letter-spacing="0.5">
          ${roleText}
        </text>
      </g>
    `);
  }

  // Combine entire graphic
  const finalSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="overflow: visible; cursor: pointer;">
      <defs>
        ${dropShadowStr}
        ${glowFilterStr}
      </defs>
      
      <!-- Optional Compass / Rotation Guideline -->
      ${rotationSVG}
      
      <!-- Outer Selection Indicator Highlight -->
      ${isSelected ? `<path d="${framePath}" fill="none" stroke="#22d3ee" stroke-width="8" opacity="0.4" filter="url(#shadow)" />` : ''}

      <!-- Main Frame with custom styling -->
      <g ${selectedFilter}>
        <g filter="url(#shadow)">
          <!-- Frame background fill -->
          ${hasFill ? `<path d="${framePath}" fill="${fillColor}" opacity="0.85" />` : ''}
          
          <!-- Frame stroke outline with fully customizable weight and pattern -->
          ${customStrokeDash === 'double' ? `
            <path d="${framePath}" fill="none" stroke="${strokeColor}" stroke-width="${Number(customStrokeWidth) + 3}" stroke-linejoin="miter" stroke-linecap="square" />
            <path d="${framePath}" fill="none" stroke="${hasFill ? fillColor : '#0f172a'}" stroke-width="${Number(customStrokeWidth) + 0.5}" stroke-linejoin="miter" stroke-linecap="square" />
            <path d="${framePath}" fill="none" stroke="${strokeColor}" stroke-width="${Math.max(1, Number(customStrokeWidth) - 1.5)}" stroke-linejoin="miter" stroke-linecap="square" />
          ` : `
            <path d="${framePath}" fill="none" stroke="${strokeColor}" stroke-width="${customStrokeWidth}" ${strokeDashArray ? `stroke-dasharray="${strokeDashArray}"` : ''} stroke-linejoin="miter" stroke-linecap="square" />
          `}
        </g>
      </g>
      
      <!-- Inner symbols clipped inside the military border layout -->
      <g>
        <g clip-path="url(#inner-clip)">
          <!-- Render core role vector -->
          ${innerIcon}
        </g>
      </g>
      
      <!-- Size/Echelon Indicators -->
      <g filter="url(#shadow)">
        ${echelonSVG}
      </g>
      
      <!-- Status Badge overlays -->
      ${statusOverlay}

      <!-- Labels (Designation, Strength, branch role Above badge, etc.) -->
      ${metadataTexts.join('')}
    </svg>
  `;

  return finalSVG.trim();
}
