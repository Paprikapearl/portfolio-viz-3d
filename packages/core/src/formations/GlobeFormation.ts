/**
 * Globe Formation Calculator
 *
 * Computes positions for particles on a 3D globe based on
 * their geographic coordinates. Used for Level 2 (Market/Geography)
 * visualization.
 */

import type { Particle, GeographicRegion } from '../types';
import { GLOBE_CONFIG, REGION_COORDINATES } from '../types/particle';
import {
  latLongToSphere,
  interpolateSphereToProjection,
} from '../projections/VanDerGrinten4';

/**
 * Calculate particle position on the globe
 *
 * @param particle The particle with lat/long data
 * @param time Animation time for rotation
 * @param config Optional globe configuration override
 * @returns [x, y, z] position on the globe surface
 */
export function calculateGlobePosition(
  particle: Particle,
  time: number = 0,
  config = GLOBE_CONFIG
): [number, number, number] {
  const { center, radius, rotationSpeed } = config;

  // Get lat/long from particle (use region center if not defined)
  const latLong = particle.latLong || REGION_COORDINATES[particle.region] || { lat: 0, long: 0 };

  // Calculate base sphere position
  const spherePos = latLongToSphere(latLong.lat, latLong.long, radius);

  // Apply rotation over time
  const rotationAngle = time * rotationSpeed;
  const rotatedX = spherePos[0] * Math.cos(rotationAngle) - spherePos[2] * Math.sin(rotationAngle);
  const rotatedZ = spherePos[0] * Math.sin(rotationAngle) + spherePos[2] * Math.cos(rotationAngle);

  // Apply center offset
  return [
    center[0] + rotatedX,
    center[1] + spherePos[1],
    center[2] + rotatedZ,
  ];
}

/**
 * Calculate positions for all particles on the globe
 *
 * @param particles All particles
 * @param time Animation time
 * @param config Optional globe configuration
 * @returns Map of particle ID to position
 */
