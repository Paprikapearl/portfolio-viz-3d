/**
 * Stage - Animated-camera 3D scene for cinematic visualization
 *
 * Layout:
 * - Level 0: Portfolio bars (preserved)
 * - Levels 1-3: Particle visualization (galaxy, globe, nebula)
 * - Level 4+: Exploded contribution view (preserved)
 * - Camera animates to new position after each selection
 */

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useSpring } from '@react-spring/three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import * as THREE from 'three';
import type { DataNode, HierarchyConfig } from '../types';
import { useNavigationStore, useVisualizationMode } from '../store';
import { useFormationState } from '../store/particleStore';
import { SelectionView } from './SelectionView';
import { Breadcrumbs } from './Breadcrumbs';
import { ParticleVisualization } from './ParticleVisualization';

// Camera positions for different states
const CAMERA_POSITIONS = {
  // Level 0: Overview - looking at vertical portfolio bars
  overview: { position: [0, 1.5, 10], lookAt: [0, 1, 0] },
  // Level 1+: Drilled in - looking at horizontal bars (legacy bar mode)
  drilled: { position: [1, 2, 8], lookAt: [0, 1.5, 0] },
  // Contribution mode: Slightly higher to see stacked bars
  contribution: { position: [1.5, 2.5, 9], lookAt: [0, 1.8, 0] },
  // Exploded view: Centered, looking at contribution blocks
  exploded: { position: [0, 2.5, 7], lookAt: [0, 2.5, 0] },
  // Particle visualization camera positions - further out for larger globe
  galaxy: { position: [0, 5, 22], lookAt: [0, 1.5, 0] },
  globe: { position: [0, 4, 18], lookAt: [0, 1.5, 0] },  // Even further out for bigger globe
  nebula: { position: [4, 3, 14], lookAt: [0, 1.5, 0] },
} as const;

// Scene center for orbit controls
const SCENE_CENTER = new THREE.Vector3(0, 1.5, 0);

interface StageProps {
  data: DataNode[];
  hierarchyConfig?: HierarchyConfig;
  width?: string | number;
  height?: string | number;
  onNodeSelect?: (node: DataNode, level: number) => void;
}

/**
 * Animated camera with orbit controls for particle visualization
 */
function AnimatedCamera({ enableOrbitControls }: { enableOrbitControls: boolean }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsType>(null);
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const viewMode = useNavigationStore((s) => s.viewMode);
  const explodedInstrumentId = useNavigationStore((s) => s.explodedInstrumentId);
  const visualizationMode = useVisualizationMode();
  const formationState = useFormationState();
  const prevFormationRef = useRef(formationState.currentFormation);

  // Determine target camera state based on level, view mode, and visualization mode
  const targetState = useMemo(() => {
    // Exploded view takes priority
    if (explodedInstrumentId) {
      return CAMERA_POSITIONS.exploded;
    }

    // Level 0: Portfolio overview
    if (currentLevel === 0) {
      return CAMERA_POSITIONS.overview;
    }

    // Particle visualization mode for levels 1-3
    if (visualizationMode === 'particles' && currentLevel >= 1 && currentLevel <= 3) {
      switch (formationState.currentFormation) {
        case 'galaxy':
          return CAMERA_POSITIONS.galaxy;
        case 'globe':
          return CAMERA_POSITIONS.globe;
        case 'nebula':
          return CAMERA_POSITIONS.nebula;
        default:
          return CAMERA_POSITIONS.galaxy;
      }
    }

    // Bar visualization mode (legacy)
    if (viewMode === 'contribution') {
      return CAMERA_POSITIONS.contribution;
    }
    return CAMERA_POSITIONS.drilled;
  }, [currentLevel, viewMode, explodedInstrumentId, visualizationMode, formationState.currentFormation]);

  // Animate camera position (only when orbit controls are disabled or formation changes)
  const { posX, posY, posZ } = useSpring({
    posX: targetState.position[0],
    posY: targetState.position[1],
    posZ: targetState.position[2],
    config: { mass: 1, tension: 80, friction: 20 },
  });

  // Reset camera position when formation changes
  useEffect(() => {
    if (formationState.currentFormation !== prevFormationRef.current) {
      prevFormationRef.current = formationState.currentFormation;
      // Reset orbit controls target and camera position on formation change
      if (controlsRef.current && cameraRef.current) {
        controlsRef.current.target.copy(SCENE_CENTER);
        cameraRef.current.position.set(
          targetState.position[0],
          targetState.position[1],
          targetState.position[2]
        );
        controlsRef.current.update();
      }
    }
  }, [formationState.currentFormation, targetState]);

  // Update camera each frame when orbit controls are disabled
  useFrame(() => {
    if (cameraRef.current && !enableOrbitControls) {
      cameraRef.current.position.set(
        posX.get(),
        posY.get(),
        posZ.get()
      );
      cameraRef.current.lookAt(SCENE_CENTER);
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[targetState.position[0], targetState.position[1], targetState.position[2]]}
        fov={50}
      />
      {enableOrbitControls && (
        <OrbitControls
          ref={controlsRef}
          target={SCENE_CENTER}
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={30}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
      )}
    </>
  );
}

function Scene({
  onNodeSelect,
}: {
  onNodeSelect?: (node: DataNode, level: number) => void;
}) {
  const explodedInstrumentId = useNavigationStore((s) => s.explodedInstrumentId);
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const visualizationMode = useVisualizationMode();
  const isExploded = !!explodedInstrumentId;

  // Determine if we should show particle visualization
  const showParticles = visualizationMode === 'particles' &&
    currentLevel >= 1 &&
    currentLevel <= 3 &&
    !isExploded;

  // Show bars for level 0, level 4+, or when in bar mode
  const showBars = currentLevel === 0 ||
    currentLevel > 3 ||
    visualizationMode === 'bars' ||
    isExploded;

  return (
    <>
      {/* Animated camera with orbit controls for particle mode */}
      <AnimatedCamera enableOrbitControls={showParticles} />

      {/* Lighting - clean, even */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={0.6} />
      <directionalLight position={[-5, 5, -5]} intensity={0.2} />

      {/* Ground reference - hidden in exploded view and particle mode */}
      {!isExploded && !showParticles && (
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

      {/* Subtle grid - hidden in exploded view and particle mode */}
      {!isExploded && !showParticles && (
        <gridHelper
          args={[20, 20, '#1a1a2a', '#151520']}
          position={[0, 0.01, 0]}
        />
      )}

      {/* Breadcrumbs (selected parents at top) - hidden in particle mode and exploded view */}
      {!isExploded && !showParticles && <Breadcrumbs />}

      {/* Particle visualization for levels 1-3 */}
      {showParticles && (
        <ParticleVisualization onNodeSelect={onNodeSelect} />
      )}

      {/* Bar-based selection view for level 0 and exploded view */}
      {showBars && <SelectionView onNodeSelect={onNodeSelect} />}
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
