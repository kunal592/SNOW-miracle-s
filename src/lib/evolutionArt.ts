import { CharacterArchetype, CharacterArtStyle } from '../types';

interface ArtConfig {
  primaryGradient: [string, string];
  accentColor: string;
  glowColor: string;
  badgeSymbol: string;
  iconPath: string;
  runeSymbols: string[];
}

const ARCHETYPE_CONFIGS: Record<CharacterArchetype, ArtConfig> = {
  Strategist: {
    primaryGradient: ['#3b82f6', '#8b5cf6'],
    accentColor: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    badgeSymbol: '♟',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    runeSymbols: ['◈', '⬡', '▲', '⬢', '◇']
  },
  Warrior: {
    primaryGradient: ['#ef4444', '#f97316'],
    accentColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    badgeSymbol: '⚔',
    iconPath: 'M14.5 4l5.5 5.5-9 9-5.5-5.5 9-9zM3 21l3-3',
    runeSymbols: ['⚡', '⚔', '✦', '▲', '🔥']
  },
  Scholar: {
    primaryGradient: ['#10b981', '#06b6d4'],
    accentColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badgeSymbol: '📖',
    iconPath: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z',
    runeSymbols: ['∞', 'ψ', 'λ', 'Ω', 'π']
  },
  Explorer: {
    primaryGradient: ['#f59e0b', '#10b981'],
    accentColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badgeSymbol: '🧭',
    iconPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.6 6.4l-2 5.6-5.6 2 2-5.6 5.6-2z',
    runeSymbols: ['✦', '✶', '✧', '✹', '✪']
  },
  Engineer: {
    primaryGradient: ['#06b6d4', '#3b82f6'],
    accentColor: '#38bdf8',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    badgeSymbol: '⚙',
    iconPath: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-8a1 1 0 0 1 1-1h1l.3 1.2a6 6 0 0 1 1.5.9l1.1-.6 1 1-.6 1.1c.3.5.6 1 .9 1.5l1.2.3v1a1 1 0 0 1-1 1l-1.2.3c-.3.5-.6 1-.9 1.5l.6 1.1-1 1-1.1-.6a6 6 0 0 1-1.5.9l-.3 1.2h-1a1 1 0 0 1-1-1l-.3-1.2a6 6 0 0 1-1.5-.9l-1.1.6-1-1 .6-1.1c-.3-.5-.6-1-.9-1.5L4 13v-1a1 1 0 0 1 1-1l1.2-.3c.3-.5.6-1 .9-1.5l-.6-1.1 1-1 1.1.6c.5-.3 1-.6 1.5-.9L11 6h1z',
    runeSymbols: ['⚙', '⎔', '⌬', '⚡', '⌖']
  },
  Mage: {
    primaryGradient: ['#a855f7', '#ec4899'],
    accentColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    badgeSymbol: '✨',
    iconPath: 'M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9',
    runeSymbols: ['✧', '☽', '★', '✡', '✦']
  },
  Leader: {
    primaryGradient: ['#eab308', '#f97316'],
    accentColor: '#facc15',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    badgeSymbol: '👑',
    iconPath: 'M5 18h14v2H5zm0-2l-2-9 5 3 4-5 4 5 5-3-2 9z',
    runeSymbols: ['👑', '⚜', '✦', '▲', '❂']
  }
};

const STAGE_TITLES = [
  'Unknown',
  'Awakening',
  'Discipline',
  'Growth',
  'Execution',
  'Mastery'
];

/**
 * Returns a cinematic SVG data URI representing the Evolution Character
 * across stages, archetypes, and aesthetic styles.
 */
