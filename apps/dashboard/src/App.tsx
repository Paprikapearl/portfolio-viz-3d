/**
 * Dashboard - Cinematic Portfolio Visualization
 *
 * Fixed perspective, animated drill-down through portfolio hierarchy.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Stage,
  generateSimpleDemo,
  useNavigationStore,
  useSelectionPath,
  useCurrentLevel,
  useExplodedInstrumentId,
  useContributionSpacing,
  useSelectedContributionId,
  useCarouselOffset,
  useVisualizationMode,
} from '@portfolio-viz/core';

// Design tokens
const colors = {
  bg: {
    primary: '#050510',
    secondary: '#0a0a18',
    tertiary: '#12121f',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    faint: '#475569',
  },
  accent: {
    positive: '#22c55e',
    negative: '#ef4444',
  },
};

const levelNames = ['Portfolio', 'Asset Class', 'Market', 'Instrument', 'Contribution'];

/**
 * Contextual header that shows instructions based on current view
 */
function ContextualHeader() {
  const currentLevel = useCurrentLevel();
  const selectionPath = useSelectionPath();
  const visualizationMode = useVisualizationMode();
  const explodedInstrumentId = useExplodedInstrumentId();

  // Get contextual title and instructions based on current state
  const { title, subtitle, instruction } = useMemo(() => {
    if (explodedInstrumentId) {
      return {
        title: 'Return Attribution',
        subtitle: 'Exploring contribution breakdown',
        instruction: 'Click on a block to see detailed methodology. Scroll to adjust spacing.',
      };
    }

    switch (currentLevel) {
      case 0:
        return {
          title: 'Welcome to the Allocation Explorer',
          subtitle: 'Your portfolio universe at a glance',
          instruction: 'Click on a portfolio to begin exploring its composition.',
        };
      case 1: {
        const portfolioName = selectionPath[0]?.node.label || 'Portfolio';
        if (visualizationMode === 'particles') {
          return {
            title: portfolioName,
            subtitle: 'Asset Class Galaxy View',
            instruction: 'Each galaxy represents an asset class. Click a cluster to drill into geographic regions.',
          };
        }
        return {
          title: portfolioName,
          subtitle: 'Asset Class Breakdown',
          instruction: 'Select an asset class to explore its regional allocation.',
        };
      }
      case 2: {
        const assetClassName = selectionPath[1]?.node.label || 'Asset Class';
        if (visualizationMode === 'particles') {
          return {
            title: assetClassName,
            subtitle: 'Geographic Globe View',
            instruction: 'Particles positioned by region. Click a cluster to see individual instruments.',
          };
        }
        return {
          title: assetClassName,
          subtitle: 'Geographic Allocation',
          instruction: 'Select a market region to view its instruments.',
        };
      }
      case 3: {
        const marketName = selectionPath[2]?.node.label || 'Market';
        if (visualizationMode === 'particles') {
          return {
            title: marketName,
            subtitle: 'Instrument Nebula View',
            instruction: 'Each particle is an instrument. Click to see its return attribution.',
          };
        }
        return {
          title: marketName,
          subtitle: 'Instrument Holdings',
          instruction: 'Select an instrument to explore its return components.',
        };
      }
      default:
        return {
          title: 'Portfolio Explorer',
          subtitle: '',
          instruction: 'Navigate through the hierarchy to explore allocations.',
        };
    }
  }, [currentLevel, selectionPath, visualizationMode, explodedInstrumentId]);

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 280,
        padding: '20px 32px',
        background: 'linear-gradient(180deg, rgba(5, 5, 16, 0.95) 0%, rgba(5, 5, 16, 0) 100%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: colors.text.primary,
          margin: 0,
          marginBottom: 4,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: 8,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {subtitle}
        </p>
      )}
      <p
        style={{
          fontSize: 13,
          color: colors.text.muted,
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontStyle: 'italic',
        }}
      >
        {instruction}
      </p>
    </header>
  );
}