export function calculateGlobeFormation(
  particles: Particle[],
  time: number = 0,
  config = GLOBE_CONFIG
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  particles.forEach((particle) => {
    const position = calculateGlobePosition(particle, time, config);
    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Calculate "streaming" animation from galaxy to globe
 *
 * Particles flow from their galaxy position to their geographic
 * position on the globe.
 *
 * @param particles Particles to position
 * @param galaxyPositions Starting galaxy positions
 * @param progress Animation progress (0 = galaxy, 1 = globe)
 * @param time Animation time for globe rotation
 * @returns Map of particle ID to position
 */
export function calculateGalaxyToGlobe(
  particles: Particle[],
  galaxyPositions: Map<string, [number, number, number]>,
  progress: number,
  time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const globePositions = calculateGlobeFormation(particles, time);

  // Use easing for smooth transition
  const easedProgress = easeInOutCubic(progress);

  particles.forEach((particle) => {
    const startPos = galaxyPositions.get(particle.id);
    const endPos = globePositions.get(particle.id);

    if (!startPos || !endPos) return;

    // Add arc motion for more interesting transition
    const arcHeight = Math.sin(progress * Math.PI) * 2; // Peak at middle

    const position: [number, number, number] = [
      lerp(startPos[0], endPos[0], easedProgress),
      lerp(startPos[1], endPos[1], easedProgress) + arcHeight,
      lerp(startPos[2], endPos[2], easedProgress),
    ];

    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Calculate "unfolding" animation from globe to Van der Grinten projection
 *
 * The globe "unfolds" like origami into a flat map view.
 *
 * @param particles Particles to position
 * @param progress Unfold progress (0 = sphere, 1 = flat)
 * @param selectedRegion Region to focus on (affects camera/zoom)
 * @param time Animation time
 * @returns Map of particle ID to position
 */
export function calculateGlobeUnfolding(
  particles: Particle[],
  progress: number,
  selectedRegion: GeographicRegion | null = null,
  _time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Calculate center for the projection (focus on selected region)
  const projectionCenter: [number, number, number] = selectedRegion
    ? getRegionProjectionCenter(selectedRegion)
    : [0, 1.5, 0];

  particles.forEach((particle) => {
    const latLong = particle.latLong || REGION_COORDINATES[particle.region] || { lat: 0, long: 0 };

    const position = interpolateSphereToProjection(
      latLong,
      progress,
      GLOBE_CONFIG.radius,
      {
        yLevel: projectionCenter[1],
        scale: 1.2, // Scale up the projection slightly
        center: [projectionCenter[0], 0, projectionCenter[2]],
      }
    );

    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Get the 3D center position for a geographic region
 * Used for camera targeting during region selection
 */
export function getRegionCenter(
  region: GeographicRegion,
  time: number = 0
): [number, number, number] {
  const regionCoords = REGION_COORDINATES[region];
  const spherePos = latLongToSphere(
    regionCoords.lat,
    regionCoords.long,
    GLOBE_CONFIG.radius
  );

  // Apply globe rotation
  const rotationAngle = time * GLOBE_CONFIG.rotationSpeed;
  const rotatedX = spherePos[0] * Math.cos(rotationAngle) - spherePos[2] * Math.sin(rotationAngle);
  const rotatedZ = spherePos[0] * Math.sin(rotationAngle) + spherePos[2] * Math.cos(rotationAngle);

  return [
    GLOBE_CONFIG.center[0] + rotatedX,
    GLOBE_CONFIG.center[1] + spherePos[1],
    GLOBE_CONFIG.center[2] + rotatedZ,
  ];
}

/**
 * Get projection center for a region (after unfolding)
 */
function getRegionProjectionCenter(region: GeographicRegion): [number, number, number] {
  // These are approximate centers in the projected space
  const regionCenters: Record<GeographicRegion, [number, number, number]> = {
    'north-america': [-2, 1.5, -0.5],
    'europe': [0.5, 1.5, -0.8],
    'asia': [2, 1.5, -0.5],
    'emerging-markets': [0, 1.5, 0.5],
    'global': [0, 1.5, 0],
    'unknown': [0, 1.5, 0],
  };

  return regionCenters[region] || [0, 1.5, 0];
}

/**
 * Calculate positions for non-geographic assets (bonds, alternatives)
 * that remain as small galaxy clusters near the globe
 *
 * @param particles Non-geographic particles
 * @param assetClass Asset class type
 * @param time Animation time
 * @returns Map of particle ID to position
 */
export function calculateSideClusterPositions(
  particles: Particle[],
  assetClass: 'fixed-income' | 'alternatives',
  time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Position clusters beside/below the globe
  const clusterCenters: Record<string, [number, number, number]> = {
    'fixed-income': [4, 1.5, 0],    // Right of globe
    'alternatives': [0, -0.5, -3],   // Below and behind
  };

  const center = clusterCenters[assetClass] || [4, 1.5, 0];
  const radius = 1.2;
  const rotationSpeed = 0.03;

  particles.forEach((particle, index) => {
    const angle = (index / particles.length) * Math.PI * 2 + time * rotationSpeed;
    const distanceFromCenter = radius * (0.3 + (index % 3) * 0.25);
    const heightOffset = (Math.sin(index * 0.7) * 0.3);

    const position: [number, number, number] = [
      center[0] + Math.cos(angle) * distanceFromCenter,
      center[1] + heightOffset,
      center[2] + Math.sin(angle) * distanceFromCenter,
    ];

    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Group particles by whether they have geographic positions or not
 */
export function groupParticlesByGeography(particles: Particle[]): {
  geographic: Particle[];
  nonGeographic: Particle[];
} {
  const geographic: Particle[] = [];
  const nonGeographic: Particle[] = [];

  particles.forEach((particle) => {
    // Equities are geographic, others are not
    if (particle.assetClass === 'equities') {
      geographic.push(particle);
    } else {
      nonGeographic.push(particle);
    }
  });

  return { geographic, nonGeographic };
}

// Helper functions

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
