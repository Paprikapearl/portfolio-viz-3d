/**
 * ParticleSystem Component
 *
 * Renders all particles using InstancedMesh for high performance.
 * Handles transitions between formations and interactive hover states.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useParticleStore, useFormationState, useParticles } from '../store/particleStore';
import type { Particle } from '../types';
import { PARTICLE_SIZE } from '../types/particle';
import { calculateGalaxyFormation } from '../formations/GalaxyFormation';
import {
  calculateGlobeFormation,
  calculateGalaxyToGlobe,
} from '../formations/GlobeFormation';
import {
  calculateNebulaFormation,
  calculateGlobeToNebula,
} from '../formations/NebulaFormation';

interface ParticleSystemProps {
  /** Callback when a particle is clicked */
  onParticleClick?: (particle: Particle) => void;
  /** Whether to show labels on hover */
  showLabels?: boolean;
  /** Maximum number of particles (for performance) */
  maxParticles?: number;
}

/**
 * Individual particle mesh (used for interaction)
 */
function ParticleMesh({
  particle,
  position,
  size,
  isHovered,
  onHover,
  onClick,
}: {
  particle: Particle;
  position: [number, number, number];
  size: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = new THREE.Color(particle.color);

  // Animate size on hover
  const targetScale = isHovered ? 1.5 : 1;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerLeave={() => onHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isHovered ? 0.8 : 0.3}
        transparent
        opacity={isHovered ? 1 : 0.9}
        roughness={0.3}
        metalness={0.2}
      />

      {/* Label on hover */}
      {isHovered && (
        <Html
          position={[size + 0.3, size * 0.5, 0]}
          center={false}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{particle.shortLabel}</div>
            <div style={{ color: particle.value >= 0 ? '#4ade80' : '#f87171' }}>
              {(particle.value * 100).toFixed(2)}%
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

/**
 * Calculate particle positions based on current formation and transition state
 */
function useParticlePositions(
  particles: Particle[],
  formationState: ReturnType<typeof useFormationState>,
  time: number
): Map<string, [number, number, number]> {
  return useMemo(() => {
    const {
      currentFormation,
      targetFormation,
      transitionProgress,
      isTransitioning,
      selectedRegion,
    } = formationState;

    // If not transitioning, return positions for current formation
    if (!isTransitioning || transitionProgress >= 1) {
      switch (currentFormation) {
        case 'galaxy':
          return calculateGalaxyFormation(particles, time);
        case 'globe':
          return calculateGlobeFormation(particles, time);
        case 'nebula':
          return calculateNebulaFormation(particles);
        default:
          return calculateGalaxyFormation(particles, time);
      }
    }

    // Handle transitions
    if (currentFormation === 'galaxy' && targetFormation === 'globe') {
      const galaxyPositions = calculateGalaxyFormation(particles, time);
      return calculateGalaxyToGlobe(
        particles,
        galaxyPositions,
        transitionProgress,
        time
      );
    }

    if (currentFormation === 'globe' && targetFormation === 'nebula') {
      const globePositions = calculateGlobeFormation(particles, time);
      return calculateGlobeToNebula(
        particles,
        globePositions,
        transitionProgress,
        selectedRegion,
        time
      );
    }

    // Fallback to current formation
    switch (currentFormation) {
      case 'galaxy':
        return calculateGalaxyFormation(particles, time);
      case 'globe':
        return calculateGlobeFormation(particles, time);
      case 'nebula':
        return calculateNebulaFormation(particles);
      default:
        return calculateGalaxyFormation(particles, time);
    }
  }, [particles, formationState, time]);
}

/**
 * Main ParticleSystem component
 */
export function ParticleSystem({
  onParticleClick,
  showLabels: _showLabels = true,
  maxParticles = 500,
}: ParticleSystemProps) {
  const particles = useParticles();
  const formationState = useFormationState();
  const hoveredParticleId = useParticleStore((s) => s.hoveredParticleId);
  const setHoveredParticle = useParticleStore((s) => s.setHoveredParticle);
  const updateAnimationTime = useParticleStore((s) => s.updateAnimationTime);
  const animationTime = useParticleStore((s) => s.animationTime);

  // Update animation time
  useFrame((_, delta) => {
    updateAnimationTime(delta);
  });

  // Calculate positions
  const positions = useParticlePositions(particles, formationState, animationTime);

  // Limit particles for performance
  const visibleParticles = useMemo(() => {
    return particles.slice(0, maxParticles);
  }, [particles, maxParticles]);

  return (
    <group>
      {visibleParticles.map((particle) => {
        const position = positions.get(particle.id) || [0, 0, 0];
        const isHovered = hoveredParticleId === particle.id;

        // Calculate size based on weight
        const baseSize =
          PARTICLE_SIZE.min +
          (PARTICLE_SIZE.max - PARTICLE_SIZE.min) * Math.sqrt(particle.weight);

        return (
          <ParticleMesh
            key={particle.id}
            particle={particle}
            position={position}
            size={baseSize}
            isHovered={isHovered}
            onHover={(hovered) =>
              setHoveredParticle(hovered ? particle.id : null)
            }
            onClick={() => onParticleClick?.(particle)}
          />
        );
      })}
    </group>
  );
}

/**
 * High-performance instanced version for many particles
 * Uses InstancedMesh for batch rendering
 */
export function ParticleSystemInstanced({
  onParticleClick: _onParticleClick,
  maxParticles = 1000,
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useParticles();
  const formationState = useFormationState();
  const animationTime = useParticleStore((s) => s.animationTime);
  const updateAnimationTime = useParticleStore((s) => s.updateAnimationTime);

  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Calculate positions
  const positions = useParticlePositions(particles, formationState, animationTime);

  // Limit particles
  const visibleParticles = useMemo(() => {
    return particles.slice(0, maxParticles);
  }, [particles, maxParticles]);

  // Create color array for instances
  const colorArray = useMemo(() => {
    const colors = new Float32Array(maxParticles * 3);
    visibleParticles.forEach((particle, i) => {
      tempColor.set(particle.color);
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    });
    return colors;
  }, [visibleParticles, maxParticles, tempColor]);

  // Update instance matrices each frame
  useFrame((_, delta) => {
    updateAnimationTime(delta);

    if (!meshRef.current) return;

    visibleParticles.forEach((particle, i) => {
      const position = positions.get(particle.id) || [0, 0, 0];
      const size =
        PARTICLE_SIZE.min +
        (PARTICLE_SIZE.max - PARTICLE_SIZE.min) * Math.sqrt(particle.weight);

      tempObject.position.set(position[0], position[1], position[2]);
      tempObject.scale.setScalar(size);
      tempObject.updateMatrix();

      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Set up instance colors
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.setAttribute(
        'instanceColor',
        new THREE.InstancedBufferAttribute(colorArray, 3)
      );
    }
  }, [colorArray]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxParticles]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.2}
      />
    </instancedMesh>
  );
}

export default ParticleSystem;