function InfoPanel() {
  const selectionPath = useSelectionPath();
  const currentLevel = useCurrentLevel();
  const viewMode = useNavigationStore((s) => s.viewMode);
  const setViewMode = useNavigationStore((s) => s.setViewMode);
  const goBack = useNavigationStore((s) => s.goBack);
  const reset = useNavigationStore((s) => s.reset);

  // Exploded view state
  const explodedInstrumentId = useExplodedInstrumentId();
  const contributionSpacing = useContributionSpacing();
  const selectedContributionId = useSelectedContributionId();
  const currentNodes = useNavigationStore((s) => s.currentNodes);
  const setContributionSpacing = useNavigationStore((s) => s.setContributionSpacing);
  const selectContribution = useNavigationStore((s) => s.selectContribution);
  const collapseInstrument = useNavigationStore((s) => s.collapseInstrument);

  // Carousel state
  const carouselOffset = useCarouselOffset();
  const setCarouselOffset = useNavigationStore((s) => s.setCarouselOffset);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter nodes based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || currentNodes.length === 0) return [];
    const query = searchQuery.toLowerCase();
    return currentNodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) =>
        node.label.toLowerCase().includes(query) ||
        (node.shortLabel && node.shortLabel.toLowerCase().includes(query))
      )
      .slice(0, 8); // Limit to 8 results
  }, [searchQuery, currentNodes]);

  // Jump to item in carousel
  const jumpToItem = useCallback((index: number) => {
    setCarouselOffset(index);
    setSearchQuery('');
    setIsSearchFocused(false);
  }, [setCarouselOffset]);

  // Clear search when level changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentLevel]);

  const currentSelection = selectionPath[selectionPath.length - 1]?.node;

  // Find exploded instrument and selected contribution
  const explodedInstrument = useMemo(() => {
    if (!explodedInstrumentId) return null;
    return currentNodes.find((n) => n.id === explodedInstrumentId) || null;
  }, [explodedInstrumentId, currentNodes]);

  const selectedContribution = useMemo(() => {
    if (!selectedContributionId || !explodedInstrument?.children) return null;
    return explodedInstrument.children.find((c) => c.id === selectedContributionId) || null;
  }, [selectedContributionId, explodedInstrument]);

  const formatPercent = (value: number) => {
    const formatted = (value * 100).toFixed(2);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  return (
    <aside
      style={{
        width: 280,
        background: colors.bg.secondary,
        borderLeft: `1px solid ${colors.border.subtle}`,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Current Level */}
      <section>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.text.muted,
            marginBottom: 8,
          }}
        >
          Current View
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          {levelNames[currentLevel]} Selection
        </div>
      </section>

      {/* Carousel Position - shown when browsing horizontal bars */}
      {currentLevel > 0 && currentNodes.length > 1 && !explodedInstrumentId && (
        <section style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: colors.bg.tertiary,
              borderRadius: 6,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <span style={{ fontSize: 11, color: colors.text.muted }}>Position</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'ui-monospace, monospace',
                color: colors.text.primary,
              }}
            >
              {Math.round(carouselOffset) + 1} / {currentNodes.length}
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: colors.text.faint,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            Scroll to browse items
          </div>

          {/* Search field */}
          <div style={{ marginTop: 12, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: colors.bg.tertiary,
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: 4,
                color: colors.text.primary,
                fontSize: 12,
                outline: 'none',
              }}
            />

            {/* Search results dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: colors.bg.tertiary,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: 4,
                  maxHeight: 200,
                  overflowY: 'auto',
                  zIndex: 100,
                }}
              >
                {searchResults.map(({ node, index }) => (
                  <button
                    key={node.id}
                    onClick={() => jumpToItem(index)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${colors.border.subtle}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: colors.text.secondary,
                      fontSize: 11,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.bg.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{node.shortLabel || node.label}</span>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 10,
                        color: node.value >= 0 ? colors.accent.positive : colors.accent.negative,
                      }}
                    >
                      {formatPercent(node.value)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {isSearchFocused && searchQuery.trim() && searchResults.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  padding: '8px 12px',
                  background: colors.bg.tertiary,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: 4,
                  color: colors.text.muted,
                  fontSize: 11,
                  textAlign: 'center',
                }}
              >
                No matches found
              </div>
            )}
          </div>
        </section>
      )}

      {/* Selection Path */}
      {selectionPath.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            Path
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {selectionPath.map((sel) => (
              <button
                key={sel.node.id}
                onClick={() => goBack(sel.level)}
                style={{
                  background: colors.bg.tertiary,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: colors.text.secondary,
                  fontSize: 12,
                }}
              >
                <span style={{ color: colors.text.muted }}>{levelNames[sel.level]}:</span>{' '}
                {sel.node.shortLabel || sel.node.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Current Selection Details */}
      {currentSelection && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            Last Selected
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: colors.text.primary,
              marginBottom: 8,
            }}
          >
            {currentSelection.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
              color:
                currentSelection.value >= 0
                  ? colors.accent.positive
                  : colors.accent.negative,
            }}
          >
            {formatPercent(currentSelection.value)}
          </div>
        </section>
      )}

      {/* View Mode Toggle - always visible, persists across navigation */}
      <section style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            View Mode
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '8px 10px',
              background: viewMode === 'contribution' ? colors.bg.tertiary : 'transparent',
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 4,
            }}
          >
            <input
              type="checkbox"
              checked={viewMode === 'contribution'}
              onChange={(e) => setViewMode(e.target.checked ? 'contribution' : 'value')}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer',
                accentColor: colors.accent.positive,
              }}
            />
            <span style={{ color: colors.text.secondary, fontSize: 12 }}>
              Contribution View
            </span>
          </label>
          <div
            style={{
              fontSize: 10,
              color: colors.text.faint,
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            Shows each component's contribution to the portfolio return
          </div>
        </section>

      {/* Exploded Instrument Controls - shown when an instrument is exploded */}
      {explodedInstrument && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            Exploded View: {explodedInstrument.shortLabel || explodedInstrument.label}
          </div>

          {/* Spacing slider */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: colors.text.secondary }}>
                Block Spacing
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'ui-monospace, monospace',
                  color: colors.text.muted,
                }}
              >
                {contributionSpacing.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={contributionSpacing}
              onChange={(e) => setContributionSpacing(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: 4,
                cursor: 'pointer',
                accentColor: colors.accent.positive,
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={collapseInstrument}
            style={{
              width: '100%',
              background: colors.bg.tertiary,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 4,
              padding: '8px 12px',
              color: colors.text.secondary,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Close Exploded View
          </button>
        </section>
      )}

      {/* Selected Contribution indicator in sidebar */}
      {selectedContribution && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.muted,
              marginBottom: 8,
            }}
          >
            Viewing Contribution
          </div>
          <div
            style={{
              background: colors.bg.tertiary,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 6,
              padding: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: colors.text.primary }}>
              {selectedContribution.shortLabel || selectedContribution.label}
            </span>
            <button
              onClick={() => selectContribution(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.muted,
                cursor: 'pointer',
                fontSize: 14,
                padding: '2px 6px',
              }}
            >
              ×
            </button>
          </div>
        </section>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Reset button */}
      {currentLevel > 0 && (
        <button
          onClick={reset}
          style={{
            background: colors.bg.tertiary,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 6,
            padding: '10px 16px',
            color: colors.text.secondary,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          Reset to Start
        </button>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: colors.bg.tertiary,
          borderRadius: 6,
          fontSize: 11,
          color: colors.text.faint,
          lineHeight: 1.5,
        }}
      >
        Click a bar to drill down into its components. Click breadcrumb bars to navigate back.
      </div>
    </aside>
  );
}

export function App() {
  const [data] = useState(() => generateSimpleDemo());
  const initialize = useNavigationStore((s) => s.initialize);

  useEffect(() => {
    initialize(data);
  }, [data, initialize]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        background: colors.bg.primary,
        color: colors.text.primary,
        position: 'relative',
      }}
    >
      {/* Contextual Header */}
      <ContextualHeader />

      {/* 3D Stage */}
      <div style={{ flex: 1 }}>
        <Stage data={data} />
      </div>

      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}
