/**
 * Nebula Formation Calculator
 *
 * Computes positions for particles in a loose 3D cloud where
 * Y-axis position correlates with return value. Used for
 * Level 3 (Instrument Detail) visualization.
 */

import type { Particle, NebulaConfig, GeographicRegion } from '../types';
import { NEBULA_CONFIG } from '../types/particle';

/**
 * Calculate particle position within the nebula
 *
 * @param particle The particle
 * @param index Particle index
 * @param totalParticles Total particles in nebula
 * @param config Nebula configuration
 * @param time Animation time for subtle motion
 * @returns [x, y, z] position
 */
export function calculateNebulaPosition(
  particle: Particle,
  index: number,
  totalParticles: number,
  config: NebulaConfig = NEBULA_CONFIG,
  time: number = 0
): [number, number, number] {
  const { center, spread, yAxisMetric } = config;

  // Y position based on value or weight
  const metricValue = yAxisMetric === 'value' ? particle.value : particle.weight;
  const normalizedMetric = normalizeValue(metricValue, -0.05, 0.20); // Normalize to 0-1 range
  const yOffset = (normalizedMetric - 0.5) * spread[1] * 2; // Center around 0

  // X position based on index with some randomization
  const xBase = ((index / (totalParticles - 1 || 1)) - 0.5) * spread[0] * 2;
  const xJitter = Math.sin(index * 2.4 + particle.id.charCodeAt(6) * 0.1) * spread[0] * 0.2;

  // Z position with depth variation
  const zBase = (Math.cos(index * 1.7 + 0.3) * 0.5) * spread[2];
  const zJitter = Math.cos(index * 3.1 + particle.id.charCodeAt(7) * 0.1) * spread[2] * 0.3;

  // Add subtle floating motion over time
  const floatX = Math.sin(time * 0.5 + index * 0.3) * 0.05;
  const floatY = Math.cos(time * 0.4 + index * 0.5) * 0.08;
  const floatZ = Math.sin(time * 0.3 + index * 0.7) * 0.03;

  return [
    center[0] + xBase + xJitter + floatX,
    center[1] + yOffset + floatY,
    center[2] + zBase + zJitter + floatZ,
  ];
}

/**
 * Calculate positions for all particles in the nebula
 *
 * @param particles All particles to position
 * @param config Nebula configuration
 * @param time Animation time
 * @returns Map of particle ID to position
 */
