/**
 * Galaxy Formation Calculator
 *
 * Computes positions for particles in a spiral galaxy pattern.
 * Used for Level 1 (Asset Class) visualization where particles
 * orbit in three distinct galaxy clusters.
 */

import type { Particle, GalaxyConfig, AssetClassType } from '../types';
import { GALAXY_CONFIGS, ASSET_CLASS_COLORS } from '../types/particle';

const TWO_PI = Math.PI * 2;

/**
 * Calculate particle position within a spiral galaxy
 *
 * Uses a logarithmic spiral pattern with multiple arms to create
 * a natural galaxy-like distribution.
 *
 * @param index Particle index within this galaxy
 * @param totalParticles Total particles in this galaxy
 * @param config Galaxy configuration
 * @param time Animation time for rotation
 * @returns [x, y, z] position
 */
export function calculateGalaxyPosition(
  index: number,
  totalParticles: number,
  config: GalaxyConfig,
  time: number = 0
): [number, number, number] {
  const { center, radius, armCount, armSpread, rotationSpeed } = config;

  // Determine which arm this particle belongs to
  const armIndex = index % armCount;
  const particleInArm = Math.floor(index / armCount);
  const totalInArm = Math.ceil(totalParticles / armCount);

  // Progress along the arm (0 = center, 1 = edge)
  const armProgress = totalInArm > 1 ? particleInArm / (totalInArm - 1) : 0.5;

  // Logarithmic spiral parameters
  const a = 0.3; // Initial radius offset
  const b = 0.3; // Spiral tightness

  // Angle based on arm position and arm index
  const baseAngle = (armIndex / armCount) * TWO_PI;
  const spiralAngle = armProgress * TWO_PI * 1.5; // 1.5 full turns per arm
  const angle = baseAngle + spiralAngle + time * rotationSpeed;

  // Distance from center using logarithmic spiral
  const spiralRadius = a * Math.exp(b * spiralAngle) * radius;
  const distance = Math.min(spiralRadius, radius);

  // Add some random spread within the arm
  const spreadFactor = armSpread * (0.5 + armProgress * 0.5); // More spread at edges
  const randomAngleOffset = (Math.sin(index * 12.9898 + 78.233) * 0.5) * spreadFactor;
  const randomRadiusOffset = (Math.cos(index * 43.758 + 21.123) * 0.5) * spreadFactor * 0.3;

  // Calculate 3D position
  const finalAngle = angle + randomAngleOffset;
  const finalDistance = distance * (1 + randomRadiusOffset);

  const x = center[0] + Math.cos(finalAngle) * finalDistance;
  const z = center[2] + Math.sin(finalAngle) * finalDistance;

  // Y position varies slightly based on distance from center (disk shape)
  const heightVariation = 0.2 * (1 - armProgress) * Math.sin(index * 1.414);
  const y = center[1] + heightVariation;

  return [x, y, z];
}

/**
 * Calculate positions for all particles grouped by asset class
 *
 * @param particles All particles
 * @param time Animation time
 * @returns Map of particle ID to position
 */
export function calculateGalaxyFormation(
  particles: Particle[],
  time: number = 0
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Group particles by asset class
  const grouped: Record<AssetClassType, Particle[]> = {
    'equities': [],
    'fixed-income': [],
    'alternatives': [],
  };

  particles.forEach((p) => {
    if (grouped[p.assetClass]) {
      grouped[p.assetClass].push(p);
    }
  });

  // Calculate positions for each galaxy
  (Object.keys(grouped) as AssetClassType[]).forEach((assetClass) => {
    const galaxyParticles = grouped[assetClass];
    const config = GALAXY_CONFIGS[assetClass];

    galaxyParticles.forEach((particle, index) => {
      const position = calculateGalaxyPosition(
        index,
        galaxyParticles.length,
        config,
        time
      );
      positions.set(particle.id, position);
    });
  });

  return positions;
}

/**
 * Get galaxy center position for a given asset class
 */
export function getGalaxyCenter(assetClass: AssetClassType): [number, number, number] {
  return [...GALAXY_CONFIGS[assetClass].center] as [number, number, number];
}

/**
 * Calculate "explosion" animation positions
 *
 * When transitioning from portfolio bar to galaxies, particles
 * start from the center and spiral outward.
 *
 * @param particles Particles to position
 * @param progress Animation progress (0 = center, 1 = final position)
 * @param time Animation time for rotation
 * @param explosionCenter Starting center point for explosion
 * @returns Map of particle ID to position
 */
export function calculateExplosionToGalaxy(
  particles: Particle[],
  progress: number,
  time: number = 0,
  explosionCenter: [number, number, number] = [0, 1.5, 0]
): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();

  // Get final galaxy positions
  const finalPositions = calculateGalaxyFormation(particles, time);

  // Ease function for natural motion
  const easedProgress = easeOutCubic(progress);

  particles.forEach((particle) => {
    const finalPos = finalPositions.get(particle.id);
    if (!finalPos) return;

    // Add spiral motion during explosion
    const spiralAngle = progress * Math.PI * 4; // Two full rotations
    const spiralRadius = progress * 0.5;
    const spiralOffset: [number, number, number] = [
      Math.cos(spiralAngle + particle.id.charCodeAt(5) * 0.1) * spiralRadius * (1 - progress),
      Math.sin(progress * Math.PI) * 0.5, // Arc up and down
      Math.sin(spiralAngle + particle.id.charCodeAt(5) * 0.1) * spiralRadius * (1 - progress),
    ];

    // Interpolate from center to final position with spiral
    const position: [number, number, number] = [
      lerp(explosionCenter[0], finalPos[0], easedProgress) + spiralOffset[0],
      lerp(explosionCenter[1], finalPos[1], easedProgress) + spiralOffset[1],
      lerp(explosionCenter[2], finalPos[2], easedProgress) + spiralOffset[2],
    ];

    positions.set(particle.id, position);
  });

  return positions;
}

/**
 * Calculate particle color based on asset class and position in galaxy
 *
 * @param particle The particle
 * @param galaxyIndex Index of particle within its galaxy
 * @param totalInGalaxy Total particles in galaxy
 * @returns Color string (hex)
 */
export function getParticleColor(
  particle: Particle,
  galaxyIndex: number,
  totalInGalaxy: number
): string {
  const colors = ASSET_CLASS_COLORS[particle.assetClass];
  if (!colors || colors.length === 0) return '#ffffff';

  // Interpolate color based on position (core = lighter, edge = darker)
  const colorProgress = totalInGalaxy > 1 ? galaxyIndex / (totalInGalaxy - 1) : 0.5;
  const colorIndex = Math.floor(colorProgress * (colors.length - 1));

  return colors[colorIndex];
}

/**
 * Calculate glow intensity based on particle weight and animation state
 *
 * @param particle The particle
 * @param isHovered Whether particle is hovered
 * @param isSelected Whether this asset class is selected
 * @returns Glow intensity (0-1)
 */
export function getGlowIntensity(
  particle: Particle,
  isHovered: boolean,
  isSelected: boolean
): number {
  let intensity = 0.3 + particle.weight * 0.4; // Base intensity from weight

  if (isHovered) {
    intensity = Math.min(1, intensity + 0.4);
  }

  if (isSelected) {
    intensity = Math.min(1, intensity + 0.2);
  }

  return intensity;
}

// Helper functions

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
