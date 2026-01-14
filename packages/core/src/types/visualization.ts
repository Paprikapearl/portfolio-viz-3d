/**
 * Visualization configuration interfaces
 */

export type GeometryType = 'rings' | 'bars' | 'hybrid';
export type EasingType = 'easeInOut' | 'easeOut' | 'spring' | 'bounce';
export type ColorScaleType = 'sequential' | 'diverging' | 'categorical';
export type ColorPreset = 'viridis' | 'plasma' | 'rdylgn' | 'spectral' | 'blues';

/**
 * Spring physics configuration for react-spring
 */
export interface SpringConfig {
  mass: number;
  tension: number;
  friction: number;
}

/**
 * Layout configuration for positioning nodes
 */
export interface LayoutConfig {
  // Ring/cylinder layout
  ringInnerRadius: number;
  ringOuterRadius: number;
  ringSpacing: number;
  stackDirection: 'vertical' | 'radial';

  // Bar chart layout
  barWidth: number;
  barSpacing: number;
  barGroupSpacing: number;

  // Exploded view
  explodeDistance: number;
  explodeSpread: number;  // Angular spread in radians
}

/**
 * Color scale configuration
 */
export interface ColorScaleConfig {
  type: ColorScaleType;
  domain?: [number, number];     // Auto-calculated if not provided
  colors?: string[];             // Custom color palette
  preset?: ColorPreset;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  enabled: boolean;
  duration: number;              // milliseconds
  easing: EasingType;
  stagger: number;               // Stagger delay between elements in ms
  springConfig: SpringConfig;
}

/**
 * Interaction configuration
 */
export interface InteractionConfig {
  clickToExpand: boolean;
  hoverHighlight: boolean;
  zoomOnSelect: boolean;
  panEnabled: boolean;
  rotateEnabled: boolean;
}

/**
 * Label and tooltip configuration
 */
export interface LabelConfig {
  showLabels: boolean;
  labelSize: number;
  labelOffset: number;
  tooltipEnabled: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}

/**
 * Main visualization configuration with sensible defaults
 */
export interface VisualizationConfig {
  geometryType: GeometryType;
  layout: LayoutConfig;
  colorScale: ColorScaleConfig;
  animation: AnimationConfig;
  interaction: InteractionConfig;
  labeling: LabelConfig;
}

/**
 * Default configuration values
 */
export const defaultConfig: VisualizationConfig = {
  geometryType: 'bars',

  layout: {
    ringInnerRadius: 0.5,
    ringOuterRadius: 2,
    ringSpacing: 0.3,
    stackDirection: 'vertical',
    barWidth: 0.3,
    barSpacing: 0.5,
    barGroupSpacing: 0.5,
    explodeDistance: 2.5,
    explodeSpread: Math.PI * 1.5,
  },

  colorScale: {
    type: 'diverging',
    preset: 'rdylgn',
  },

  animation: {
    enabled: true,
    duration: 180,
    easing: 'easeOut',
    stagger: 0,  // No stagger - all children animate together
    springConfig: {
      mass: 1,
      tension: 300,
      friction: 30,
    },
  },

  interaction: {
    clickToExpand: true,
    hoverHighlight: true,
    zoomOnSelect: false,
    panEnabled: true,
    rotateEnabled: true,
  },

  labeling: {
    showLabels: true,
    labelSize: 0.15,
    labelOffset: 0.5,
    tooltipEnabled: true,
  },
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  defaults: VisualizationConfig,
  overrides?: Partial<VisualizationConfig>
): VisualizationConfig {
  if (!overrides) return defaults;

  return {
    geometryType: overrides.geometryType ?? defaults.geometryType,
    layout: { ...defaults.layout, ...overrides.layout },
    colorScale: { ...defaults.colorScale, ...overrides.colorScale },
    animation: { ...defaults.animation, ...overrides.animation },
    interaction: { ...defaults.interaction, ...overrides.interaction },
    labeling: { ...defaults.labeling, ...overrides.labeling },
  };
}
