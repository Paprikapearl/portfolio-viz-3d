/**
 * Mock data generator for portfolio hierarchy
 *
 * Portfolio → Asset Class → Market → Instrument → Contribution
 * Updated with rich contribution metadata for testing
 * Now includes geographic coordinates for particle visualization
 */

import type { DataNode, GeographicRegion, LatLong, AssetClassType } from '../types';

let idCounter = 0;
const genId = () => `node-${++idCounter}`;

/**
 * Geographic coordinates for each region
 */
const REGION_GEO_DATA: Record<string, { region: GeographicRegion; latLong: LatLong }> = {
  'US Equity': { region: 'north-america', latLong: { lat: 40, long: -100 } },
  'European Equity': { region: 'europe', latLong: { lat: 50, long: 10 } },
  'Asian Equity': { region: 'asia', latLong: { lat: 35, long: 120 } },
  'Emerging Markets': { region: 'emerging-markets', latLong: { lat: -15, long: 30 } },
  'Government Bonds': { region: 'global', latLong: { lat: 45, long: -50 } },
  'Corporate Bonds': { region: 'global', latLong: { lat: 40, long: 0 } },
  'Commodities': { region: 'global', latLong: { lat: 20, long: -60 } },
  'Real Assets': { region: 'global', latLong: { lat: 30, long: 90 } },
};

/**
 * Individual instrument coordinates (scattered around their region center)
 */
const INSTRUMENT_COORDINATES: Record<string, LatLong> = {
  // US Equity - scattered across US
  'AAPL': { lat: 37.33, long: -122.03 },    // Cupertino, CA
  'MSFT': { lat: 47.64, long: -122.13 },    // Redmond, WA
  'GOOGL': { lat: 37.42, long: -122.08 },   // Mountain View, CA
  'AMZN': { lat: 47.62, long: -122.33 },    // Seattle, WA
  'NVDA': { lat: 37.37, long: -121.99 },    // Santa Clara, CA

  // European Equity
  'NESN': { lat: 46.47, long: 6.51 },       // Vevey, Switzerland
  'ASML': { lat: 51.42, long: 5.45 },       // Veldhoven, Netherlands
  'ROG': { lat: 47.56, long: 7.59 },        // Basel, Switzerland
  'NOVN': { lat: 47.56, long: 7.58 },       // Basel, Switzerland

  // Asian Equity
  'TSM': { lat: 24.78, long: 121.02 },      // Hsinchu, Taiwan
  'BABA': { lat: 30.27, long: 120.15 },     // Hangzhou, China
  'TCEHY': { lat: 22.54, long: 114.06 },    // Shenzhen, China
  'SONY': { lat: 35.65, long: 139.74 },     // Tokyo, Japan

  // Emerging Markets
  'VALE': { lat: -20.32, long: -43.13 },    // Rio de Janeiro, Brazil
  'PBR': { lat: -22.91, long: -43.17 },     // Rio de Janeiro, Brazil
  'INFY': { lat: 12.97, long: 77.59 },      // Bangalore, India

  // Bonds (positions spread for visibility)
  'UST10Y': { lat: 38.89, long: -77.03 },   // Washington DC
  'BUND10Y': { lat: 50.11, long: 8.68 },    // Frankfurt, Germany
  'JGB10Y': { lat: 35.68, long: 139.75 },   // Tokyo, Japan
  'LQD': { lat: 40.71, long: -74.01 },      // New York
  'HYG': { lat: 41.88, long: -87.63 },      // Chicago
  'EMB': { lat: 40.73, long: -73.99 },      // New York

  // Commodities & Real Assets
  'GLD': { lat: 51.51, long: -0.13 },       // London (gold trading)
  'SLV': { lat: 51.51, long: -0.12 },       // London
  'CL': { lat: 29.76, long: -95.37 },       // Houston (oil)
  'VNQ': { lat: 40.75, long: -73.99 },      // New York
  'VNQI': { lat: 48.86, long: 2.35 },       // Paris
  'WOOD': { lat: 45.52, long: -122.68 },    // Portland, OR
};

/**
 * Map asset class names to types
 */
