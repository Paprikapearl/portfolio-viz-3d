/**
 * Navigation store for cinematic drill-down experience
 *
 * State machine managing:
 * - Current level in hierarchy
 * - Selection path (breadcrumb trail)
 * - Animation phases
 */

import { create } from 'zustand';
import type { DataNode, NavigationState, AnimationPhase, ViewMode } from '../types';

interface NavigationStore extends NavigationState {
  // Actions
  initialize: (rootNodes: DataNode[]) => void;
  selectNode: (nodeId: string) => void;
  goBack: (toLevel?: number) => void;
  reset: () => void;
  setAnimationPhase: (phase: AnimationPhase) => void;
  setHoveredNode: (nodeId: string | null) => void;
  completeAnimation: () => void;
  setViewMode: (mode: ViewMode) => void;
  // Exploded instrument view actions
  explodeInstrument: (instrumentId: string) => void;
  collapseInstrument: () => void;
  setContributionSpacing: (spacing: number) => void;
  selectContribution: (contributionId: string | null) => void;
  // Scroll cycling actions
  cycleNodes: (direction: 'up' | 'down') => void;
  setFocusedNodeIndex: (index: number) => void;
  // Carousel scrolling
  setCarouselOffset: (offset: number) => void;
  scrollCarousel: (delta: number) => void;
}

