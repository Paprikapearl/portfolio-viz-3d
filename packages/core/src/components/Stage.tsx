/**
 * Stage - Animated-camera 3D scene for cinematic visualization
 *
 * Layout:
 * - Top area: Breadcrumb trail (horizontal bars)
 * - Middle area: Current selection options (vertical bars)
 * - Camera animates to new position after each selection
 */

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';
import type { DataNode, HierarchyConfig } from '../types';
import { useNavigationStore } from '../store';
import { SelectionView } from './SelectionView';
import { Breadcrumbs } from './Breadcrumbs';

// Camera positions for different states
const CAMERA_POSITIONS = {
  // Level 0: Overview - looking at vertical portfolio bars
  overview: { position: [0, 1.5, 10], lookAt: [0, 1, 0] },
  // Level 1+: Drilled in - looking at horizontal bars
  drilled: { position: [1, 2, 8], lookAt: [0, 1.5, 0] },
  // Contribution mode: Slightly higher to see stacked bars
  contribution: { position: [1.5, 2.5, 9], lookAt: [0, 1.8, 0] },
  // Exploded view: Centered, looking at contribution blocks
  exploded: { position: [0, 2.5, 7], lookAt: [0, 2.5, 0] },
} as const;

interface StageProps {
  data: DataNode[];
  hierarchyConfig?: HierarchyConfig;
  width?: string | number;
  height?: string | number;
  onNodeSelect?: (node: DataNode, level: number) => void;
}

/**
 * Animated camera that smoothly transitions between positions
 */
function AnimatedCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const viewMode = useNavigationStore((s) => s.viewMode);
  const explodedInstrumentId = useNavigationStore((s) => s.explodedInstrumentId);

  // Determine target camera state based on level, view mode, and exploded state
  const targetState = useMemo(() => {
    // Exploded view takes priority
    if (explodedInstrumentId) {
      return CAMERA_POSITIONS.exploded;
    }
    if (currentLevel === 0) {
      return CAMERA_POSITIONS.overview;
    }
    if (viewMode === 'contribution') {
      return CAMERA_POSITIONS.contribution;
    }
    return CAMERA_POSITIONS.drilled;
  }, [currentLevel, viewMode, explodedInstrumentId]);

  // Animate camera position
  const { posX, posY, posZ, lookX, lookY, lookZ } = useSpring({
    posX: targetState.position[0],
    posY: targetState.position[1],
    posZ: targetState.position[2],
    lookX: targetState.lookAt[0],
    lookY: targetState.lookAt[1],
    lookZ: targetState.lookAt[2],
    config: { mass: 1, tension: 80, friction: 20 },
  });

  // Update camera each frame
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(
        posX.get(),
        posY.get(),
        posZ.get()
      );
      cameraRef.current.lookAt(
        lookX.get(),
        lookY.get(),
        lookZ.get()
      );
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[targetState.position[0], targetState.position[1], targetState.position[2]]}
      fov={50}
    />
  );
}

function Scene({
  onNodeSelect,
}: {
  onNodeSelect?: (node: DataNode, level: number) => void;
}) {
  const explodedInstrumentId = useNavigationStore((s) => s.explodedInstrumentId);
  const isExploded = !!explodedInstrumentId;

  return (
    <>
      {/* Animated camera - smoothly transitions after each selection */}
      <AnimatedCamera />

      {/* Lighting - clean, even */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} />

      {/* Ground reference - hidden in exploded view */}
      {!isExploded && (
        <mesh
          position={[0, -0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial
            color="#0a0a18"
            metalness={0.1}
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Subtle grid - hidden in exploded view */}
      {!isExploded && (
        <gridHelper
          args={[20, 20, '#1a1a2a', '#151520']}
          position={[0, 0.01, 0]}
        />
      )}

      {/* Breadcrumbs (selected parents at top) - hidden in exploded view */}
      {!isExploded && <Breadcrumbs />}

      {/* Main selection view */}
      <SelectionView onNodeSelect={onNodeSelect} />
    </>
  );
}

export function Stage({
  data,
  hierarchyConfig: _hierarchyConfig,
  width = '100%',
  height = '100%',
  onNodeSelect,
}: StageProps) {
  const initialize = useNavigationStore((s) => s.initialize);

  // Initialize store with data on first render
  if (useNavigationStore.getState().rootNodes.length === 0 && data.length > 0) {
    initialize(data);
  }

  return (
    <div
      style={{
        width,
        height,
        background: '#050510',
      }}
    >
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene onNodeSelect={onNodeSelect} />
        </Suspense>
      </Canvas>
    </div>
  );
}
