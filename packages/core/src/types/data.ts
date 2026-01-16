/**
 * Data model for hierarchical portfolio visualization
 *
 * Structure:
 * Portfolio → Asset Class → Region → Asset → Return Components
 */

import type { GeographicRegion, LatLong, AssetClassType } from './particle';

export interface DataNode {
  id: string;
  label: string;
  shortLabel?: string;  // For compact display
  value: number;        // Primary metric (expected return)
  weight?: number;      // Portfolio weight (0-1)
  children?: DataNode[];
  metadata?: Record<string, unknown>;

  // Geographic data for particle visualization
  region?: GeographicRegion;
  latLong?: LatLong;
  assetClassType?: AssetClassType;
}

/**
 * Portfolio with full hierarchy
 */
export interface Portfolio extends DataNode {
  children: AssetClass[];
}

export interface AssetClass extends DataNode {
  children?: Region[];
}

export interface Region extends DataNode {
  children?: Asset[];
}

export interface Asset extends DataNode {
  ticker?: string;
  children?: ReturnComponent[];
}

export interface ReturnComponent extends DataNode {
  componentType: 'equilibrium' | 'views' | 'factor';
}

/**
 * Hierarchy level names (configurable)
 */
export type LevelName = string;

export interface HierarchyConfig {
  levels: LevelName[];  // e.g., ['Portfolio', 'Asset Class', 'Region', 'Asset', 'Component']
}

export const defaultHierarchyConfig: HierarchyConfig = {
  levels: ['Portfolio', 'Asset Class', 'Market', 'Instrument', 'Contribution'],
};
