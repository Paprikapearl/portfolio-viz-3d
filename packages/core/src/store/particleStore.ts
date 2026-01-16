/**
 * Particle Store
 *
 * Zustand store for managing particle state, formations, and transitions.
 * Works alongside navigationStore to coordinate the visualization.
 */

import { create } from 'zustand';
import type {
  DataNode,
  Particle,
  FormationType,
  FormationState,
  AssetClassType,
  GeographicRegion,
} from '../types';
import {
  PARTICLE_SIZE,
  ASSET_CLASS_COLORS,
  TRANSITION_DURATIONS,
} from '../types/particle';

interface ParticleStore {
  // Particle data
  particles: Particle[];
  particleMap: Map<string, Particle>;

  // Formation state
  formationState: FormationState;

  // Animation
  animationTime: number;
  transitionStartTime: number | null;

  // Interaction
  hoveredParticleId: string | null;

  // Actions
  initialize: (rootNodes: DataNode[]) => void;
  setFormation: (formation: FormationType) => void;
  startTransition: (targetFormation: FormationType) => void;
  updateTransitionProgress: (progress: number) => void;
  completeTransition: () => void;

  // Galaxy actions
  selectGalaxy: (assetClass: AssetClassType | null) => void;

  // Globe actions
  selectRegion: (region: GeographicRegion | null) => void;
  startUnfolding: () => void;
  updateUnfoldProgress: (progress: number) => void;

  // Nebula actions
  selectParticle: (particleId: string | null) => void;

  // Animation
  updateAnimationTime: (delta: number) => void;

  // Interaction
  setHoveredParticle: (particleId: string | null) => void;

  // Utilities
  getParticle: (id: string) => Particle | undefined;
  getParticlesByAssetClass: (assetClass: AssetClassType) => Particle[];
  getParticlesByRegion: (region: GeographicRegion) => Particle[];
}

const initialFormationState: FormationState = {
  currentFormation: 'galaxy',
  targetFormation: 'galaxy',
  transitionProgress: 0,
  isTransitioning: false,
  selectedGalaxy: null,
  selectedRegion: null,
  isUnfolding: false,
  unfoldProgress: 0,
  selectedParticleId: null,
};

/**
 * Extract all instruments from the data hierarchy
 */
function extractInstruments(nodes: DataNode[], parentAssetClass?: AssetClassType): DataNode[] {
  const instruments: DataNode[] = [];

  function traverse(node: DataNode, assetClass?: AssetClassType) {
    const nodeType = node.metadata?.type as string | undefined;

    // Determine asset class from node or inherit from parent
    let currentAssetClass = assetClass;
    if (nodeType === 'assetClass') {
      currentAssetClass = node.assetClassType ||
        (node.label.toLowerCase().includes('equit') ? 'equities' :
          node.label.toLowerCase().includes('fixed') ? 'fixed-income' :
            'alternatives');
    }

    if (nodeType === 'instrument') {
      // Add asset class info to instrument
      (node as DataNode & { _assetClass?: AssetClassType })._assetClass = currentAssetClass;
      instruments.push(node);
    }

    if (node.children) {
      node.children.forEach((child) => traverse(child, currentAssetClass));
    }
  }

  nodes.forEach((node) => traverse(node, parentAssetClass));
  return instruments;
}

/**
 * Convert a DataNode (instrument) to a Particle
 */
function nodeToParticle(
  node: DataNode,
  index: number,
  assetClass: AssetClassType
): Particle {
  const weight = node.weight || 0.1;
  const colors = ASSET_CLASS_COLORS[assetClass];
  const colorIndex = Math.floor((index % colors.length));

  return {
    id: `particle-${node.id}`,
    nodeId: node.id,
    label: node.label,
    shortLabel: node.shortLabel || node.label.split(' ')[0],
    value: node.value,
    weight,
    assetClass,
    region: node.region || 'unknown',
    latLong: node.latLong || { lat: 0, long: 0 },
    color: colors[colorIndex],
    size: PARTICLE_SIZE.min + (PARTICLE_SIZE.max - PARTICLE_SIZE.min) * Math.sqrt(weight),
    glowIntensity: 0.3,
    currentPosition: [0, 0, 0],
    targetPosition: [0, 0, 0],
    velocity: [0, 0, 0],
    node,
  };
}

