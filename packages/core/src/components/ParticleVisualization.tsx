/**
 * ParticleVisualization Component
 *
 * Unified component that orchestrates the particle-based visualization
 * for Levels 1-3 (Galaxy, Globe, Nebula views).
 *
 * Integrates with the navigation store to determine current view
 * and handles transitions between formations.
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigationStore } from '../store/navigationStore';
import {
  useParticleStore,
  useParticles,
  useFormationState,
  getTransitionDuration,
} from '../store/particleStore';
import type { DataNode, FormationType, AssetClassType, GeographicRegion } from '../types';
import { ParticleSystem } from './ParticleSystem';
import { ContinentOutlines } from './ContinentOutlines';

interface ParticleVisualizationProps {
  /** Callback when a node is selected */
  onNodeSelect?: (node: DataNode, level: number) => void;
}

/**
 * Map navigation level to formation type
 */
function levelToFormation(level: number): FormationType {
  switch (level) {
    case 1:
      return 'galaxy';
    case 2:
      return 'globe';
    case 3:
      return 'nebula';
    default:
      return 'galaxy';
  }
}

/**
 * Get asset class type from node label
 */
function getAssetClassFromNode(node: DataNode): AssetClassType | null {
  const label = node.label.toLowerCase();
  if (label.includes('equit')) return 'equities';
  if (label.includes('fixed') || label.includes('income') || label.includes('bond')) {
    return 'fixed-income';
  }
  if (label.includes('alt')) return 'alternatives';
  return null;
}

/**
 * Get geographic region from node
 */
function getRegionFromNode(node: DataNode): GeographicRegion | null {
  if (node.region) return node.region;

  const label = node.label.toLowerCase();
  if (label.includes('us') || label.includes('north america')) return 'north-america';
  if (label.includes('europ')) return 'europe';
  if (label.includes('asia')) return 'asia';
  if (label.includes('emerg')) return 'emerging-markets';

  return null;
}

/**
 * Main ParticleVisualization component
 */