const ASSET_CLASS_MAP: Record<string, AssetClassType> = {
  'Equities': 'equities',
  'Fixed Income': 'fixed-income',
  'Alternatives': 'alternatives',
};

// Contribution model descriptions - extended with rich metadata for testing
interface ContributionModelData {
  description: string;
  methodology: string;
  dataSource: string;
  updateFrequency: string;
  confidenceLevel: number;
  historicalAccuracy: number;
  lookbackPeriod: string;
  riskFactors: string;
  modelVersion: string;
  lastCalibration: string;
  keyAssumptions: string;
  limitations: string;
}

const CONTRIBUTION_MODELS: Record<string, ContributionModelData> = {
  'Equilibrium Return': {
    description: 'Market-implied expected return based on market capitalization weights and global risk premia. This represents the baseline expected return that would prevail in a world where all investors hold the market portfolio and have homogeneous expectations about future returns. The equilibrium return serves as the anchor for our return forecasting framework.',
    methodology: 'Derived from reverse optimization of the global market portfolio using the Capital Asset Pricing Model (CAPM) framework. We start with observed market capitalizations, assume markets are in equilibrium, and back out the implied expected returns that would make investors indifferent between all assets at current prices. Risk aversion parameters are calibrated quarterly using survey data and realized market behavior.',
    dataSource: 'Bloomberg, MSCI, internal risk models',
    updateFrequency: 'Daily recalculation, weekly publication',
    confidenceLevel: 0.85,
    historicalAccuracy: 0.72,
    lookbackPeriod: '10 years rolling',
    riskFactors: 'Market beta, size, value, momentum, quality',
    modelVersion: '3.2.1',
    lastCalibration: '2024-Q4',
    keyAssumptions: 'Markets are mean-variance efficient; investors have quadratic utility; transaction costs are negligible; no taxes or market frictions',
    limitations: 'Assumes all investors are rational and have access to same information. May underperform in periods of market stress or structural change.',
  },
  'Momentum Signal': {
    description: 'Return contribution from price momentum factors capturing the tendency of assets that have performed well recently to continue performing well in the near future. Our momentum signal combines multiple timeframes and incorporates volatility scaling to manage the crash risk inherent in momentum strategies.',
    methodology: 'Cross-sectional momentum ranking with volatility scaling and sector neutralization. We rank securities within each sector by their risk-adjusted returns over 3, 6, and 12 month horizons, excluding the most recent month to avoid short-term reversal effects. Positions are scaled inversely to recent realized volatility to maintain consistent risk exposure. The strategy is rebalanced monthly with 20% turnover constraints.',
    dataSource: 'Exchange data, proprietary timing model',
    updateFrequency: 'Daily signals, monthly rebalance',
    confidenceLevel: 0.78,
    historicalAccuracy: 0.65,
    lookbackPeriod: '3-12 months',
    riskFactors: 'Time-series momentum, cross-sectional momentum, volatility',
    modelVersion: '2.8.4',
    lastCalibration: '2024-Q3',
    keyAssumptions: 'Price trends persist due to underreaction to information; volatility clustering is predictable; sector effects are distinct from momentum',
    limitations: 'Subject to momentum crashes during market reversals. Performance degraded when many investors follow similar strategies.',
  },
  'Value Signal': {
    description: 'Return contribution from valuation-based factors that identify securities trading below their intrinsic value. Our composite value score synthesizes multiple valuation metrics to create a robust assessment of relative cheapness that avoids single-metric value traps.',
    methodology: 'Composite value score using fundamental ratios relative to sector peers and historical norms. Primary metrics include Price-to-Earnings (trailing and forward), Price-to-Book, Enterprise Value to EBITDA, and Dividend Yield. Each metric is z-scored within sector and combined using weights calibrated to maximize out-of-sample Sharpe ratio. Adjustments are made for accounting differences across regions.',
    dataSource: 'Company filings, I/B/E/S estimates, Bloomberg',
    updateFrequency: 'Weekly updates, quarterly deep review',
    confidenceLevel: 0.82,
    historicalAccuracy: 0.68,
    lookbackPeriod: '5 year normalization',
    riskFactors: 'Book-to-market, earnings yield, dividend yield, cash flow yield',
    modelVersion: '4.1.0',
    lastCalibration: '2024-Q4',
    keyAssumptions: 'Markets eventually recognize intrinsic value; accounting data reflects economic reality; sector peers are appropriate comparables',
    limitations: 'Value stocks may remain cheap for extended periods. Accounting manipulation can distort signals. Less effective for high-growth sectors.',
  },
  'Quality Signal': {
    description: 'Return contribution from quality metrics that identify companies with sustainable competitive advantages, strong balance sheets, and consistent profitability. High-quality companies tend to outperform during market stress and provide smoother return streams over time.',
    methodology: 'Multi-factor quality score emphasizing profitability, earnings stability, and financial health. Components include Return on Equity, Return on Assets, gross margin stability, earnings variability, debt-to-equity ratio, interest coverage, and Altman Z-score. Machine learning ensemble combines factors with time-varying weights based on market regime.',
    dataSource: 'Annual reports, quarterly filings, credit ratings',
    updateFrequency: 'Monthly recalculation',
    confidenceLevel: 0.80,
    historicalAccuracy: 0.71,
    lookbackPeriod: '3 years for stability metrics',
    riskFactors: 'Profitability, investment, leverage, earnings quality',
    modelVersion: '3.5.2',
    lastCalibration: '2024-Q4',
    keyAssumptions: 'Past profitability indicates future profitability; accounting quality metrics are predictive; market undervalues consistency',
    limitations: 'Quality premium may be arbitraged away as factor becomes more popular. Expensive quality stocks may underperform in risk-on environments.',
  },
  'Analyst Views': {
    description: 'Return contribution from analyst consensus estimates and recommendation changes that capture the collective wisdom of equity research. Our model identifies persistent biases in analyst forecasts and extracts alpha from changes in sentiment rather than levels.',
    methodology: 'Black-Litterman views derived from analyst target prices with confidence weighting based on historical forecast accuracy. We track analyst recommendation changes, earnings revision momentum, and target price movements. Analysts are weighted by their historical accuracy for each sector. Herding effects are adjusted using proprietary dispersion metrics.',
    dataSource: 'I/B/E/S, Bloomberg, sell-side research',
    updateFrequency: 'Daily aggregation',
    confidenceLevel: 0.75,
    historicalAccuracy: 0.62,
    lookbackPeriod: 'Rolling 2-year analyst accuracy',
    riskFactors: 'Earnings surprise, recommendation change, estimate revision',
    modelVersion: '2.4.1',
    lastCalibration: '2024-Q3',
    keyAssumptions: 'Analyst estimates contain information not fully reflected in prices; recommendation changes are more informative than levels; accuracy varies systematically',
    limitations: 'Analysts exhibit well-documented biases including optimism, herding, and conflicts of interest. Effectiveness varies by coverage universe.',
  },
  'Macro Overlay': {
    description: 'Return adjustment based on macroeconomic regime classification and business cycle indicators. This overlay tilts portfolio exposures based on our assessment of where we are in the economic cycle and how that affects relative asset class and factor performance.',
    methodology: 'Regime-switching model incorporating GDP growth nowcasts, inflation expectations, monetary policy stance, and credit conditions. Four regimes are identified: Expansion, Slowdown, Contraction, and Recovery. Factor and asset class tilts are calibrated based on historical performance in each regime. Transition probabilities are estimated using hidden Markov models.',
    dataSource: 'Federal Reserve, ECB, proprietary indicators',
    updateFrequency: 'Weekly regime assessment',
    confidenceLevel: 0.70,
    historicalAccuracy: 0.58,
    lookbackPeriod: '30 years for regime calibration',
    riskFactors: 'Interest rate sensitivity, inflation beta, growth beta',
    modelVersion: '1.9.3',
    lastCalibration: '2024-Q2',
    keyAssumptions: 'Economic regimes are identifiable in real-time; historical relationships between regimes and asset returns persist; regime transitions are gradual',
    limitations: 'Regime identification is subject to significant uncertainty. Structural changes in the economy may invalidate historical relationships. Model performed poorly during COVID crisis.',
  },
};