export const useParticleStore = create<ParticleStore>((set, get) => ({
  particles: [],
  particleMap: new Map(),
  formationState: initialFormationState,
  animationTime: 0,
  transitionStartTime: null,
  hoveredParticleId: null,

  initialize: (rootNodes) => {
    // Extract all instruments from the hierarchy
    const instruments = extractInstruments(rootNodes);

    // Group by asset class for proper coloring
    const byAssetClass: Record<AssetClassType, DataNode[]> = {
      'equities': [],
      'fixed-income': [],
      'alternatives': [],
    };

    instruments.forEach((inst) => {
      const assetClass = (inst as DataNode & { _assetClass?: AssetClassType })._assetClass || 'equities';
      byAssetClass[assetClass].push(inst);
    });

    // Convert to particles
    const particles: Particle[] = [];
    const particleMap = new Map<string, Particle>();

    (Object.keys(byAssetClass) as AssetClassType[]).forEach((assetClass) => {
      byAssetClass[assetClass].forEach((node, index) => {
        const particle = nodeToParticle(node, index, assetClass);
        particles.push(particle);
        particleMap.set(particle.id, particle);
      });
    });

    set({
      particles,
      particleMap,
      formationState: initialFormationState,
      animationTime: 0,
    });
  },

  setFormation: (formation) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        currentFormation: formation,
        targetFormation: formation,
        transitionProgress: 0,
        isTransitioning: false,
      },
    }));
  },

  startTransition: (targetFormation) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        targetFormation,
        transitionProgress: 0,
        isTransitioning: true,
      },
      transitionStartTime: Date.now(),
    }));
  },

  updateTransitionProgress: (progress) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        transitionProgress: Math.max(0, Math.min(1, progress)),
      },
    }));
  },

  completeTransition: () => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        currentFormation: state.formationState.targetFormation,
        transitionProgress: 1,
        isTransitioning: false,
      },
      transitionStartTime: null,
    }));
  },

  selectGalaxy: (assetClass) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        selectedGalaxy: assetClass,
      },
    }));
  },

  selectRegion: (region) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        selectedRegion: region,
      },
    }));
  },

  startUnfolding: () => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        isUnfolding: true,
        unfoldProgress: 0,
      },
    }));
  },

  updateUnfoldProgress: (progress) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        unfoldProgress: Math.max(0, Math.min(1, progress)),
      },
    }));
  },

  selectParticle: (particleId) => {
    set((state) => ({
      formationState: {
        ...state.formationState,
        selectedParticleId: particleId,
      },
    }));
  },

  updateAnimationTime: (delta) => {
    set((state) => ({
      animationTime: state.animationTime + delta,
    }));
  },

  setHoveredParticle: (particleId) => {
    set({ hoveredParticleId: particleId });
  },

  getParticle: (id) => {
    return get().particleMap.get(id);
  },

  getParticlesByAssetClass: (assetClass) => {
    return get().particles.filter((p) => p.assetClass === assetClass);
  },

  getParticlesByRegion: (region) => {
    return get().particles.filter((p) => p.region === region);
  },
}));

// Selectors
export const useParticles = () => useParticleStore((s) => s.particles);
export const useFormationState = () => useParticleStore((s) => s.formationState);
export const useAnimationTime = () => useParticleStore((s) => s.animationTime);
export const useHoveredParticleId = () => useParticleStore((s) => s.hoveredParticleId);

/**
 * Get transition duration for a formation change
 */
export function getTransitionDuration(
  from: FormationType,
  to: FormationType
): number {
  if (from === 'galaxy' && to === 'globe') {
    return TRANSITION_DURATIONS.galaxyToGlobe;
  }
  if (from === 'globe' && to === 'nebula') {
    return TRANSITION_DURATIONS.globeToNebula;
  }
  if (from === 'nebula' && to === 'exploded') {
    return TRANSITION_DURATIONS.nebulaToExploded;
  }
  // Default for portfolio to galaxy
  return TRANSITION_DURATIONS.portfolioToGalaxy;
}
