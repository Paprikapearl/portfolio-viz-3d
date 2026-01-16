/**
 * Type definitions for the unified particle visualization system
 *
 * Particles represent individual assets that flow between formations:
 * - Galaxy (Level 1): Asset class clusters
 * - Globe (Level 2): Geographic positions
 * - Nebula (Level 3): Instrument detail cloud
 */

import type { DataNode } from './data';

/**
 * Geographic coordinates for positioning particles on the globe
 */
export interface LatLong {
  lat: number;  // Latitude in degrees (-90 to 90)
  long: number; // Longitude in degrees (-180 to 180)
}

/**
 * Geographic region identifier
 */
export type GeographicRegion =
  | 'north-america'
  | 'europe'
  | 'asia'
  | 'emerging-markets'
  | 'global'       // For non-geographic assets (bonds, alternatives)
  | 'unknown';

/**
 * Asset class identifier for galaxy clustering
 */
export type AssetClassType =
  | 'equities'
  | 'fixed-income'
  | 'alternatives';

/**
 * Formation types for particle positioning
 */
export type FormationType =
  | 'galaxy'    // Level 1: Three galaxy clusters by asset class
  | 'globe'     // Level 2: Geographic positioning
  | 'nebula'    // Level 3: Spread cloud for instrument detail
  | 'exploded'; // Level 4: Transitioning to bar contribution view

/**
 * Individual particle data
 */
export interface Particle {
  id: string;
  nodeId: string;              // Reference to the DataNode
  label: string;
  shortLabel: string;
  value: number;               // Return value (affects Y position in nebula)
  weight: number;              // Portfolio weight (affects particle size)

  // Hierarchical context
  assetClass: AssetClassType;
  region: GeographicRegion;
  latLong: LatLong;

  // Visual properties
  color: string;               // Particle color
  size: number;                // Computed from weight
  glowIntensity: number;       // 0-1, for highlighting

  // Current state
  currentPosition: [number, number, number];
  targetPosition: [number, number, number];

  // Animation
  velocity: [number, number, number];

  // Reference to full node
  node: DataNode;
}

/**
 * Galaxy formation configuration
 */
export interface GalaxyConfig {
  center: [number, number, number];
  radius: number;
  armCount: number;
  armSpread: number;
  rotationSpeed: number;
}

/**
 * Globe formation configuration
 */
export interface GlobeConfig {
  center: [number, number, number];
  radius: number;
  rotationSpeed: number;
}

/**
 * Nebula formation configuration
 */
export interface NebulaConfig {
  center: [number, number, number];
  spread: [number, number, number];  // X, Y, Z spread
  yAxisMetric: 'value' | 'weight';   // What determines Y position
}

/**
 * Formation state for transitions
 */
export interface FormationState {
  currentFormation: FormationType;
  targetFormation: FormationType;
  transitionProgress: number;  // 0 = current, 1 = target
  isTransitioning: boolean;

  // Galaxy-specific state
  selectedGalaxy: AssetClassType | null;

  // Globe-specific state
  selectedRegion: GeographicRegion | null;
  isUnfolding: boolean;        // Van der Grinten IV unfolding
  unfoldProgress: number;      // 0 = sphere, 1 = flat projection

  // Nebula-specific state
  selectedParticleId: string | null;
}

/**
 * Camera positions for each formation
 */
export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/**
 * Default camera positions for formations
 */
export const FORMATION_CAMERAS: Record<FormationType, CameraTarget> = {
  galaxy: { position: [0, 3, 15], lookAt: [0, 1, 0] },
  globe: { position: [0, 2, 8], lookAt: [0, 0, 0] },
  nebula: { position: [2, 1, 6], lookAt: [2, 0, 0] },
  exploded: { position: [0, 2.5, 7], lookAt: [0, 2.5, 0] },
};

/**
 * Default galaxy configurations for each asset class
 */
export const GALAXY_CONFIGS: Record<AssetClassType, GalaxyConfig> = {
  equities: {
    center: [-3, 1.5, 0],
    radius: 2.5,
    armCount: 3,
    armSpread: 0.8,
    rotationSpeed: 0.05,
  },
  'fixed-income': {
    center: [3, 1.5, 0],
    radius: 1.8,
    armCount: 2,
    armSpread: 0.6,
    rotationSpeed: 0.03,
  },
  alternatives: {
    center: [0, 0.5, -2],
    radius: 1.2,
    armCount: 2,
    armSpread: 0.5,
    rotationSpeed: 0.04,
  },
};

/**
 * Default globe configuration
 */
export const GLOBE_CONFIG: GlobeConfig = {
  center: [0, 1.5, 0],
  radius: 2.5,
  rotationSpeed: 0.01,
};

/**
 * Default nebula configuration
 */
export const NEBULA_CONFIG: NebulaConfig = {
  center: [0, 1.5, 0],
  spread: [4, 3, 2],
  yAxisMetric: 'value',
};

/**
 * Geographic center coordinates for regions
 */
export const REGION_COORDINATES: Record<GeographicRegion, LatLong> = {
  'north-america': { lat: 40, long: -100 },
  'europe': { lat: 50, long: 10 },
  'asia': { lat: 35, long: 120 },
  'emerging-markets': { lat: -15, long: 30 },
  'global': { lat: 0, long: 0 },
  'unknown': { lat: 0, long: 0 },
};

/**
 * Color palettes for asset classes
 */
export const ASSET_CLASS_COLORS: Record<AssetClassType, string[]> = {
  equities: ['#f97316', '#fb923c', '#fdba74', '#fed7aa'], // Warm oranges
  'fixed-income': ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'], // Cool blues
  alternatives: ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'], // Purples
};

/**
 * Particle size range based on weight
 */
export const PARTICLE_SIZE = {
  min: 0.08,
  max: 0.35,
};

/**
 * Animation durations in milliseconds
 */
export const TRANSITION_DURATIONS = {
  portfolioToGalaxy: 2000,
  galaxyToGlobe: 1500,
  globeToNebula: 2500,
  nebulaToExploded: 1200,
};