/**
 * Generate contribution components for an instrument
 */
function generateContributions(instrumentReturn: number, instrumentName: string): DataNode[] {
  // Different contribution breakdowns based on instrument type
  const contributions = [
    { name: 'Equilibrium Return', pct: 0.35 },
    { name: 'Momentum Signal', pct: 0.20 },
    { name: 'Value Signal', pct: 0.15 },
    { name: 'Quality Signal', pct: 0.12 },
    { name: 'Analyst Views', pct: 0.10 },
    { name: 'Macro Overlay', pct: 0.08 },
  ];

  return contributions.map((c) => {
    const value = instrumentReturn * c.pct;
    const model = CONTRIBUTION_MODELS[c.name];

    return {
      id: genId(),
      label: c.name,
      shortLabel: c.name.split(' ')[0],
      value,
      weight: c.pct,
      metadata: {
        type: 'contribution',
        instrument: instrumentName,
        description: model.description,
        methodology: model.methodology,
        dataSource: model.dataSource,
        updateFrequency: model.updateFrequency,
        confidenceLevel: model.confidenceLevel,
        historicalAccuracy: model.historicalAccuracy,
        lookbackPeriod: model.lookbackPeriod,
        riskFactors: model.riskFactors,
        modelVersion: model.modelVersion,
        lastCalibration: model.lastCalibration,
        keyAssumptions: model.keyAssumptions,
        limitations: model.limitations,
      },
    };
  });
}

