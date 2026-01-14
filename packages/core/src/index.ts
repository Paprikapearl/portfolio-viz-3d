/**
 * @portfolio-viz/core
 *
 * Cinematic 3D Portfolio Visualization
 *
 * A React Three Fiber based library for visualizing portfolio
 * hierarchies with animated drill-down navigation.
 */

// Main components
export { Stage } from './components/Stage';
export { Bar3D, type BarOrientation } from './components/Bar3D';
export { SelectionView } from './components/SelectionView';
export { Breadcrumbs } from './components/Breadcrumbs';
export { ExplodedInstrumentView } from './components/ExplodedInstrumentView';

// Store
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
} from './store';

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
} from './types';
