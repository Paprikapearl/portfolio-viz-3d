/**
 * Van der Grinten IV Map Projection
 *
 * A compromise projection that provides a good balance between
 * area and shape distortion, with a distinctive curved meridian pattern.
 *
 * Used for the globe "unfolding" animation where the sphere
 * transitions to a flat 2D map view.
 */

import type { LatLong } from '../types';

const PI = Math.PI;
const HALF_PI = PI / 2;
const EPSILON = 1e-10;

/**
 * Van der Grinten IV projection
 *
 * Converts geographic coordinates (lat/long in degrees) to
 * projected X/Y coordinates in the range [-PI, PI] for X
 * and [-PI/2, PI/2] for Y.
 *
 * Reference: Snyder, J.P., Map Projections—A Working Manual
 */
export function vanDerGrinten4(lat: number, long: number): [x: number, y: number] {
  // Convert degrees to radians
  const phi = (lat * PI) / 180;    // Latitude in radians
  const lambda = (long * PI) / 180; // Longitude in radians

  // Handle edge cases at the poles
  if (Math.abs(Math.abs(phi) - HALF_PI) < EPSILON) {
    return [0, phi > 0 ? HALF_PI : -HALF_PI];
  }

  // Handle equator case
  if (Math.abs(phi) < EPSILON) {
    return [lambda, 0];
  }

  // Handle central meridian
  if (Math.abs(lambda) < EPSILON) {
    return [0, phi];
  }

  // Van der Grinten IV formulas
  const absLambda = Math.abs(lambda);

  // Intermediate values
  const theta = Math.asin(Math.abs(2 * phi / PI));
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinThetaSq = sinTheta * sinTheta;
  const cosThetaSq = cosTheta * cosTheta;

  // Parameter B
  const B = absLambda / PI;
  const BSq = B * B;

  // Compute denominator
  const D = 1 + BSq * (1 - sinThetaSq);

  // Handle potential division issues
  if (Math.abs(D) < EPSILON) {
    return [lambda > 0 ? PI : -PI, phi > 0 ? HALF_PI : -HALF_PI];
  }

  // Compute x coordinate
  let x = B * (1 + Math.sqrt(1 - sinThetaSq * (1 + BSq) / (1 + BSq * cosThetaSq)));
  x = x * PI / (1 + BSq / cosThetaSq);

  // Compute y coordinate
  let y = sinTheta * PI / 2;

  // Alternative Van der Grinten IV calculation for better accuracy
  // This is a simplified approach that captures the essence of the projection
  const A = 0.5 * absLambda / PI;
  const G = cosThetaSq / (sinTheta + cosThetaSq - 1 + EPSILON);

  const P = G * (2 / sinTheta - 1);
  const Q = A * A + G;

  const P2 = P * P;
  const Q2 = Q * Q;
  const A2 = A * A;

  // Quadratic solution
  const discriminant = P2 + A2 - Q2;
  if (discriminant < 0) {
    // Fallback for edge cases
    x = absLambda;
    y = sinTheta * HALF_PI;
  } else {
    const sqrtDisc = Math.sqrt(discriminant);
    x = PI * (A * (G - P2) + sqrtDisc * P) / (P2 + A2 + EPSILON);
    y = PI * (P * (G - A2) - A * sqrtDisc) / (P2 + A2 + EPSILON);
  }

  // Apply signs based on original coordinates
  if (lambda < 0) x = -x;
  if (phi < 0) y = -y;

  // Clamp to valid range
  x = Math.max(-PI, Math.min(PI, x));
  y = Math.max(-HALF_PI, Math.min(HALF_PI, y));

  return [x, y];
}

/**
 * Convert lat/long to 3D sphere position
 *
 * @param lat Latitude in degrees (-90 to 90)
 * @param long Longitude in degrees (-180 to 180)
 * @param radius Sphere radius
 * @returns [x, y, z] position on sphere
 */
export function latLongToSphere(
  lat: number,
  long: number,
  radius: number = 1
): [number, number, number] {
  const phi = (90 - lat) * (PI / 180);      // Polar angle from top
  const theta = (long + 180) * (PI / 180);   // Azimuthal angle

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

/**
 * Convert Van der Grinten IV projection coordinates to 3D position
 *
 * Positions the flat map in 3D space at a given Y level
 *
 * @param projX Projected X coordinate
 * @param projY Projected Y coordinate
 * @param yLevel Y position for the flat map
 * @param scale Scale factor for the projection
 * @returns [x, y, z] position in 3D space
 */
export function projectionTo3D(
  projX: number,
  projY: number,
  yLevel: number = 0,
  scale: number = 1
): [number, number, number] {
  // Map projection coordinates to 3D space
  // X maps to X, Y maps to Z, yLevel is constant Y
  return [projX * scale, yLevel, -projY * scale];
}

/**
 * Interpolate between sphere position and projected position
 *
 * Used for the "unfolding" animation where the globe transitions
 * to a flat map view.
 *
 * @param latLong Geographic coordinates
 * @param progress Animation progress (0 = sphere, 1 = flat projection)
 * @param sphereRadius Radius of the sphere
 * @param projectionConfig Configuration for the flat projection
 * @returns Interpolated [x, y, z] position
 */
export function interpolateSphereToProjection(
  latLong: LatLong,
  progress: number,
  sphereRadius: number = 2.5,
  projectionConfig: {
    yLevel: number;
    scale: number;
    center: [number, number, number];
  } = { yLevel: 1.5, scale: 1, center: [0, 0, 0] }
): [number, number, number] {
  // Get sphere position
  const spherePos = latLongToSphere(latLong.lat, latLong.long, sphereRadius);

  // Get projected position
  const [projX, projY] = vanDerGrinten4(latLong.lat, latLong.long);
  const flatPos = projectionTo3D(
    projX,
    projY,
    projectionConfig.yLevel,
    projectionConfig.scale
  );

  // Offset by center
  flatPos[0] += projectionConfig.center[0];
  flatPos[1] += projectionConfig.center[1];
  flatPos[2] += projectionConfig.center[2];

  // Use smooth easing for natural animation
  const t = smoothStep(progress);

  // Interpolate between positions
  return [
    lerp(spherePos[0], flatPos[0], t),
    lerp(spherePos[1], flatPos[1], t),
    lerp(spherePos[2], flatPos[2], t),
  ];
}

/**
 * Smooth step interpolation (ease in-out)
 */
function smoothStep(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generate outline points for a continent on the sphere
 *
 * @param coordinates Array of [lat, long] pairs defining the continent outline
 * @param radius Sphere radius
 * @returns Array of [x, y, z] positions
 */
export function continentToSpherePoints(
  coordinates: Array<[number, number]>,
  radius: number = 2.5
): Array<[number, number, number]> {
  return coordinates.map(([lat, long]) => latLongToSphere(lat, long, radius));
}

/**
 * Generate outline points for a continent in projected space
 *
 * @param coordinates Array of [lat, long] pairs defining the continent outline
 * @param scale Scale factor
 * @param yLevel Y position
 * @returns Array of [x, y, z] positions
 */
export function continentToProjectedPoints(
  coordinates: Array<[number, number]>,
  scale: number = 1,
  yLevel: number = 0
): Array<[number, number, number]> {
  return coordinates.map(([lat, long]) => {
    const [projX, projY] = vanDerGrinten4(lat, long);
    return projectionTo3D(projX, projY, yLevel, scale);
  });
}
