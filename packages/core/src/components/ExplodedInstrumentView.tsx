/**
 * ExplodedInstrumentView - Shows an instrument's return contributions
 *
 * When an instrument is clicked, it moves to center and becomes vertical,
 * then separates into its contributing parts (equilibrium return, signals, etc.)
 * Mouse scroll/slider adjusts spacing between contribution blocks.
 *
 * All blocks have the same width - only HEIGHT differs based on contribution value.
 * Selected block shows a holographic sci-fi info panel.
 */

import { useMemo, useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useNavigationStore } from '../store';
import type { DataNode } from '../types';
import * as THREE from 'three';

// Track if holographic panel is being hovered (for scroll behavior)
let isHoloPanelHovered = false;

// Layout constants
const BARS_X_CENTER = 0;    // Center position (initial state)
const BARS_X_LEFT = -4;     // Left side (when panel is shown)
const BASE_Y = 2.0;         // Vertical center
const BLOCK_WIDTH = 1.2;    // Fixed width for all blocks
const BLOCK_DEPTH = 0.5;
const MIN_HEIGHT = 0.15;
const HEIGHT_SCALE = 3;     // Scale factor for height based on value

// Holographic panel position - center-right area
const HOLO_PANEL_X = 1.5;   // Between bars and sidebar
const HOLO_PANEL_Y = 2.2;
const HOLO_PANEL_Z = 0;

// Color palette for contribution types
const CONTRIBUTION_COLORS = [
  '#3b82f6', // Equilibrium - blue
  '#22c55e', // Momentum - green
  '#f59e0b', // Value - amber
  '#8b5cf6', // Quality - violet
  '#ec4899', // Analyst Views - pink
  '#06b6d4', // Macro - cyan
];

function getContributionColor(index: number): string {
  return CONTRIBUTION_COLORS[index % CONTRIBUTION_COLORS.length];
}

interface ExplodedInstrumentViewProps {
  instrument: DataNode;
  onClose: () => void;
}

