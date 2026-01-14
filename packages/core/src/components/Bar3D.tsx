/**
 * Bar3D - Animated 3D bar with explicit orientation
 *
 * Design principles:
 * - Length proportional to value
 * - Thickness can represent weight
 * - Proper alignment based on orientation
 * - Barrel roll animation on entry
 */

import { useMemo, useEffect, useState } from 'react';
import { animated, useSpring, config } from '@react-spring/three';
import { Html } from '@react-three/drei';

export type BarOrientation = 'vertical' | 'horizontal';

export interface Bar3DProps {
  id: string;
  label: string;
  shortLabel?: string;
  value: number;
  weight?: number;
  position: [number, number, number];
  orientation?: BarOrientation;
  length?: number;           // If not provided, calculated from value
  thickness?: number;        // Bar thickness (width/depth)
  color: string;
  opacity?: number;
  isHovered?: boolean;
  isSelected?: boolean;
  showLabel?: boolean;
  labelPosition?: 'above' | 'right' | 'left';
  animateIn?: boolean;       // Trigger barrel roll animation
  animationDelay?: number;   // Delay before animation starts (for staggering)
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

// Layout constants
const BASE_LENGTH = 2;       // Base length for 10% return
const MIN_LENGTH = 0.5;      // Minimum bar length
const MAX_LENGTH = 4;        // Maximum bar length
const MIN_THICKNESS = 0.15;  // Minimum thickness for small weights
const MAX_THICKNESS = 0.5;   // Maximum thickness

// Animation config: 250ms ease-out
const ANIM_CONFIG = {
  duration: 250,
  easing: (t: number) => 1 - Math.pow(1 - t, 3),
};

export function Bar3D({
  id: _id,
  label,
  shortLabel,
  value,
  weight = 1,
  position,
  orientation = 'vertical',
  length: customLength,
  thickness: customThickness,
  color,
  opacity = 1,
  isHovered = false,
  isSelected = false,
  showLabel = true,
  labelPosition = 'above',
  animateIn = false,
  animationDelay = 0,
  onClick,
  onHover,
}: Bar3DProps) {
  // Track if barrel roll animation should play
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (animateIn) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, animationDelay);
      return () => clearTimeout(timer);
    }
  }, [animateIn, animationDelay]);
  // Calculate dimensions with safeguards
  const dimensions = useMemo(() => {
    // Length proportional to value (10% = BASE_LENGTH)
    let rawLength = customLength ??
      Math.abs(value) * BASE_LENGTH / 0.1;
    // Ensure valid length
    const calculatedLength = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH,
      isFinite(rawLength) ? rawLength : MIN_LENGTH));

    // Thickness varies with weight (normalized to 0-1 range)
    const weightFactor = Math.max(0.1, Math.min(1, isFinite(weight) ? weight : 0.5));
    const calculatedThickness = customThickness ??
      MIN_THICKNESS + (MAX_THICKNESS - MIN_THICKNESS) * Math.sqrt(weightFactor);

    // Final safeguard - ensure all values are valid
    const safeLength = isFinite(calculatedLength) ? calculatedLength : MIN_LENGTH;
    const safeThickness = isFinite(calculatedThickness) ? calculatedThickness : MIN_THICKNESS;

    if (orientation === 'horizontal') {
      return {
        width: safeLength,
        height: safeThickness,
        depth: safeThickness,
        // Offset so bar grows from left edge
        offsetX: safeLength / 2,
        offsetY: 0,
        offsetZ: 0,
      };
    } else {
      return {
        width: safeThickness,
        height: safeLength,
        depth: safeThickness,
        // Offset so bar grows from bottom
        offsetX: 0,
        offsetY: safeLength / 2,
        offsetZ: 0,
      };
    }
  }, [value, weight, orientation, customLength, customThickness]);

  // Animated properties
  const springs = useSpring({
    opacity: opacity,
    emissive: isSelected ? 0.3 : isHovered ? 0.15 : 0,
    config: ANIM_CONFIG,
  });

  // Barrel roll animation - rotate around the bar's length axis
  const rollSpring = useSpring({
    rotation: shouldAnimate ? 0 : Math.PI * 2,
    config: {
      ...config.wobbly,
      duration: 600,
    },
  });

  // Grow animation - bar grows from 0 to full size along its length axis
  const growSpring = useSpring({
    lengthScale: shouldAnimate ? 1 : 0,
    widthScale: shouldAnimate ? 1 : 0.3,
    config: {
      tension: 60,   // Lower tension = slower animation
      friction: 14,  // Lower friction = more bounce/overshoot
      mass: 1.5,     // Higher mass = slower, more weight
    },
  });

  // Label position based on orientation and preference
  const labelPos = useMemo((): [number, number, number] => {
    const { width, height } = dimensions;
    if (orientation === 'horizontal') {
      if (labelPosition === 'right') {
        return [width + 0.3, 0, 0];
      }
      return [width / 2, height + 0.3, 0]; // Above
    } else {
      return [0, height + 0.3, 0]; // Above
    }
  }, [orientation, dimensions, labelPosition]);

  const displayLabel = shortLabel || label;
  const valuePercent = (value * 100).toFixed(1);

  // Determine rotation axis based on orientation
  // Horizontal bars roll around X axis, vertical bars roll around Y axis
  const rotationAxis = orientation === 'horizontal' ? 'rotation-x' : 'rotation-y';

  // Build scale object based on orientation and animation state
  const scaleProps = useMemo(() => {
    if (!animateIn) {
      return { scale: 1 };
    }
    // For vertical bars, animate height (scale-y); for horizontal, animate width (scale-x)
    if (orientation === 'vertical') {
      return {
        'scale-x': growSpring.widthScale,
        'scale-y': growSpring.lengthScale,
        'scale-z': growSpring.widthScale,
      };
    } else {
      return {
        'scale-x': growSpring.lengthScale,
        'scale-y': growSpring.widthScale,
        'scale-z': growSpring.widthScale,
      };
    }
  }, [animateIn, orientation, growSpring]);

  return (
    <group position={position}>
      {/* The bar - offset to grow from origin, with barrel roll and grow animation */}
      <animated.mesh
        position={[dimensions.offsetX, dimensions.offsetY, dimensions.offsetZ]}
        {...{ [rotationAxis]: animateIn ? rollSpring.rotation : 0 }}
        {...scaleProps}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (onClick) document.body.style.cursor = 'pointer';
          onHover?.(true);
        }}
        onPointerOut={() => {
          if (onClick) document.body.style.cursor = 'auto';
          onHover?.(false);
        }}
      >
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <animated.meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.7}
          transparent
          opacity={springs.opacity}
          emissive={color}
          emissiveIntensity={springs.emissive}
        />
      </animated.mesh>

      {/* Label */}
      {showLabel && opacity > 0.3 && (
        <Html
          position={[
            dimensions.offsetX + labelPos[0] - (orientation === 'horizontal' ? dimensions.width / 2 : 0),
            dimensions.offsetY + labelPos[1] - (orientation === 'vertical' ? dimensions.height / 2 : 0),
            labelPos[2],
          ]}
          center={labelPosition !== 'right'}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              color: '#e2e8f0',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{displayLabel}</span>
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 600,
                color: value >= 0 ? '#4ade80' : '#f87171',
              }}
            >
              {value >= 0 ? '+' : ''}{valuePercent}%
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