export function ParticleVisualization({
  onNodeSelect,
}: ParticleVisualizationProps) {
  // Navigation store state
  const currentLevel = useNavigationStore((s) => s.currentLevel);
  const selectionPath = useNavigationStore((s) => s.selectionPath);
  const rootNodes = useNavigationStore((s) => s.rootNodes);
  const selectNode = useNavigationStore((s) => s.selectNode);
  const explodeInstrument = useNavigationStore((s) => s.explodeInstrument);
  const animationPhase = useNavigationStore((s) => s.animationPhase);
  const setAnimationPhase = useNavigationStore((s) => s.setAnimationPhase);
  const completeAnimation = useNavigationStore((s) => s.completeAnimation);

  // Particle store state and actions
  const particles = useParticles();
  const formationState = useFormationState();
  const initializeParticles = useParticleStore((s) => s.initialize);
  const startTransition = useParticleStore((s) => s.startTransition);
  const updateTransitionProgress = useParticleStore((s) => s.updateTransitionProgress);
  const completeTransition = useParticleStore((s) => s.completeTransition);
  const selectGalaxy = useParticleStore((s) => s.selectGalaxy);
  const selectRegion = useParticleStore((s) => s.selectRegion);
  const selectParticle = useParticleStore((s) => s.selectParticle);

  // Initialize particles when root nodes are available
  useEffect(() => {
    if (rootNodes.length > 0 && particles.length === 0) {
      // Find the selected portfolio (first one in path, or first in list)
      const selectedPortfolio = selectionPath.length > 0
        ? selectionPath[0].node
        : rootNodes[0];

      if (selectedPortfolio) {
        initializeParticles([selectedPortfolio]);
      }
    }
  }, [rootNodes, selectionPath, particles.length, initializeParticles]);

  // Sync formation with navigation level
  useEffect(() => {
    if (currentLevel >= 1 && currentLevel <= 3) {
      const targetFormation = levelToFormation(currentLevel);

      if (formationState.currentFormation !== targetFormation) {
        // Start transition to new formation
        startTransition(targetFormation);
      }
    }
  }, [currentLevel, formationState.currentFormation, startTransition]);

  // Update selected galaxy/region based on selection path
  useEffect(() => {
    if (currentLevel === 2 && selectionPath.length >= 2) {
      // At Level 2, we've selected an asset class
      const assetClassNode = selectionPath[1]?.node;
      if (assetClassNode) {
        const assetClass = getAssetClassFromNode(assetClassNode);
        selectGalaxy(assetClass);
      }
    }

    if (currentLevel === 3 && selectionPath.length >= 3) {
      // At Level 3, we've selected a market/region
      const regionNode = selectionPath[2]?.node;
      if (regionNode) {
        const region = getRegionFromNode(regionNode);
        selectRegion(region);
      }
    }
  }, [currentLevel, selectionPath, selectGalaxy, selectRegion]);

  // Handle navigation animation phases (same as SelectionView)
  // This is needed to advance the navigation state machine when clicking particles
  useEffect(() => {
    if (animationPhase === 'selecting') {
      const timer = setTimeout(() => setAnimationPhase('moving'), 200);
      return () => clearTimeout(timer);
    }

    if (animationPhase === 'moving') {
      const timer = setTimeout(() => setAnimationPhase('splitting'), 300);
      return () => clearTimeout(timer);
    }

    if (animationPhase === 'splitting') {
      const timer = setTimeout(() => completeAnimation(), 400);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setAnimationPhase, completeAnimation]);

  // Handle transition animation
  useFrame((_, delta) => {
    if (formationState.isTransitioning) {
      const duration = getTransitionDuration(
        formationState.currentFormation,
        formationState.targetFormation
      );

      const progressDelta = (delta * 1000) / duration;
      const newProgress = formationState.transitionProgress + progressDelta;

      if (newProgress >= 1) {
        completeTransition();
      } else {
        updateTransitionProgress(newProgress);
      }
    }
  });

  // Handle particle click
  const handleParticleClick = useCallback(
    (particle: typeof particles[0]) => {
      // Block clicks during animation
      if (animationPhase !== 'idle') return;

      if (currentLevel === 1) {
        // At galaxy level, clicking a particle should drill into that asset class
        // Find the asset class node that contains this particle
        const portfolioNode = selectionPath[0]?.node || rootNodes[0];
        const assetClassNode = portfolioNode?.children?.find((ac) => {
          const acType = getAssetClassFromNode(ac);
          return acType === particle.assetClass;
        });

        if (assetClassNode) {
          selectNode(assetClassNode.id);
          onNodeSelect?.(assetClassNode, currentLevel);
        }
      } else if (currentLevel === 2) {
        // At globe level, clicking a particle should drill into that region
        const assetClassNode = selectionPath[1]?.node;
        const regionNode = assetClassNode?.children?.find((r) => {
          const region = getRegionFromNode(r);
          return region === particle.region;
        });

        if (regionNode) {
          selectNode(regionNode.id);
          onNodeSelect?.(regionNode, currentLevel);
        }
      } else if (currentLevel === 3) {
        // At nebula level, clicking should explode to contribution view
        selectParticle(particle.id);
        explodeInstrument(particle.nodeId);
        onNodeSelect?.(particle.node, currentLevel);
      }
    },
    [
      animationPhase,
      currentLevel,
      selectionPath,
      rootNodes,
      selectNode,
      selectParticle,
      explodeInstrument,
      onNodeSelect,
    ]
  );

  // Determine if we should show continent outlines (only during globe view)
  const showContinents = useMemo(() => {
    return (
      formationState.currentFormation === 'globe' ||
      formationState.targetFormation === 'globe'
    );
  }, [formationState.currentFormation, formationState.targetFormation]);

  // Calculate continent opacity based on transition
  const continentOpacity = useMemo(() => {
    if (formationState.currentFormation === 'globe' && !formationState.isTransitioning) {
      return 0.15;
    }

    if (formationState.targetFormation === 'globe' && formationState.isTransitioning) {
      return 0.15 * formationState.transitionProgress;
    }

    if (formationState.currentFormation === 'globe' && formationState.isTransitioning) {
      return 0.15 * (1 - formationState.transitionProgress);
    }

    return 0;
  }, [formationState]);

  // Only render if we're at levels 1-3
  if (currentLevel < 1 || currentLevel > 3) {
    return null;
  }

  return (
    <group>
      {/* Continent outlines for globe view */}
      {showContinents && continentOpacity > 0.01 && (
        <ContinentOutlines
          opacity={continentOpacity}
          showGraticule={true}
          graticuleOpacity={continentOpacity * 0.5}
          unfoldProgress={formationState.unfoldProgress}
          isRotating={!formationState.isUnfolding}
        />
      )}

      {/* Main particle system */}
      <ParticleSystem
        onParticleClick={handleParticleClick}
        showLabels={true}
        maxParticles={500}
      />
    </group>
  );
}

export default ParticleVisualization;