export function ExplodedInstrumentView({ instrument, onClose }: ExplodedInstrumentViewProps) {
  const { gl } = useThree();
  const contributionSpacing = useNavigationStore((s) => s.contributionSpacing);
  const selectedContributionId = useNavigationStore((s) => s.selectedContributionId);
  const selectContribution = useNavigationStore((s) => s.selectContribution);
  const setContributionSpacing = useNavigationStore((s) => s.setContributionSpacing);
  const viewMode = useNavigationStore((s) => s.viewMode);

  const contributions = instrument.children || [];

  // Attach wheel event listener to canvas - only adjust spacing when NOT hovering panel
  useEffect(() => {
    const canvas = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      // If hovering over the holographic panel, let it scroll naturally
      if (isHoloPanelHovered) {
        return; // Don't prevent default - let the panel scroll
      }
      e.preventDefault();
      const delta = e.deltaY * 0.002;
      setContributionSpacing(contributionSpacing - delta);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [gl, contributionSpacing, setContributionSpacing]);

  // Determine if bars should be on left (panel visible) or center
  const hasSelection = selectedContributionId !== null;
  const targetX = hasSelection ? BARS_X_LEFT : BARS_X_CENTER;

  // Animate the X position of the bar group
  const { barsX } = useSpring({
    barsX: targetX,
    config: { tension: 120, friction: 20 },
  });

  // Calculate positions for contribution blocks - all same width, height varies
  const blockData = useMemo(() => {
    const count = contributions.length;

    // Calculate heights based on value
    const heights = contributions.map((contrib) => {
      const absValue = Math.abs(contrib.value);
      return MIN_HEIGHT + absValue * HEIGHT_SCALE;
    });

    // Calculate total stack height
    const totalHeight = heights.reduce((sum, h) => sum + h, 0) + (count - 1) * contributionSpacing;

    // Stack from bottom up - X position handled by animated group
    let yOffset = BASE_Y - totalHeight / 2;

    return contributions.map((contrib, index) => {
      const height = heights[index];
      const position: [number, number, number] = [0, yOffset + height / 2, 0];
      yOffset += height + contributionSpacing;

      return {
        node: contrib,
        position,
        height,
        index,
      };
    });
  }, [contributions, contributionSpacing]);

  // Find selected contribution for 3D card
  const selectedContribution = useMemo(() => {
    if (!selectedContributionId) return null;
    const data = blockData.find((b) => b.node.id === selectedContributionId);
    if (!data) return null;
    return {
      ...data,
      node: data.node,
    };
  }, [selectedContributionId, blockData]);

  // Animation for the whole group
  const { scale } = useSpring({
    scale: 1,
    from: { scale: 0.5 },
    config: config.gentle,
  });

  return (
    <animated.group scale={scale}>
      {/* Back button area - click anywhere behind to close */}
      <mesh position={[0, 2, -3]} onClick={onClose}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Animated container for bars - moves from center to left when panel opens */}
      <animated.group position-x={barsX}>
        {/* Instrument name header - above the bars */}
        <Html position={[0, BASE_Y + 2.2, 0]} center>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#f1f5f9',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {instrument.label}
            {viewMode === 'contribution' && ' (Contribution)'}
          </div>
        </Html>

        {/* Instructions - below bars */}
        <Html position={[0, 0.1, 0]} center>
          <div
            style={{
              color: '#64748b',
              fontSize: '10px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Scroll to adjust • Click for details
          </div>
        </Html>

        {/* Contribution blocks - all same width, height varies */}
        {blockData.map(({ node, position, height, index }) => {
          const isSelected = selectedContributionId === node.id;
          const color = getContributionColor(index);

          return (
            <ContributionBlock
              key={node.id}
              node={node}
              position={position}
              width={BLOCK_WIDTH}
              height={height}
              depth={BLOCK_DEPTH}
              color={color}
              isSelected={isSelected}
              index={index}
              onClick={() => selectContribution(isSelected ? null : node.id)}
            />
          );
        })}
      </animated.group>

      {/* Holographic Info Panel - Iron Man style, appears in center when block selected */}
      {selectedContribution && (
        <HolographicInfoPanel
          node={selectedContribution.node}
          instrument={instrument}
          position={[HOLO_PANEL_X, HOLO_PANEL_Y, HOLO_PANEL_Z]}
          onClose={() => selectContribution(null)}
        />
      )}
    </animated.group>
  );
}

interface ContributionBlockProps {
  node: DataNode;
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
  isSelected: boolean;
  index: number;
  onClick: () => void;
}

function ContributionBlock({
  node,
  position,
  width,
  height,
  depth,
  color,
  isSelected,
  index,
  onClick,
}: ContributionBlockProps) {
  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Animate position (responds to spacing changes) and height growth
  const { posY, scaleY, opacity } = useSpring({
    posY: position[1],
    scaleY: 1,
    opacity: 1,
    from: isFirstRender.current
      ? { posY: position[1], scaleY: 0, opacity: 0 }
      : undefined,
    delay: isFirstRender.current ? index * 80 : 0,
    config: config.gentle,
    onRest: () => {
      isFirstRender.current = false;
    },
  });

  // Selection highlight animation
  const { emissiveIntensity, selectionScale } = useSpring({
    emissiveIntensity: isSelected ? 0.4 : 0,
    selectionScale: isSelected ? 1.05 : 1,
    config: config.stiff,
  });

  const formatPercent = (value: number) => {
    const pct = (value * 100).toFixed(2);
    return value >= 0 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <animated.group
      position-x={position[0]}
      position-y={posY}
      position-z={position[2]}
      scale-x={selectionScale}
      scale-y={scaleY}
      scale-z={selectionScale}
    >
      {/* Main block */}
      <animated.mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <animated.meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.2}
          roughness={0.5}
        />
      </animated.mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[width + 0.04, height + 0.04, depth + 0.04]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
      )}

      {/* Label to the right */}
      <Html
        position={[width / 2 + 0.15, 0, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#e2e8f0',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: isSelected ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
          }}
        >
          <span>{node.shortLabel || node.label}</span>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
              color: node.value >= 0 ? '#4ade80' : '#f87171',
            }}
          >
            {formatPercent(node.value)}
          </span>
        </div>
      </Html>
    </animated.group>
  );
}