export function calculateNebulaFormation(
  particles: Particle[],
  config: NebulaConfig = NEBULA_CONFIG,
  time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Sort by value for better visual organization (high returns at top)
  const sortedParticles = [...particles].sort((a, b) => b.value - a.value);

  sortedParticles.forEach((particle, index) => {
    const position = calculateNebulaPosition(
      particle,
      index,
      sortedParticles.length,
      config,
      time
    );
    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Calculate transition from globe/projection to nebula
 *
 * Particles spread out from their geographic positions into
 * the nebula cloud formation.
 *
 * @param particles Particles to position
 * @param startPositions Starting positions (from globe)
 * @param progress Animation progress (0 = start, 1 = nebula)
 * @param selectedRegion Region being expanded
 * @param time Animation time
 * @returns Map of particle ID to position
 */
export function calculateGlobeToNebula(
  particles: Particle[],
  startPositions: Map<string, [number, number, number]>,
  progress: number,
  selectedRegion: GeographicRegion | null = null,
  time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Filter to particles in selected region (if specified)
  const relevantParticles = selectedRegion
    ? particles.filter((p) => p.region === selectedRegion)
    : particles;

  // Calculate nebula positions for region-specific config
  const nebulaConfig: NebulaConfig = {
    ...NEBULA_CONFIG,
    center: getRegionNebulaCenter(selectedRegion),
  };

  const nebulaPositions = calculateNebulaFormation(relevantParticles, nebulaConfig, time);

  // Eased progress for smooth animation
  const easedProgress = easeOutQuart(progress);

  relevantParticles.forEach((particle) => {
    const startPos = startPositions.get(particle.id);
    const endPos = nebulaPositions.get(particle.id);

    if (!startPos || !endPos) return;

    // Add "spreading" effect - particles move outward as they transition
    const spreadFactor = Math.sin(progress * Math.PI) * 0.5;
    const spreadDirection: [number, number, number] = [
      (Math.random() - 0.5) * spreadFactor,
      (Math.random() - 0.5) * spreadFactor,
      (Math.random() - 0.5) * spreadFactor,
    ];

    const position: [number, number, number] = [
      lerp(startPos[0], endPos[0], easedProgress) + spreadDirection[0],
      lerp(startPos[1], endPos[1], easedProgress) + spreadDirection[1],
      lerp(startPos[2], endPos[2], easedProgress) + spreadDirection[2],
    ];

    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Calculate "pull out" animation for selected particle
 *
 * When a particle is selected in the nebula, it moves forward
 * and grows before transitioning to the exploded view.
 *
 * @param particles All particles
 * @param nebulaPositions Current nebula positions
 * @param selectedParticleId ID of selected particle
 * @param progress Animation progress (0 = normal, 1 = pulled out)
 * @returns Map of particle ID to position
 */
export function calculateParticlePullOut(
  particles: Particle[],
  nebulaPositions: Map<string, [number, number, number]>,
  selectedParticleId: string,
  progress: number
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  const easedProgress = easeOutCubic(progress);

  particles.forEach((particle) => {
    const currentPos = nebulaPositions.get(particle.id);
    if (!currentPos) return;

    if (particle.id === selectedParticleId) {
      // Selected particle moves forward and centers
      const targetPos: [number, number, number] = [0, 2.5, 3]; // Center, elevated, forward

      positions.set(particle.id, [
        lerp(currentPos[0], targetPos[0], easedProgress),
        lerp(currentPos[1], targetPos[1], easedProgress),
        lerp(currentPos[2], targetPos[2], easedProgress),
      ]);
    } else {
      // Other particles fade back
      const fadeBackDistance = easedProgress * 2;

      positions.set(particle.id, [
        currentPos[0],
        currentPos[1],
        currentPos[2] - fadeBackDistance,
      ]);
    }
  });

  return positions;
}

/**
 * Get nebula center position based on selected region
 */
function getRegionNebulaCenter(region: GeographicRegion | null): [number, number, number] {
  if (!region) return NEBULA_CONFIG.center;

  // Offset nebula based on region to maintain visual continuity
  const regionOffsets: Record<GeographicRegion, [number, number, number]> = {
    'north-america': [-1, 1.5, 0],
    'europe': [0, 1.5, 0],
    'asia': [1, 1.5, 0],
    'emerging-markets': [0, 1.5, 0.5],
    'global': [0, 1.5, 0],
    'unknown': [0, 1.5, 0],
  };

  return regionOffsets[region] || NEBULA_CONFIG.center;
}

/**
 * Calculate particle size for nebula view based on weight
 *
 * @param particle The particle
 * @param baseSize Base particle size
 * @param isHovered Whether particle is hovered
 * @returns Particle size
 */
export function getNebulaParticleSize(
  particle: Particle,
  baseSize: number = 0.15,
  isHovered: boolean = false
): number {
  // Size based on weight (contribution to portfolio)
  const weightFactor = 0.5 + particle.weight * 1.5;
  let size = baseSize * weightFactor;

  if (isHovered) {
    size *= 1.3; // Grow on hover
  }

  return Math.max(0.08, Math.min(0.4, size)); // Clamp size
}

/**
 * Get particle opacity based on value (higher returns more visible)
 */
export function getNebulaParticleOpacity(
  particle: Particle,
  isHovered: boolean = false,
  isFadingBack: boolean = false
): number {
  if (isFadingBack) {
    return 0.2;
  }

  // Base opacity from value
  const normalizedValue = normalizeValue(particle.value, -0.05, 0.20);
  let opacity = 0.5 + normalizedValue * 0.5;

  if (isHovered) {
    opacity = 1;
  }

  return Math.max(0.3, Math.min(1, opacity));
}

/**
 * Generate label position for a particle in the nebula
 * Labels appear slightly to the right and above the particle
 */
export function getLabelPosition(
  particlePosition: [number, number, number],
  particleSize: number
): [number, number, number] {
  return [
    particlePosition[0] + particleSize + 0.2,
    particlePosition[1] + particleSize * 0.5,
    particlePosition[2],
  ];
}

// Helper functions

function normalizeValue(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
