/**
 * Particle Shaders
 *
 * Custom shaders for rendering particles with glow effects,
 * smooth transitions, and proper depth handling.
 */

/**
 * Vertex shader for instanced particle rendering
 *
 * Uses instance attributes for position, color, size, and opacity.
 * Supports billboarding to always face the camera.
 */
export const particleVertexShader = /* glsl */ `
  // Instance attributes
  attribute vec3 instancePosition;
  attribute vec3 instanceColor;
  attribute float instanceSize;
  attribute float instanceOpacity;
  attribute float instanceGlow;

  // Varyings to pass to fragment shader
  varying vec3 vColor;
  varying float vOpacity;
  varying float vGlow;
  varying vec2 vUv;

  void main() {
    vColor = instanceColor;
    vOpacity = instanceOpacity;
    vGlow = instanceGlow;
    vUv = uv;

    // Billboard transformation - make particle face camera
    vec4 mvPosition = modelViewMatrix * vec4(instancePosition, 1.0);

    // Scale based on instance size and apply billboarding
    vec3 billboardPos = position * instanceSize;

    // Apply billboard offset
    mvPosition.xyz += billboardPos;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment shader for particle rendering
 *
 * Creates a soft circular particle with glow effect.
 * Uses smooth falloff for antialiasing.
 */
export const particleFragmentShader = /* glsl */ `
  uniform float uTime;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vGlow;
  varying vec2 vUv;

  void main() {
    // Calculate distance from center (0.5, 0.5)
    vec2 center = vec2(0.5);
    float dist = length(vUv - center) * 2.0;

    // Soft circle with smooth falloff
    float alpha = 1.0 - smoothstep(0.4, 1.0, dist);

    // Glow effect - additional outer ring
    float glowAlpha = (1.0 - smoothstep(0.3, 1.0, dist)) * vGlow * 0.5;

    // Combine core and glow
    float finalAlpha = alpha + glowAlpha;

    // Apply opacity
    finalAlpha *= vOpacity;

    // Discard nearly transparent pixels for performance
    if (finalAlpha < 0.01) discard;

    // Brighten color towards center
    vec3 finalColor = vColor;
    float brightness = 1.0 + (1.0 - dist) * 0.3;
    finalColor *= brightness;

    // Add slight color variation based on time for shimmer
    float shimmer = sin(uTime * 2.0 + vUv.x * 10.0) * 0.05 + 1.0;
    finalColor *= shimmer;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

/**
 * Simple point sprite vertex shader
 * Alternative to instanced mesh for simpler particle rendering
 */
export const pointSpriteVertexShader = /* glsl */ `
  attribute float size;
  attribute vec3 customColor;
  attribute float opacity;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = customColor;
    vOpacity = opacity;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Simple point sprite fragment shader
 */
export const pointSpriteFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    // Circular point with soft edge
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center) * 2.0;

    float alpha = 1.0 - smoothstep(0.5, 1.0, dist);
    alpha *= vOpacity;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

/**
 * Trail/path vertex shader for showing particle movement
 */
export const trailVertexShader = /* glsl */ `
  attribute float alpha;
  varying float vAlpha;

  void main() {
    vAlpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Trail/path fragment shader
 */
export const trailFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * 0.5);
  }
`;

/**
 * Glow post-processing vertex shader (for bloom effect)
 */
export const glowVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Glow post-processing fragment shader (simple blur)
 */
export const glowFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uBlurAmount;

  varying vec2 vUv;

  void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;

    // 5x5 blur kernel
    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2 offset = vec2(x, y) * uBlurAmount / uResolution;
        float weight = 1.0 - length(vec2(x, y)) / 3.0;
        color += texture2D(uTexture, vUv + offset) * weight;
        total += weight;
      }
    }

    gl_FragColor = color / total;
  }
`;

/**
 * Shader uniforms type definitions for TypeScript
 */
export interface ParticleUniforms {
  uTime: { value: number };
}

export interface GlowUniforms {
  uTexture: { value: THREE.Texture | null };
  uResolution: { value: [number, number] };
  uBlurAmount: { value: number };
}

export interface TrailUniforms {
  uColor: { value: [number, number, number] };
}

// Re-export for convenience
import * as THREE from 'three';
export { THREE };