/**
 * Generate instruments for a market
 */
function generateInstruments(market: string, baseReturn: number, assetClass: string): DataNode[] {
  const instrumentsByMarket: Record<string, Array<{ ticker: string; name: string }>> = {
    'US Equity': [
      { ticker: 'AAPL', name: 'Apple Inc.' },
      { ticker: 'MSFT', name: 'Microsoft Corp.' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.' },
      { ticker: 'AMZN', name: 'Amazon.com Inc.' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.' },
    ],
    'European Equity': [
      { ticker: 'NESN', name: 'Nestle SA' },
      { ticker: 'ASML', name: 'ASML Holding' },
      { ticker: 'ROG', name: 'Roche Holding' },
      { ticker: 'NOVN', name: 'Novartis AG' },
    ],
    'Asian Equity': [
      { ticker: 'TSM', name: 'Taiwan Semiconductor' },
      { ticker: 'BABA', name: 'Alibaba Group' },
      { ticker: 'TCEHY', name: 'Tencent Holdings' },
      { ticker: 'SONY', name: 'Sony Group' },
    ],
    'Emerging Markets': [
      { ticker: 'VALE', name: 'Vale SA' },
      { ticker: 'PBR', name: 'Petrobras' },
      { ticker: 'INFY', name: 'Infosys Ltd' },
    ],
    'Government Bonds': [
      { ticker: 'UST10Y', name: 'US Treasury 10Y' },
      { ticker: 'BUND10Y', name: 'German Bund 10Y' },
      { ticker: 'JGB10Y', name: 'Japan JGB 10Y' },
    ],
    'Corporate Bonds': [
      { ticker: 'LQD', name: 'Investment Grade ETF' },
      { ticker: 'HYG', name: 'High Yield ETF' },
      { ticker: 'EMB', name: 'EM Bond ETF' },
    ],
    'Commodities': [
      { ticker: 'GLD', name: 'Gold' },
      { ticker: 'SLV', name: 'Silver' },
      { ticker: 'CL', name: 'Crude Oil' },
    ],
    'Real Assets': [
      { ticker: 'VNQ', name: 'US REITs' },
      { ticker: 'VNQI', name: 'Intl REITs' },
      { ticker: 'WOOD', name: 'Timber' },
    ],
  };

  const instruments = instrumentsByMarket[market] || [
    { ticker: 'INST1', name: 'Instrument 1' },
    { ticker: 'INST2', name: 'Instrument 2' },
  ];

  const count = instruments.length;
  const regionData = REGION_GEO_DATA[market] || { region: 'unknown' as GeographicRegion, latLong: { lat: 0, long: 0 } };

  return instruments.map((inst) => {
    const variance = (Math.random() - 0.5) * 0.06;
    const instReturn = baseReturn + variance;
    const weight = 1 / count;

    // Get instrument-specific coordinates or use region default with small offset
    const instLatLong = INSTRUMENT_COORDINATES[inst.ticker] || {
      lat: regionData.latLong.lat + (Math.random() - 0.5) * 10,
      long: regionData.latLong.long + (Math.random() - 0.5) * 10,
    };

    return {
      id: genId(),
      label: `${inst.ticker} - ${inst.name}`,
      shortLabel: inst.ticker,
      value: instReturn,
      weight,
      region: regionData.region,
      latLong: instLatLong,
      assetClassType: ASSET_CLASS_MAP[assetClass] || 'equities',
      children: generateContributions(instReturn, inst.name),
      metadata: {
        type: 'instrument',
        ticker: inst.ticker,
        name: inst.name,
      },
    };
  });
}

/**
 * Generate markets for an asset class
 */
function generateMarkets(assetClass: string, baseReturn: number): DataNode[] {
  const marketsByClass: Record<string, Array<{ name: string; weight: number }>> = {
    'Equities': [
      { name: 'US Equity', weight: 0.50 },
      { name: 'European Equity', weight: 0.25 },
      { name: 'Asian Equity', weight: 0.15 },
      { name: 'Emerging Markets', weight: 0.10 },
    ],
    'Fixed Income': [
      { name: 'Government Bonds', weight: 0.60 },
      { name: 'Corporate Bonds', weight: 0.40 },
    ],
    'Alternatives': [
      { name: 'Commodities', weight: 0.50 },
      { name: 'Real Assets', weight: 0.50 },
    ],
  };

  const markets = marketsByClass[assetClass] || [
    { name: 'Market A', weight: 0.5 },
    { name: 'Market B', weight: 0.5 },
  ];

  return markets.map((mkt) => {
    const variance = (Math.random() - 0.5) * 0.02;
    const mktReturn = baseReturn + variance;
    const regionData = REGION_GEO_DATA[mkt.name] || { region: 'unknown' as GeographicRegion, latLong: { lat: 0, long: 0 } };

    return {
      id: genId(),
      label: mkt.name,
      shortLabel: mkt.name.split(' ')[0],
      value: mktReturn,
      weight: mkt.weight,
      region: regionData.region,
      latLong: regionData.latLong,
      assetClassType: ASSET_CLASS_MAP[assetClass] || 'equities',
      children: generateInstruments(mkt.name, mktReturn, assetClass),
      metadata: { type: 'market' },
    };
  });
}

/**
 * Generate asset classes for a portfolio
 */
function generateAssetClasses(portfolioReturn: number): DataNode[] {
  const assetClasses = [
    { name: 'Equities', weight: 0.60, returnMult: 1.3 },
    { name: 'Fixed Income', weight: 0.30, returnMult: 0.4 },
    { name: 'Alternatives', weight: 0.10, returnMult: 0.7 },
  ];

  return assetClasses.map((ac) => {
    const classReturn = portfolioReturn * ac.returnMult + (Math.random() - 0.5) * 0.02;

    return {
      id: genId(),
      label: ac.name,
      shortLabel: ac.name.substring(0, 3).toUpperCase(),
      value: classReturn,
      weight: ac.weight,
      assetClassType: ASSET_CLASS_MAP[ac.name] || 'equities',
      children: generateMarkets(ac.name, classReturn),
      metadata: { type: 'assetClass' },
    };
  });
}

/**
 * Generate multiple portfolios with full hierarchy
 */
export function generatePortfolios(): DataNode[] {
  idCounter = 0;

  const portfolios = [
    { name: 'Conservative', return: 0.045 },
    { name: 'Balanced', return: 0.065 },
    { name: 'Growth', return: 0.085 },
    { name: 'Aggressive', return: 0.105 },
  ];

  return portfolios.map((p) => ({
    id: genId(),
    label: `${p.name} Portfolio`,
    shortLabel: p.name.substring(0, 4),
    value: p.return + (Math.random() - 0.5) * 0.01,
    weight: 1,
    children: generateAssetClasses(p.return),
    metadata: { type: 'portfolio' },
  }));
}

/**
 * Simple demo with full hierarchy
 * Portfolio → Asset Class → Market → Instrument → Contribution
 */
export function generateSimpleDemo(): DataNode[] {
  idCounter = 0;

  return [
    {
      id: genId(),
      label: 'Growth Portfolio',
      shortLabel: 'Growth',
      value: 0.082,
      weight: 1,
      metadata: { type: 'portfolio' },
      children: [
        {
          id: genId(),
          label: 'Equities',
          shortLabel: 'EQU',
          value: 0.105,
          weight: 0.65,
          metadata: { type: 'assetClass' },
          children: [
            {
              id: genId(),
              label: 'US Equity',
              shortLabel: 'US',
              value: 0.12,
              weight: 0.55,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'AAPL - Apple Inc.',
                  shortLabel: 'AAPL',
                  value: 0.15,
                  weight: 0.25,
                  metadata: { type: 'instrument', ticker: 'AAPL', name: 'Apple Inc.' },
                  children: generateContributions(0.15, 'Apple Inc.'),
                },
                {
                  id: genId(),
                  label: 'MSFT - Microsoft Corp.',
                  shortLabel: 'MSFT',
                  value: 0.13,
                  weight: 0.25,
                  metadata: { type: 'instrument', ticker: 'MSFT', name: 'Microsoft Corp.' },
                  children: generateContributions(0.13, 'Microsoft Corp.'),
                },
                {
                  id: genId(),
                  label: 'GOOGL - Alphabet Inc.',
                  shortLabel: 'GOOGL',
                  value: 0.11,
                  weight: 0.20,
                  metadata: { type: 'instrument', ticker: 'GOOGL', name: 'Alphabet Inc.' },
                  children: generateContributions(0.11, 'Alphabet Inc.'),
                },
                {
                  id: genId(),
                  label: 'NVDA - NVIDIA Corp.',
                  shortLabel: 'NVDA',
                  value: 0.18,
                  weight: 0.30,
                  metadata: { type: 'instrument', ticker: 'NVDA', name: 'NVIDIA Corp.' },
                  children: generateContributions(0.18, 'NVIDIA Corp.'),
                },
              ],
            },
            {
              id: genId(),
              label: 'European Equity',
              shortLabel: 'EU',
              value: 0.08,
              weight: 0.25,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'ASML - ASML Holding',
                  shortLabel: 'ASML',
                  value: 0.14,
                  weight: 0.40,
                  metadata: { type: 'instrument', ticker: 'ASML', name: 'ASML Holding' },
                  children: generateContributions(0.14, 'ASML Holding'),
                },
                {
                  id: genId(),
                  label: 'NESN - Nestle SA',
                  shortLabel: 'NESN',
                  value: 0.05,
                  weight: 0.35,
                  metadata: { type: 'instrument', ticker: 'NESN', name: 'Nestle SA' },
                  children: generateContributions(0.05, 'Nestle SA'),
                },
                {
                  id: genId(),
                  label: 'ROG - Roche Holding',
                  shortLabel: 'ROG',
                  value: 0.06,
                  weight: 0.25,
                  metadata: { type: 'instrument', ticker: 'ROG', name: 'Roche Holding' },
                  children: generateContributions(0.06, 'Roche Holding'),
                },
              ],
            },
            {
              id: genId(),
              label: 'Asian Equity',
              shortLabel: 'ASIA',
              value: 0.095,
              weight: 0.20,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'TSM - Taiwan Semiconductor',
                  shortLabel: 'TSM',
                  value: 0.16,
                  weight: 0.50,
                  metadata: { type: 'instrument', ticker: 'TSM', name: 'Taiwan Semiconductor' },
                  children: generateContributions(0.16, 'Taiwan Semiconductor'),
                },
                {
                  id: genId(),
                  label: 'SONY - Sony Group',
                  shortLabel: 'SONY',
                  value: 0.07,
                  weight: 0.50,
                  metadata: { type: 'instrument', ticker: 'SONY', name: 'Sony Group' },
                  children: generateContributions(0.07, 'Sony Group'),
                },
              ],
            },
          ],
        },
        {
          id: genId(),
          label: 'Fixed Income',
          shortLabel: 'FI',
          value: 0.038,
          weight: 0.25,
          metadata: { type: 'assetClass' },
          children: [
            {
              id: genId(),
              label: 'Government Bonds',
              shortLabel: 'GOVT',
              value: 0.028,
              weight: 0.60,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'UST10Y - US Treasury 10Y',
                  shortLabel: 'UST10Y',
                  value: 0.032,
                  weight: 0.60,
                  metadata: { type: 'instrument', ticker: 'UST10Y', name: 'US Treasury 10Y' },
                  children: generateContributions(0.032, 'US Treasury 10Y'),
                },
                {
                  id: genId(),
                  label: 'BUND10Y - German Bund 10Y',
                  shortLabel: 'BUND',
                  value: 0.022,
                  weight: 0.40,
                  metadata: { type: 'instrument', ticker: 'BUND10Y', name: 'German Bund 10Y' },
                  children: generateContributions(0.022, 'German Bund 10Y'),
                },
              ],
            },
            {
              id: genId(),
              label: 'Corporate Bonds',
              shortLabel: 'CORP',
              value: 0.052,
              weight: 0.40,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'LQD - Investment Grade ETF',
                  shortLabel: 'LQD',
                  value: 0.045,
                  weight: 0.60,
                  metadata: { type: 'instrument', ticker: 'LQD', name: 'Investment Grade ETF' },
                  children: generateContributions(0.045, 'Investment Grade ETF'),
                },
                {
                  id: genId(),
                  label: 'HYG - High Yield ETF',
                  shortLabel: 'HYG',
                  value: 0.065,
                  weight: 0.40,
                  metadata: { type: 'instrument', ticker: 'HYG', name: 'High Yield ETF' },
                  children: generateContributions(0.065, 'High Yield ETF'),
                },
              ],
            },
          ],
        },
        {
          id: genId(),
          label: 'Alternatives',
          shortLabel: 'ALT',
          value: 0.055,
          weight: 0.10,
          metadata: { type: 'assetClass' },
          children: [
            {
              id: genId(),
              label: 'Commodities',
              shortLabel: 'CMDTY',
              value: 0.045,
              weight: 0.50,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'GLD - Gold',
                  shortLabel: 'GLD',
                  value: 0.04,
                  weight: 0.70,
                  metadata: { type: 'instrument', ticker: 'GLD', name: 'Gold' },
                  children: generateContributions(0.04, 'Gold'),
                },
                {
                  id: genId(),
                  label: 'SLV - Silver',
                  shortLabel: 'SLV',
                  value: 0.06,
                  weight: 0.30,
                  metadata: { type: 'instrument', ticker: 'SLV', name: 'Silver' },
                  children: generateContributions(0.06, 'Silver'),
                },
              ],
            },
            {
              id: genId(),
              label: 'Real Assets',
              shortLabel: 'REAL',
              value: 0.065,
              weight: 0.50,
              metadata: { type: 'market' },
              children: [
                {
                  id: genId(),
                  label: 'VNQ - US REITs',
                  shortLabel: 'VNQ',
                  value: 0.07,
                  weight: 0.60,
                  metadata: { type: 'instrument', ticker: 'VNQ', name: 'US REITs' },
                  children: generateContributions(0.07, 'US REITs'),
                },
                {
                  id: genId(),
                  label: 'VNQI - Intl REITs',
                  shortLabel: 'VNQI',
                  value: 0.055,
                  weight: 0.40,
                  metadata: { type: 'instrument', ticker: 'VNQI', name: 'Intl REITs' },
                  children: generateContributions(0.055, 'Intl REITs'),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: genId(),
      label: 'Conservative Portfolio',
      shortLabel: 'Cons',
      value: 0.042,
      weight: 1,
      metadata: { type: 'portfolio' },
      children: generateAssetClasses(0.042),
    },
    {
      id: genId(),
      label: 'Balanced Portfolio',
      shortLabel: 'Bal',
      value: 0.061,
      weight: 1,
      metadata: { type: 'portfolio' },
      children: generateAssetClasses(0.061),
    },
  ];
}