const initialState: NavigationState = {
  rootNodes: [],
  currentLevel: 0,
  selectionPath: [],
  currentNodes: [],
  animationPhase: 'idle',
  animatingNodeId: null,
  hoveredNodeId: null,
  viewMode: 'value',
  explodedInstrumentId: null,
  contributionSpacing: 0.3,
  selectedContributionId: null,
  focusedNodeIndex: 0,
  carouselOffset: 0,
};

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  ...initialState,

  initialize: (rootNodes) => {
    set({
      rootNodes,
      currentNodes: rootNodes,
      currentLevel: 0,
      selectionPath: [],
      animationPhase: 'idle',
      animatingNodeId: null,
    });
  },

  selectNode: (nodeId) => {
    const state = get();
    if (state.animationPhase !== 'idle') return; // Block during animation

    const selectedNode = state.currentNodes.find((n) => n.id === nodeId);
    if (!selectedNode) return;

    // Check if node has children to drill into
    if (!selectedNode.children || selectedNode.children.length === 0) {
      // Leaf node - just select, don't drill
      set({ hoveredNodeId: nodeId });
      return;
    }

    // Start selection animation
    set({
      animationPhase: 'selecting',
      animatingNodeId: nodeId,
    });
  },

  goBack: (toLevel) => {
    const state = get();
    if (state.animationPhase !== 'idle') return;
    if (state.currentLevel === 0) return;

    const targetLevel = toLevel ?? state.currentLevel - 1;
    if (targetLevel < 0 || targetLevel >= state.currentLevel) return;

    // Start collapse animation
    set({
      animationPhase: 'collapsing',
      animatingNodeId: state.selectionPath[targetLevel]?.node.id ?? null,
    });

    // After animation, update state
    setTimeout(() => {
      const newPath = state.selectionPath.slice(0, targetLevel);
      const parentNode = newPath.length > 0
        ? newPath[newPath.length - 1].node
        : null;
      const newCurrentNodes = parentNode?.children ?? state.rootNodes;

      set({
        currentLevel: targetLevel,
        selectionPath: newPath,
        currentNodes: newCurrentNodes,
        animationPhase: 'idle',
        animatingNodeId: null,
        focusedNodeIndex: 0,  // Reset focus when going back
        hoveredNodeId: null,
        carouselOffset: 0,    // Reset carousel when going back
      });
    }, 400); // Match animation duration
  },

  reset: () => {
    const state = get();
    set({
      currentLevel: 0,
      selectionPath: [],
      currentNodes: state.rootNodes,
      animationPhase: 'idle',
      animatingNodeId: null,
      hoveredNodeId: null,
      explodedInstrumentId: null,
      selectedContributionId: null,
      contributionSpacing: 0.3,
      focusedNodeIndex: 0,
      carouselOffset: 0,
    });
  },

  setAnimationPhase: (phase) => {
    set({ animationPhase: phase });
  },

  setHoveredNode: (nodeId) => {
    set({ hoveredNodeId: nodeId });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  explodeInstrument: (instrumentId) => {
    const state = get();
    if (state.animationPhase !== 'idle') return;

    // Find the instrument in current nodes
    const instrument = state.currentNodes.find((n) => n.id === instrumentId);
    if (!instrument || !instrument.children || instrument.children.length === 0) return;

    set({
      explodedInstrumentId: instrumentId,
      animationPhase: 'selecting',
    });

    // Transition to exploded state after animation
    setTimeout(() => {
      set({ animationPhase: 'idle' });
    }, 300);
  },

  collapseInstrument: () => {
    set({
      explodedInstrumentId: null,
      selectedContributionId: null,
      contributionSpacing: 0.3,
    });
  },

  setContributionSpacing: (spacing) => {
    set({ contributionSpacing: Math.max(0.05, Math.min(0.4, spacing)) });
  },

  selectContribution: (contributionId) => {
    set({ selectedContributionId: contributionId });
  },

  cycleNodes: (direction) => {
    const state = get();
    const count = state.currentNodes.length;
    if (count === 0) return;

    let newIndex = state.focusedNodeIndex;
    if (direction === 'down') {
      newIndex = (newIndex + 1) % count;
    } else {
      newIndex = (newIndex - 1 + count) % count;
    }

    set({
      focusedNodeIndex: newIndex,
      hoveredNodeId: state.currentNodes[newIndex]?.id || null,
    });
  },

  setFocusedNodeIndex: (index) => {
    const state = get();
    const count = state.currentNodes.length;
    if (count === 0) return;

    const validIndex = Math.max(0, Math.min(count - 1, index));
    set({
      focusedNodeIndex: validIndex,
      hoveredNodeId: state.currentNodes[validIndex]?.id || null,
    });
  },

  setCarouselOffset: (offset) => {
    const state = get();
    const count = state.currentNodes.length;
    // Clamp offset to valid range (0 to count - 1)
    const clampedOffset = Math.max(0, Math.min(count - 1, offset));
    set({ carouselOffset: clampedOffset });
  },

  scrollCarousel: (delta) => {
    const state = get();
    const count = state.currentNodes.length;
    if (count === 0) return;

    const newOffset = state.carouselOffset + delta;
    // Clamp to valid range
    const clampedOffset = Math.max(0, Math.min(count - 1, newOffset));
    set({
      carouselOffset: clampedOffset,
      focusedNodeIndex: Math.round(clampedOffset),
      hoveredNodeId: state.currentNodes[Math.round(clampedOffset)]?.id || null,
    });
  },

  completeAnimation: () => {
    const state = get();

    if (state.animationPhase === 'splitting') {
      // Animation complete - update to new state
      const selectedNode = state.currentNodes.find(
        (n) => n.id === state.animatingNodeId
      );

      if (selectedNode && selectedNode.children) {
        set({
          currentLevel: state.currentLevel + 1,
          selectionPath: [
            ...state.selectionPath,
            { node: selectedNode, level: state.currentLevel },
          ],
          currentNodes: selectedNode.children,
          animationPhase: 'idle',
          animatingNodeId: null,
          focusedNodeIndex: 0,  // Reset focus when entering new level
          hoveredNodeId: null,
          carouselOffset: 0,    // Reset carousel when entering new level
        });
      }
    } else {
      set({
        animationPhase: 'idle',
        animatingNodeId: null,
      });
    }
  },
}));

// Selectors
export const useCurrentNodes = () =>
  useNavigationStore((s) => s.currentNodes);
export const useSelectionPath = () =>
  useNavigationStore((s) => s.selectionPath);
export const useCurrentLevel = () =>
  useNavigationStore((s) => s.currentLevel);
export const useAnimationPhase = () =>
  useNavigationStore((s) => s.animationPhase);
export const useAnimatingNodeId = () =>
  useNavigationStore((s) => s.animatingNodeId);
export const useHoveredNodeId = () =>
  useNavigationStore((s) => s.hoveredNodeId);
export const useViewMode = () =>
  useNavigationStore((s) => s.viewMode);
export const useExplodedInstrumentId = () =>
  useNavigationStore((s) => s.explodedInstrumentId);
export const useContributionSpacing = () =>
  useNavigationStore((s) => s.contributionSpacing);
export const useSelectedContributionId = () =>
  useNavigationStore((s) => s.selectedContributionId);
export const useFocusedNodeIndex = () =>
  useNavigationStore((s) => s.focusedNodeIndex);
export const useCarouselOffset = () =>
  useNavigationStore((s) => s.carouselOffset);