export function generateEvolutionCharacterSvg(
  archetype: CharacterArchetype = 'Strategist',
  stage: number = 3,
  style: CharacterArtStyle = 'cinematic'
): string {
  const cfg = ARCHETYPE_CONFIGS[archetype] || ARCHETYPE_CONFIGS.Strategist;
  const stageName = STAGE_TITLES[stage] || 'Growth';

  // Opacity & visual scale based on stage progression
  const auraOpacity = Math.min(0.9, 0.25 + stage * 0.15);
  const coreScale = 0.8 + stage * 0.08;
  const ringCount = Math.max(1, stage);

  // Style variations
  const isMinimal = style === 'minimal';
  const isManga = style === 'manga';
  const isAnime = style === 'anime';

  const strokeColor = isManga ? '#ffffff' : cfg.accentColor;
  const filterGlow = isMinimal ? '' : `filter="url(#glow-${archetype})"`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0807" />
        <stop offset="40%" stop-color="#14100d" />
        <stop offset="100%" stop-color="#1c1612" />
      </linearGradient>

      <linearGradient id="grad-core" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cfg.primaryGradient[0]}" />
        <stop offset="100%" stop-color="${cfg.primaryGradient[1]}" />
      </linearGradient>

      <linearGradient id="grad-silhouette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="30%" stop-color="${cfg.accentColor}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#090807" stop-opacity="0.9" />
      </linearGradient>

      <radialGradient id="aura-glow" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stop-color="${cfg.primaryGradient[0]}" stop-opacity="${auraOpacity}" />
        <stop offset="60%" stop-color="${cfg.primaryGradient[1]}" stop-opacity="${auraOpacity * 0.4}" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>

      <filter id="glow-${archetype}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Deep atmospheric backdrop -->
    <rect width="600" height="600" fill="url(#grad-bg)" />

    <!-- Ambient Cosmic Aura -->
    <circle cx="300" cy="270" r="${180 * coreScale}" fill="url(#aura-glow)" />

    <!-- Stage Geometry Rings -->
    ${Array.from({ length: ringCount })
      .map((_, i) => {
        const radius = 140 + i * 36;
        const dash = 12 + i * 8;
        return `<circle cx="300" cy="270" r="${radius}" fill="none" stroke="${strokeColor}" stroke-opacity="${
          0.15 + (i / ringCount) * 0.25
        }" stroke-width="1.5" stroke-dasharray="${dash} ${dash / 2}" ${filterGlow} />`;
      })
      .join('\n')}

    <!-- Hexagonal Matrix Grid / Halo -->
    <g transform="translate(300, 270) scale(${coreScale})" opacity="${0.4 + stage * 0.12}">
      <polygon points="0,-180 156,-90 156,90 0,180 -156,90 -156,-90" fill="none" stroke="${cfg.accentColor}" stroke-width="1.2" stroke-opacity="0.4" />
      <polygon points="0,-160 138,-80 138,80 0,160 -138,80 -138,-80" fill="none" stroke="${cfg.primaryGradient[0]}" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="8 6" />
    </g>

    <!-- Constellation Runes -->
    ${cfg.runeSymbols
      .map((rune, idx) => {
        const angle = (idx * (360 / cfg.runeSymbols.length) - 90) * (Math.PI / 180);
        const rx = 300 + Math.cos(angle) * 220;
        const ry = 270 + Math.sin(angle) * 220;
        return `<text x="${rx}" y="${ry}" fill="${cfg.accentColor}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="central" opacity="0.65">${rune}</text>`;
      })
      .join('\n')}

    <!-- Character Silhouette Body -->
    <g transform="translate(0, 0)">
      <!-- Head / Halo Aura -->
      <circle cx="300" cy="190" r="${42 * coreScale}" fill="url(#grad-core)" opacity="0.85" ${filterGlow} />

      <!-- Head Mask -->
      <path d="M 280 170 Q 300 150 320 170 Q 330 200 320 225 Q 300 240 280 225 Q 270 200 280 170 Z" fill="#0d0a08" stroke="${cfg.accentColor}" stroke-width="2" />

      <!-- Visor / Eyes Glimmer -->
      <path d="M 285 195 Q 300 190 315 195" fill="none" stroke="${cfg.accentColor}" stroke-width="3" stroke-linecap="round" ${filterGlow} />

      <!-- Cloak / Shoulders / Body Shell -->
      <path d="M 300 235 L 230 300 L 210 470 L 300 520 L 390 470 L 370 300 Z" fill="url(#grad-silhouette)" stroke="${strokeColor}" stroke-width="1.5" />

      <!-- Chest Armor Core Plate -->
      <polygon points="300,260 340,310 330,390 300,430 270,390 260,310" fill="#14100e" stroke="${cfg.accentColor}" stroke-width="2" />

      <!-- Glowing Arc Reactor / Heart Core -->
      <circle cx="300" cy="335" r="14" fill="url(#grad-core)" ${filterGlow} />
      <circle cx="300" cy="335" r="7" fill="#ffffff" />

      <!-- Cloak Trim Energy Lines -->
      <path d="M 300 430 L 300 520" stroke="${cfg.accentColor}" stroke-width="2" stroke-opacity="0.7" />
      <path d="M 270 390 L 230 470" stroke="${cfg.accentColor}" stroke-width="1.5" stroke-opacity="0.5" />
      <path d="M 330 390 L 370 470" stroke="${cfg.accentColor}" stroke-width="1.5" stroke-opacity="0.5" />
    </g>

    <!-- Bottom Stage & Archetype Banner Plaque -->
    <g transform="translate(150, 520)">
      <rect x="0" y="0" width="300" height="52" rx="16" fill="#16120f" fill-opacity="0.9" stroke="${cfg.accentColor}" stroke-width="1.5" stroke-opacity="0.4" />
      <text x="150" y="22" fill="#f4efe6" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" text-anchor="middle" letter-spacing="2">
        THE ${archetype.toUpperCase()}
      </text>
      <text x="150" y="40" fill="${cfg.accentColor}" font-family="'Outfit', sans-serif" font-weight="700" font-size="11" text-anchor="middle" letter-spacing="1.5">
        STAGE ${stage} • ${stageName.toUpperCase()}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
