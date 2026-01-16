/**
 * @portfolio-viz/core
 *
 * Cinematic 3D Portfolio Visualization
 *
 * A React Three Fiber based library for visualizing portfolio
 * hierarchies with animated drill-down navigation.
 *
 * Features:
 * - Unified particle visualization (galaxies, globe, nebula)
 * - Traditional bar-based visualization
 * - Smooth camera transitions
 * - Interactive drill-down navigation
 */

// Main components
export { Stage } from './components/Stage';
export { Bar3D, type BarOrientation } from './components/Bar3D';
export { SelectionView } from './components/SelectionView';
export { Breadcrumbs } from './components/Breadcrumbs';
export { ExplodedInstrumentView } from './components/ExplodedInstrumentView';

// Particle visualization components
export { ParticleSystem, ParticleSystemInstanced } from './components/ParticleSystem';
export { ParticleVisualization } from './components/ParticleVisualization';
export { ContinentOutlines } from './components/ContinentOutlines';

// Navigation store
export {
  useNavigationStore,
  useCurrentNodes,
  useSelectionPath,
  useCurrentLevel,
  useAnimationPhase,
  useViewMode,
  useExplodedInstrumentId,
  useContributionSpacing,
  useSelectedContributionId,
  useFocusedNodeIndex,
  useCarouselOffset,
  useVisualizationMode,
  type VisualizationMode,
} from './store';

// Particle store
export {
  useParticleStore,
  useParticles,
  useFormationState,
  useAnimationTime,
  useHoveredParticleId,
  getTransitionDuration,
} from './store/particleStore';

// Formations
export {
  calculateGalaxyFormation,
  calculateExplosionToGalaxy,
  getGalaxyCenter,
} from './formations/GalaxyFormation';
export {
  calculateGlobeFormation,
  calculateGalaxyToGlobe,
  calculateGlobeUnfolding,
  getRegionCenter,
} from './formations/GlobeFormation';
export {
  calculateNebulaFormation,
  calculateGlobeToNebula,
  calculateParticlePullOut,
} from './formations/NebulaFormation';

// Projections
export {
  vanDerGrinten4,
  latLongToSphere,
  interpolateSphereToProjection,
} from './projections/VanDerGrinten4';

// World data
export { continents, generateGraticule } from './data/worldSimplified';

// Utilities
export { generatePortfolios, generateSimpleDemo } from './utils/mockData';

// Types
export type {
  DataNode,
  Portfolio,
  AssetClass,
  Region,
  Asset,
  ReturnComponent,
  HierarchyConfig,
  NavigationState,
  AnimationPhase,
  PathSelection,
  ViewMode,
  // Particle types
  Particle,
  FormationType,
  FormationState,
  AssetClassType,
  GeographicRegion,
  LatLong,
  GalaxyConfig,
  GlobeConfig,
  NebulaConfig,
  CameraTarget,
} from './types';

// Particle constants
export {
  GALAXY_CONFIGS,
  GLOBE_CONFIG,
  NEBULA_CONFIG,
  FORMATION_CAMERAS,
  REGION_COORDINATES,
  ASSET_CLASS_COLORS,
  PARTICLE_SIZE,
  TRANSITION_DURATIONS,
} from './types/particle';