interface HolographicInfoPanelProps {
  node: DataNode;
  instrument: DataNode;
  position: [number, number, number];
  onClose: () => void;
}

// Animated scan line effect component - sweeps once then fades out
function ScanLines({ width, height }: { width: number; height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);
  const SWEEP_DURATION = 1.5; // seconds for the sweep to complete

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        // Initialize start time on first frame
        if (startTimeRef.current === null) {
          startTimeRef.current = clock.getElapsedTime();
        }

        const elapsed = clock.getElapsedTime() - startTimeRef.current;
        material.uniforms.time.value = elapsed;
        material.uniforms.progress.value = Math.min(1, elapsed / SWEEP_DURATION);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        transparent
        uniforms={{
          time: { value: 0 },
          progress: { value: 0 },
          color: { value: new THREE.Color('#00d4ff') },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float progress;
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            // Sweep line moves from bottom to top once
            float sweepPos = progress;
            float sweep = smoothstep(sweepPos - 0.15, sweepPos - 0.05, vUv.y) *
                          smoothstep(sweepPos + 0.05, sweepPos - 0.05, vUv.y);

            // Fade out after sweep completes
            float fadeOut = 1.0 - smoothstep(0.8, 1.0, progress);

            // Subtle scan lines that fade with the sweep
            float scanLine = sin(vUv.y * 100.0) * 0.5 + 0.5;
            float scanAlpha = scanLine * 0.02 * fadeOut;

            float alpha = sweep * 0.4 * fadeOut + scanAlpha;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function HolographicInfoPanel({ node, instrument, position, onClose }: HolographicInfoPanelProps) {
  // Animate panel appearance - dramatic entry
  const { scale, opacity, rotY } = useSpring({
    scale: 1,
    opacity: 1,
    rotY: 0,
    from: { scale: 0.3, opacity: 0, rotY: -0.3 },
    config: { tension: 200, friction: 20 },
  });

  // Pulsing glow effect
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });

  const formatPercent = (value: number) => {
    const pct = (value * 100).toFixed(2);
    return value >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const description = node.metadata?.description as string | undefined;
  const methodology = node.metadata?.methodology as string | undefined;

  // Panel dimensions
  const panelWidth = 5;
  const panelHeight = 4;

  return (
    <animated.group position={position} scale={scale} rotation-y={rotY}>
      {/* Outer glow frame */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[panelWidth + 0.3, panelHeight + 0.3]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
      </mesh>

      {/* Main panel background - dark with transparency */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial color="#050520" transparent opacity={0.85} />
      </mesh>

      {/* Scan lines overlay */}
      <ScanLines width={panelWidth} height={panelHeight} />

      {/* Edge frame - top */}
      <mesh position={[0, panelHeight / 2, 0.02]}>
        <planeGeometry args={[panelWidth, 0.02]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>
      {/* Edge frame - bottom */}
      <mesh position={[0, -panelHeight / 2, 0.02]}>
        <planeGeometry args={[panelWidth, 0.02]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>
      {/* Edge frame - left */}
      <mesh position={[-panelWidth / 2, 0, 0.02]}>
        <planeGeometry args={[0.02, panelHeight]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>
      {/* Edge frame - right */}
      <mesh position={[panelWidth / 2, 0, 0.02]}>
        <planeGeometry args={[0.02, panelHeight]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.8} />
      </mesh>

      {/* Corner accents - top left */}
      <mesh position={[-panelWidth / 2 + 0.15, panelHeight / 2 - 0.15, 0.03]}>
        <planeGeometry args={[0.3, 0.02]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-panelWidth / 2 + 0.15, panelHeight / 2 - 0.15, 0.03]}>
        <planeGeometry args={[0.02, 0.3]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      {/* Corner accents - top right */}
      <mesh position={[panelWidth / 2 - 0.15, panelHeight / 2 - 0.15, 0.03]}>
        <planeGeometry args={[0.3, 0.02]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      <mesh position={[panelWidth / 2 - 0.15, panelHeight / 2 - 0.15, 0.03]}>
        <planeGeometry args={[0.02, 0.3]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      {/* Corner accents - bottom left */}
      <mesh position={[-panelWidth / 2 + 0.15, -panelHeight / 2 + 0.15, 0.03]}>
        <planeGeometry args={[0.3, 0.02]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-panelWidth / 2 + 0.15, -panelHeight / 2 + 0.15, 0.03]}>
        <planeGeometry args={[0.02, 0.3]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      {/* Corner accents - bottom right */}
      <mesh position={[panelWidth / 2 - 0.15, -panelHeight / 2 + 0.15, 0.03]}>
        <planeGeometry args={[0.3, 0.02]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>
      <mesh position={[panelWidth / 2 - 0.15, -panelHeight / 2 + 0.15, 0.03]}>
        <planeGeometry args={[0.02, 0.3]} />
        <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} />
      </mesh>

      {/* Content using Html - positioned within panel */}
      <Html
        position={[0, 0, 0.2]}
        center
        style={{ pointerEvents: 'auto' }}
        distanceFactor={7.5}
      >
        <div
          onMouseEnter={() => { isHoloPanelHovered = true; }}
          onMouseLeave={() => { isHoloPanelHovered = false; }}
          style={{
            width: 550,
            maxHeight: 450,
            overflowY: 'auto',
            padding: 28,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'rgba(5, 5, 32, 0.95)',
            borderRadius: 10,
          }}
        >
          {/* Header section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#00d4ff',
                  marginBottom: 6,
                }}
              >
                Return Attribution
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#f1f5f9',
                  marginBottom: 4,
                  textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                }}
              >
                {node.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                }}
              >
                {instrument.label}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: 'ui-monospace, monospace',
                  color: node.value >= 0 ? '#00ffaa' : '#ff6b6b',
                  textShadow: node.value >= 0
                    ? '0 0 20px rgba(0, 255, 170, 0.5)'
                    : '0 0 20px rgba(255, 107, 107, 0.5)',
                }}
              >
                {formatPercent(node.value)}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  marginTop: 4,
                }}
              >
                contribution
              </div>
            </div>
          </div>

          {/* Description section */}
          {description && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#00d4ff',
                  marginBottom: 8,
                }}
              >
                Description
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                {description}
              </div>
            </div>
          )}

          {/* Methodology section */}
          {methodology && (
            <div
              style={{
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 6,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#00d4ff',
                  marginBottom: 8,
                }}
              >
                Methodology
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                {methodology}
              </div>
            </div>
          )}

          {/* Key Assumptions section */}
          {node.metadata?.keyAssumptions && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#00d4ff',
                  marginBottom: 8,
                }}
              >
                Key Assumptions
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                }}
              >
                {String(node.metadata.keyAssumptions)}
              </div>
            </div>
          )}

          {/* Limitations section */}
          {node.metadata?.limitations && (
            <div
              style={{
                background: 'rgba(255, 100, 100, 0.05)',
                border: '1px solid rgba(255, 100, 100, 0.2)',
                borderRadius: 6,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#ff6b6b',
                  marginBottom: 8,
                }}
              >
                Limitations
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                }}
              >
                {String(node.metadata.limitations)}
              </div>
            </div>
          )}

          {/* Additional metadata - grid of short values */}
          {node.metadata && Object.keys(node.metadata).filter(k => !['description', 'methodology', 'type', 'instrument', 'keyAssumptions', 'limitations'].includes(k)).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#00d4ff',
                  marginBottom: 12,
                }}
              >
                Model Parameters
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                }}
              >
                {Object.entries(node.metadata)
                  .filter(([key]) => !['description', 'methodology', 'type', 'instrument', 'keyAssumptions', 'limitations'].includes(key))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(0, 212, 255, 0.15)',
                        borderRadius: 4,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#64748b',
                          marginBottom: 4,
                        }}
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#f1f5f9',
                          fontFamily: typeof value === 'number' ? 'ui-monospace, monospace' : 'inherit',
                        }}
                      >
                        {typeof value === 'number'
                          ? value.toLocaleString(undefined, { maximumFractionDigits: 4 })
                          : String(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              marginTop: 20,
              width: '100%',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 6,
              padding: '10px 16px',
              color: '#00d4ff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Close Panel
          </button>
        </div>
      </Html>
    </animated.group>
  );
}
