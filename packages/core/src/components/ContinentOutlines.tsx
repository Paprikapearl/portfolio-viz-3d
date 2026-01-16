/**
 * ContinentOutlines Component
 *
 * Renders simplified continent wireframes on the globe or flat projection.
 * Used for geographic reference in Level 2 (Globe) visualization.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { continents, generateGraticule } from '../data/worldSimplified';
import { latLongToSphere, interpolateSphereToProjection } from '../projections/VanDerGrinten4';
import { GLOBE_CONFIG } from '../types/particle';

interface ContinentOutlinesProps {
  /** Opacity of the outlines (0-1) */
  opacity?: number;
  /** Color of the outlines */
  color?: string;
  /** Whether to show graticule (grid) lines */
  showGraticule?: boolean;
  /** Graticule opacity */
  graticuleOpacity?: number;
  /** Progress of unfolding animation (0 = sphere, 1 = flat) */
  unfoldProgress?: number;
  /** Globe rotation speed */
  rotationSpeed?: number;
  /** Whether globe is rotating */
  isRotating?: boolean;
}

/**
 * Renders a single continent outline as a line loop
 */
function ContinentLine({
  coordinates,
  color,
  opacity,
  unfoldProgress,
  rotationAngle,
}: {
  coordinates: Array<[number, number]>;
  color: string;
  opacity: number;
  unfoldProgress: number;
  rotationAngle: number;
}) {
  const points = useMemo(() => {
    return coordinates.map(([lat, long]) => {
      if (unfoldProgress < 0.01) {
        // Pure sphere
        const [x, y, z] = latLongToSphere(lat, long, GLOBE_CONFIG.radius);

        // Apply rotation
        const rotatedX = x * Math.cos(rotationAngle) - z * Math.sin(rotationAngle);
        const rotatedZ = x * Math.sin(rotationAngle) + z * Math.cos(rotationAngle);

        return new THREE.Vector3(
          GLOBE_CONFIG.center[0] + rotatedX,
          GLOBE_CONFIG.center[1] + y,
          GLOBE_CONFIG.center[2] + rotatedZ
        );
      } else {
        // Interpolated position
        const [x, y, z] = interpolateSphereToProjection(
          { lat, long },
          unfoldProgress,
          GLOBE_CONFIG.radius,
          { yLevel: GLOBE_CONFIG.center[1], scale: 1.2, center: [0, 0, 0] }
        );
        return new THREE.Vector3(x, y, z);
      }
    });
  }, [coordinates, unfoldProgress, rotationAngle]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        color={color}
        opacity={opacity}
        transparent
        linewidth={1}
      />
    </lineLoop>
  );
}

/**
 * Renders graticule (grid) lines
 */
function GraticuleLines({
  color,
  opacity,
  unfoldProgress,
  rotationAngle,
}: {
  color: string;
  opacity: number;
  unfoldProgress: number;
  rotationAngle: number;
}) {
  const graticule = useMemo(() => generateGraticule(30, 30), []);

  return (
    <group>
      {graticule.map((line, i) => (
        <GraticuleLine
          key={i}
          coordinates={line}
          color={color}
          opacity={opacity}
          unfoldProgress={unfoldProgress}
          rotationAngle={rotationAngle}
        />
      ))}
    </group>
  );
}

/**
 * Renders a single graticule line
 */
function GraticuleLine({
  coordinates,
  color,
  opacity,
  unfoldProgress,
  rotationAngle,
}: {
  coordinates: Array<[number, number]>;
  color: string;
  opacity: number;
  unfoldProgress: number;
  rotationAngle: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    return coordinates.map(([lat, long]) => {
      if (unfoldProgress < 0.01) {
        const [x, y, z] = latLongToSphere(lat, long, GLOBE_CONFIG.radius);

        // Apply rotation
        const rotatedX = x * Math.cos(rotationAngle) - z * Math.sin(rotationAngle);
        const rotatedZ = x * Math.sin(rotationAngle) + z * Math.cos(rotationAngle);

        return new THREE.Vector3(
          GLOBE_CONFIG.center[0] + rotatedX,
          GLOBE_CONFIG.center[1] + y,
          GLOBE_CONFIG.center[2] + rotatedZ
        );
      } else {
        const [x, y, z] = interpolateSphereToProjection(
          { lat, long },
          unfoldProgress,
          GLOBE_CONFIG.radius,
          { yLevel: GLOBE_CONFIG.center[1], scale: 1.2, center: [0, 0, 0] }
        );
        return new THREE.Vector3(x, y, z);
      }
    });
  }, [coordinates, unfoldProgress, rotationAngle]);

  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    });
    return new THREE.Line(geometry, material);
  }, [points, color, opacity]);

  return <primitive ref={lineRef} object={lineObject} />;
}

/**
 * Main ContinentOutlines component
 */
export function ContinentOutlines({
  opacity = 0.15,
  color = '#4a5568',
  showGraticule = true,
  graticuleOpacity = 0.08,
  unfoldProgress = 0,
  rotationSpeed = 0.01,
  isRotating = true,
}: ContinentOutlinesProps) {
  const rotationAngleRef = useRef(0);

  // Update rotation
  useFrame((_, delta) => {
    if (isRotating && unfoldProgress < 0.5) {
      rotationAngleRef.current += delta * rotationSpeed * 60; // Normalize to 60fps
    }
  });

  return (
    <group>
      {/* Graticule grid */}
      {showGraticule && (
        <GraticuleLines
          color={color}
          opacity={graticuleOpacity}
          unfoldProgress={unfoldProgress}
          rotationAngle={rotationAngleRef.current}
        />
      )}

      {/* Continent outlines */}
      {continents.map((continent) => (
        <ContinentLine
          key={continent.name}
          coordinates={continent.coordinates}
          color={color}
          opacity={opacity}
          unfoldProgress={unfoldProgress}
          rotationAngle={rotationAngleRef.current}
        />
      ))}
    </group>
  );
}

export default ContinentOutlines;
