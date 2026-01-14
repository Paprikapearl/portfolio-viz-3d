/**
 * SelectionView - Orchestrates the selection and split animations
 *
 * Two view modes:
 * 1. 'value' mode: Bars show absolute return values
 *    - Level 0: vertical bars spread horizontally
 *    - Level 1+: horizontal bars stacked vertically
 *
 * 2. 'contribution' mode: Bars show contribution to portfolio
 *    - Parent bar stretches wide at top
 *    - Children positioned as stacked segments underneath
 *    - Each segment length = contribution to parent
 */

import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useNavigationStore } from '../store';
import type { DataNode } from '../types';
import { Bar3D, type BarOrientation } from './Bar3D';
import { ExplodedInstrumentView } from './ExplodedInstrumentView';

// Animation stagger delay between bars (ms)
const STAGGER_DELAY = 80;

// Color scale for return values
function getReturnColor(value: number): string {
  if (value >= 0.08) return '#22c55e';  // Strong positive
  if (value >= 0.04) return '#4ade80';  // Moderate positive
  if (value >= 0) return '#86efac';     // Slight positive
  if (value >= -0.04) return '#fca5a5'; // Slight negative
  return '#ef4444';                      // Strong negative
}

// Layout constants - Value mode
const VERTICAL_SPACING = 1.5;    // Horizontal spacing for vertical bars
const HORIZONTAL_SPACING = 0.7;  // Vertical spacing for horizontal bars
const LEFT_EDGE = -3;            // Left edge for horizontal bars
const BASE_Y_OFFSET = 1.0;       // Base Y position for bar center

// Carousel constants (vertical Y-axis scrolling)
const CAROUSEL_Y_SPACING = 0.6;   // Y spacing between carousel items
const CAROUSEL_VISIBLE_RANGE = 8; // How many items visible on each side of center
const CAROUSEL_FADE_START = 4;    // Start fading after this many items from center
const CAROUSEL_CENTER_Y = 1.5;    // Y position of the focused item

// Layout constants - Contribution mode
const CONTRIBUTION_BAR_WIDTH = 6;    // Total width of parent bar (65% of typical view)
const CONTRIBUTION_LEFT_EDGE = -3;   // Left edge for contribution bars
const CONTRIBUTION_GAP = 0.05;       // Gap between stacked segments
const CONTRIBUTION_Y_PARENT = 2.5;   // Y position for parent bar
const CONTRIBUTION_Y_CHILDREN = 1.2; // Y position for children row

interface SelectionViewProps {
  onNodeSelect?: (node: DataNode, level: number) => void;
}

