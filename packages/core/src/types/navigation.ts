/**
 * Navigation state types for the cinematic drill-down experience
 */

import type { DataNode } from './data';

/**
 * Animation phases for transitions
 */
export type AnimationPhase =
  | 'idle'           // No animation
  | 'selecting'      // Others fading out, selected highlighting
  | 'moving'         // Selected bar moving to breadcrumb position
  | 'splitting'      // Bar splitting into children
  | 'collapsing';    // Reverse: children merging back (for back navigation)

/**
 * View modes for the visualization
 */
export type ViewMode =
  | 'value'          // Bars show absolute return values
  | 'contribution';  // Bars show contribution to parent (value × weight)

/**
 * A selection in the navigation path
 */
export interface PathSelection {
  node: DataNode;
  level: number;
}

/**
 * Current navigation state
 */
export interface NavigationState {
  // The full dataset (array of portfolios at root)
  rootNodes: DataNode[];

  // Current depth in hierarchy (0 = portfolio selection)
  currentLevel: number;

  // Path of selections made (breadcrumb trail)
  selectionPath: PathSelection[];

  // Currently visible nodes at current level
  currentNodes: DataNode[];

  // Animation state
  animationPhase: AnimationPhase;

  // Node being animated (during transitions)
  animatingNodeId: string | null;

  // Hovered node
  hoveredNodeId: string | null;

  // View mode
  viewMode: ViewMode;

  // Exploded instrument view state
  explodedInstrumentId: string | null;  // ID of instrument being exploded
  contributionSpacing: number;           // Spacing between contribution blocks (0-2)
  selectedContributionId: string | null; // ID of contribution showing popup

  // Scroll cycling state (for instrument level)
  focusedNodeIndex: number;              // Index of currently focused node for scroll cycling

  // Z-axis carousel scrolling (for browsing many items)
  carouselOffset: number;                // Scroll offset for Z-axis carousel (0 = first item at front)
}

/**
 * Navigation actions
 */
export type NavigationAction =
  | { type: 'SELECT_NODE'; nodeId: string }
  | { type: 'GO_BACK'; toLevel?: number }
  | { type: 'RESET' }
  | { type: 'SET_ANIMATION_PHASE'; phase: AnimationPhase }
  | { type: 'HOVER_NODE'; nodeId: string | null }
  | { type: 'ANIMATION_COMPLETE' };
