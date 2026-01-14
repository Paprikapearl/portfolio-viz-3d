/**
 * Breadcrumbs - Shows selection trail as horizontal bars at top
 *
 * Each selected parent becomes a small horizontal bar stacked at the top.
 * Clicking a breadcrumb navigates back to that level.
 * Bars are aligned to the same left edge as the main horizontal bars.
 */

import { useMemo } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { useNavigationStore } from '../store';

// Layout constants (matching SelectionView)
const LEFT_EDGE = -3;
const BASE_Y = 3.0;
const SPACING = 0.5;
const BREADCRUMB_LENGTH = 1.5;
const BREADCRUMB_THICKNESS = 0.2;

// Muted colors for breadcrumb bars
function getBreadcrumbColor(value: number): string {
  if (value >= 0.06) return '#166534';  // Dark green
  if (value >= 0) return '#1e3a2e';     // Muted green
  return '#7f1d1d';                      // Dark red
}

// Animation config
const ANIM_CONFIG = {
  duration: 250,
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
};

interface BreadcrumbBarProps {
  label: string;
  shortLabel?: string;
  value: number;
  position: [number, number, number];
  onClick: () => void;
}

function BreadcrumbBar({
  label,
  shortLabel,
  value,
  position,
  onClick,
}: BreadcrumbBarProps) {
  const { animPosition } = useSpring({
    animPosition: position,
    config: ANIM_CONFIG,
  });

  const displayLabel = shortLabel || label;

  return (
    <animated.group position={animPosition.to((x, y, z) => [x, y, z])}>
      {/* The bar - offset so it grows from left edge */}
      <mesh
        position={[BREADCRUMB_LENGTH / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[BREADCRUMB_LENGTH, BREADCRUMB_THICKNESS, BREADCRUMB_THICKNESS]} />
        <meshStandardMaterial
          color={getBreadcrumbColor(value)}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Label to the right */}
      <Html
        position={[BREADCRUMB_LENGTH + 0.3, 0, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#94a3b8',
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{displayLabel}</span>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
              color: value >= 0 ? '#4ade80' : '#f87171',
            }}
          >
            {value >= 0 ? '+' : ''}{(value * 100).toFixed(1)}%
          </span>
        </div>
      </Html>
    </animated.group>
  );
}

export function Breadcrumbs() {
  const selectionPath = useNavigationStore((s) => s.selectionPath);
  const currentNodes = useNavigationStore((s) => s.currentNodes);
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const animatingNodeId = useNavigationStore((s) => s.animatingNodeId);
  const animationPhase = useNavigationStore((s) => s.animationPhase);
  const viewMode = useNavigationStore((s) => s.viewMode);
  const goBack = useNavigationStore((s) => s.goBack);

  // Calculate positions for breadcrumb bars
  // Include the animating node as a "pending" breadcrumb during animation
  const breadcrumbData = useMemo(() => {
    // In contribution mode, return empty (parent shown in SelectionView)
    if (viewMode === 'contribution') {
      return [];
    }

    const items = selectionPath.map((selection, index) => ({
      ...selection,
      position: [LEFT_EDGE, BASE_Y - index * SPACING, -0.5] as [number, number, number],
      isPending: false,
    }));

    // Add the animating node as a pending breadcrumb during moving/splitting phases
    if (
      (animationPhase === 'moving' || animationPhase === 'splitting') &&
      animatingNodeId
    ) {
      const animatingNode = currentNodes.find((n) => n.id === animatingNodeId);
      if (animatingNode) {
        items.push({
          node: animatingNode,
          level: currentLevel,
          position: [LEFT_EDGE, BASE_Y - items.length * SPACING, -0.5] as [number, number, number],
          isPending: true,
        });
      }
    }

    return items;
  }, [selectionPath, animationPhase, animatingNodeId, currentNodes, currentLevel, viewMode]);

  if (breadcrumbData.length === 0) return null;

  return (
    <group>
      {breadcrumbData.map(({ node, level, position, isPending }) => (
        <BreadcrumbBar
          key={node.id}
          label={node.label}
          shortLabel={node.shortLabel}
          value={node.value}
          position={position}
          onClick={() => {
            if (animationPhase === 'idle' && !isPending) {
              goBack(level);
            }
          }}
        />
      ))}
    </group>
  );
}