export function SelectionView({ onNodeSelect }: SelectionViewProps) {
  const { gl } = useThree();
  const currentNodes = useNavigationStore((s) => s.currentNodes);
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const selectionPath = useNavigationStore((s) => s.selectionPath);
  const animationPhase = useNavigationStore((s) => s.animationPhase);

  // Track when to trigger barrel roll animation
  const [animateInTrigger, setAnimateInTrigger] = useState(0);
  const prevLevelRef = useRef(currentLevel);

  // Trigger barrel roll when level changes (new bars appear)
  useEffect(() => {
    if (currentLevel !== prevLevelRef.current) {
      prevLevelRef.current = currentLevel;
      // Small delay to let the bars render first
      setTimeout(() => setAnimateInTrigger((t) => t + 1), 50);
    }
  }, [currentLevel]);
  const animatingNodeId = useNavigationStore((s) => s.animatingNodeId);
  const hoveredNodeId = useNavigationStore((s) => s.hoveredNodeId);
  const viewMode = useNavigationStore((s) => s.viewMode);
  const selectNode = useNavigationStore((s) => s.selectNode);
  const goBack = useNavigationStore((s) => s.goBack);
  const setAnimationPhase = useNavigationStore((s) => s.setAnimationPhase);
  const setHoveredNode = useNavigationStore((s) => s.setHoveredNode);
  const completeAnimation = useNavigationStore((s) => s.completeAnimation);
  const scrollCarousel = useNavigationStore((s) => s.scrollCarousel);
  const carouselOffset = useNavigationStore((s) => s.carouselOffset);

  // Exploded instrument view state
  const explodedInstrumentId = useNavigationStore((s) => s.explodedInstrumentId);
  const explodeInstrument = useNavigationStore((s) => s.explodeInstrument);
  const collapseInstrument = useNavigationStore((s) => s.collapseInstrument);

  // Check if we're at instrument level (level 3: Portfolio → Asset Class → Market → Instrument)
  const isInstrumentLevel = currentLevel === 3;

  // Z-axis carousel for horizontal bar levels (level > 0)
  const hasHorizontalBars = currentLevel > 0;

  // Carousel scroll handling - moves bars on Z-axis
  useEffect(() => {
    if (!hasHorizontalBars || explodedInstrumentId) return;

    const canvas = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Smooth scrolling - delta controls speed
      const delta = e.deltaY * 0.005;
      scrollCarousel(delta);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [gl, hasHorizontalBars, explodedInstrumentId, scrollCarousel]);

  // Find the exploded instrument
  const explodedInstrument = useMemo(() => {
    if (!explodedInstrumentId) return null;
    return currentNodes.find((n) => n.id === explodedInstrumentId) || null;
  }, [explodedInstrumentId, currentNodes]);

  // Get parent node for contribution calculations
  const parentNode = selectionPath.length > 0
    ? selectionPath[selectionPath.length - 1].node
    : null;

  // Calculate bar data based on view mode
  const barData = useMemo(() => {
    const count = currentNodes.length;

    if (viewMode === 'contribution' && currentLevel > 0 && parentNode) {
      // Contribution mode: stacked segments underneath parent
      // Children segments should exactly fill the parent bar width

      // Calculate contributions for each child
      const childData = currentNodes.map((node) => {
        const weight = node.weight ?? (1 / count);
        const contribution = node.value * weight;
        return { node, contribution, weight };
      });

      // Calculate total weight to normalize (ensures segments fill parent bar)
      const totalWeight = childData.reduce((sum, d) => sum + d.weight, 0);
      const totalGaps = (count - 1) * CONTRIBUTION_GAP;
      const availableWidth = CONTRIBUTION_BAR_WIDTH - totalGaps;

      // Calculate positions - segments proportional to weight, filling parent bar
      let xOffset = CONTRIBUTION_LEFT_EDGE;
      return childData.map(({ node, contribution, weight }, index) => {
        // Width proportional to weight, so all segments fill the parent bar exactly
        const segmentWidth = (weight / totalWeight) * availableWidth;
        const position: [number, number, number] = [xOffset, CONTRIBUTION_Y_CHILDREN, 0];
        xOffset += segmentWidth + CONTRIBUTION_GAP;

        return {
          node,
          position,
          orientation: 'horizontal' as BarOrientation,
          customLength: Math.max(0.1, segmentWidth),
          displayValue: contribution,
          carouselIndex: index,
          carouselDistance: 0,
          carouselOpacity: 1,
        };
      });
    }

    // Value mode: standard layout
    const isHorizontal = currentLevel > 0;

    if (isHorizontal) {
      // Carousel mode: bars scroll vertically (Y-axis) from bottom to top
      return currentNodes.map((node, i) => {
        // Calculate distance from carousel center (focused item)
        const distanceFromCenter = i - carouselOffset;

        // Y position: focused item at center, others above/below
        // Positive distance = below center, negative = above center
        const yPos = CAROUSEL_CENTER_Y - distanceFromCenter * CAROUSEL_Y_SPACING;

        // Z position: slight depth offset for items further from center (subtle 3D effect)
        const zPos = -Math.abs(distanceFromCenter) * 0.15;

        // Opacity: fade out items further from center
        const absDistance = Math.abs(distanceFromCenter);
        let carouselOpacity = 1;
        if (absDistance > CAROUSEL_FADE_START) {
          carouselOpacity = Math.max(0.15, 1 - (absDistance - CAROUSEL_FADE_START) * 0.2);
        }

        // Scale: slightly smaller for items further from center
        const carouselScale = Math.max(0.7, 1 - absDistance * 0.04);

        return {
          node,
          position: [LEFT_EDGE, yPos, zPos] as [number, number, number],
          orientation: 'horizontal' as BarOrientation,
          customLength: undefined,
          displayValue: node.value,
          carouselIndex: i,
          carouselDistance: distanceFromCenter,
          carouselOpacity,
          carouselScale,
        };
      }).filter(item => {
        // Only render items within visible range
        return Math.abs(item.carouselDistance) <= CAROUSEL_VISIBLE_RANGE;
      });
    } else {
      const totalWidth = (count - 1) * VERTICAL_SPACING;
      const startX = -totalWidth / 2;

      return currentNodes.map((node, i) => ({
        node,
        position: [startX + i * VERTICAL_SPACING, 0, 0] as [number, number, number],
        orientation: 'vertical' as BarOrientation,
        customLength: undefined,
        displayValue: node.value,
        carouselIndex: i,
        carouselDistance: 0,
        carouselOpacity: 1,
        carouselScale: 1,
      }));
    }
  }, [currentNodes, currentLevel, viewMode, parentNode, carouselOffset]);

  // Parent bar data for contribution mode
  const parentBarData = useMemo(() => {
    if (viewMode !== 'contribution' || currentLevel === 0 || !parentNode) {
      return null;
    }

    return {
      node: parentNode,
      position: [CONTRIBUTION_LEFT_EDGE, CONTRIBUTION_Y_PARENT, 0] as [number, number, number],
      orientation: 'horizontal' as BarOrientation,
      customLength: CONTRIBUTION_BAR_WIDTH,
    };
  }, [viewMode, currentLevel, parentNode]);

  // Handle animation phase transitions
  useEffect(() => {
    if (animationPhase === 'selecting') {
      const timer = setTimeout(() => setAnimationPhase('moving'), 200);
      return () => clearTimeout(timer);
    }

    if (animationPhase === 'moving') {
      const timer = setTimeout(() => setAnimationPhase('splitting'), 300);
      return () => clearTimeout(timer);
    }

    if (animationPhase === 'splitting') {
      const timer = setTimeout(() => completeAnimation(), 400);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setAnimationPhase, completeAnimation]);

  const handleNodeClick = useCallback((node: DataNode) => {
    if (animationPhase !== 'idle') return;
    if (!node.children || node.children.length === 0) return;

    // At instrument level, explode instead of drilling down
    if (isInstrumentLevel) {
      explodeInstrument(node.id);
      onNodeSelect?.(node, currentLevel);
      return;
    }

    selectNode(node.id);
    onNodeSelect?.(node, currentLevel);
  }, [animationPhase, selectNode, explodeInstrument, onNodeSelect, currentLevel, isInstrumentLevel]);

  const handleNodeHover = useCallback((nodeId: string, hovered: boolean) => {
    setHoveredNode(hovered ? nodeId : null);
  }, [setHoveredNode]);

  return (
    <group position={[0, 0, 0]}>
      {/* Exploded instrument view */}
      {explodedInstrument && (
        <ExplodedInstrumentView
          instrument={explodedInstrument}
          onClose={collapseInstrument}
        />
      )}

      {/* Parent bar in contribution mode - click to go back */}
      {!explodedInstrument && parentBarData && (
        <Bar3D
          id={parentBarData.node.id}
          label={parentBarData.node.label}
          shortLabel={parentBarData.node.shortLabel}
          value={parentBarData.node.value}
          position={parentBarData.position}
          orientation={parentBarData.orientation}
          length={parentBarData.customLength}
          color={getReturnColor(parentBarData.node.value)}
          opacity={0.6}
          showLabel={true}
          labelPosition="right"
          onClick={() => {
            if (animationPhase === 'idle') {
              goBack();
            }
          }}
        />
      )}

      {/* Current level bars - hidden when exploded view is active */}
      {!explodedInstrument && barData.map((item) => {
        const { node, position, orientation, customLength, displayValue, carouselIndex, carouselDistance, carouselOpacity, carouselScale } = item;
        const isAnimatingNode = node.id === animatingNodeId;
        const isOther = animatingNodeId !== null && !isAnimatingNode;

        let opacity = carouselOpacity ?? 1;
        const scale = carouselScale ?? 1;

        if (animationPhase === 'selecting') {
          if (isOther) opacity = 0.2;
        }

        if (animationPhase === 'moving' || animationPhase === 'splitting') {
          if (isOther || isAnimatingNode) opacity = 0;
        }

        if (opacity === 0) return null;

        const hasChildren = node.children && node.children.length > 0;

        // Focused item (at carousel center) gets highlight
        const isFocused = Math.abs(carouselDistance ?? 0) < 0.5;

        return (
          <group key={node.id} scale={[scale, scale, scale]}>
            <Bar3D
              id={node.id}
              label={node.label}
              shortLabel={node.shortLabel}
              value={displayValue}
              weight={node.weight}
              position={position}
              orientation={orientation}
              length={customLength}
              color={getReturnColor(node.value)}
              opacity={opacity}
              isHovered={hoveredNodeId === node.id || isFocused}
              isSelected={isAnimatingNode}
              showLabel={opacity > 0.5 && Math.abs(carouselDistance ?? 0) < 2}
              labelPosition={orientation === 'horizontal' ? 'right' : 'above'}
              animateIn={currentLevel > 0 && animateInTrigger > 0}
              animationDelay={(carouselIndex ?? 0) * STAGGER_DELAY}
              onClick={hasChildren ? () => handleNodeClick(node) : undefined}
              onHover={(hovered) => handleNodeHover(node.id, hovered)}
            />
          </group>
        );
      })}
    </group>
  );
}
