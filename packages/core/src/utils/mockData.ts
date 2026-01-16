/**
 * Mock data generator for portfolio hierarchy
 *
 * Portfolio → Asset Class → Market → Instrument → Contribution
 * Updated with ~100 instruments per portfolio for particle visualization
 * Includes geographic coordinates for particle positioning
 */

import type { DataNode, GeographicRegion, LatLong, AssetClassType } from '../types';

let idCounter = 0;
const genId = () => `node-${++idCounter}`;

/**
 * Extended instrument data with geographic coordinates
 */
interface InstrumentData {
  ticker: string;
  name: string;
  latLong: LatLong;
}

/**
 * Comprehensive instrument lists by market
 */
const INSTRUMENTS_BY_MARKET: Record<string, { region: GeographicRegion; instruments: InstrumentData[] }> = {
  'US Equity': {
    region: 'north-america',
    instruments: [
      // Tech
      { ticker: 'AAPL', name: 'Apple Inc.', latLong: { lat: 37.33, long: -122.03 } },
      { ticker: 'MSFT', name: 'Microsoft Corp.', latLong: { lat: 47.64, long: -122.13 } },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', latLong: { lat: 37.42, long: -122.08 } },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', latLong: { lat: 47.62, long: -122.33 } },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', latLong: { lat: 37.37, long: -121.99 } },
      { ticker: 'META', name: 'Meta Platforms', latLong: { lat: 37.48, long: -122.15 } },
      { ticker: 'TSLA', name: 'Tesla Inc.', latLong: { lat: 37.39, long: -122.03 } },
      { ticker: 'AVGO', name: 'Broadcom Inc.', latLong: { lat: 37.40, long: -121.95 } },
      { ticker: 'ORCL', name: 'Oracle Corp.', latLong: { lat: 37.53, long: -122.26 } },
      { ticker: 'CRM', name: 'Salesforce Inc.', latLong: { lat: 37.79, long: -122.40 } },
      { ticker: 'AMD', name: 'AMD Inc.', latLong: { lat: 37.38, long: -121.96 } },
      { ticker: 'INTC', name: 'Intel Corp.', latLong: { lat: 37.39, long: -121.96 } },
      { ticker: 'CSCO', name: 'Cisco Systems', latLong: { lat: 37.41, long: -121.95 } },
      { ticker: 'ADBE', name: 'Adobe Inc.', latLong: { lat: 37.33, long: -121.89 } },
      { ticker: 'NFLX', name: 'Netflix Inc.', latLong: { lat: 37.26, long: -121.95 } },
      // Finance
      { ticker: 'JPM', name: 'JPMorgan Chase', latLong: { lat: 40.76, long: -73.98 } },
      { ticker: 'BAC', name: 'Bank of America', latLong: { lat: 35.23, long: -80.84 } },
      { ticker: 'WFC', name: 'Wells Fargo', latLong: { lat: 37.79, long: -122.40 } },
      { ticker: 'GS', name: 'Goldman Sachs', latLong: { lat: 40.71, long: -74.01 } },
      { ticker: 'MS', name: 'Morgan Stanley', latLong: { lat: 40.76, long: -73.98 } },
      { ticker: 'C', name: 'Citigroup', latLong: { lat: 40.72, long: -74.01 } },
      { ticker: 'BLK', name: 'BlackRock', latLong: { lat: 40.76, long: -73.97 } },
      { ticker: 'SCHW', name: 'Charles Schwab', latLong: { lat: 37.80, long: -122.41 } },
      // Healthcare
      { ticker: 'JNJ', name: 'Johnson & Johnson', latLong: { lat: 40.49, long: -74.44 } },
      { ticker: 'UNH', name: 'UnitedHealth', latLong: { lat: 44.98, long: -93.27 } },
      { ticker: 'PFE', name: 'Pfizer Inc.', latLong: { lat: 40.75, long: -73.97 } },
      { ticker: 'ABBV', name: 'AbbVie Inc.', latLong: { lat: 42.28, long: -87.95 } },
      { ticker: 'MRK', name: 'Merck & Co.', latLong: { lat: 40.79, long: -74.21 } },
      { ticker: 'LLY', name: 'Eli Lilly', latLong: { lat: 39.77, long: -86.16 } },
      { ticker: 'TMO', name: 'Thermo Fisher', latLong: { lat: 42.36, long: -71.06 } },
      // Consumer
      { ticker: 'PG', name: 'Procter & Gamble', latLong: { lat: 39.10, long: -84.51 } },
      { ticker: 'KO', name: 'Coca-Cola Co.', latLong: { lat: 33.75, long: -84.39 } },
      { ticker: 'PEP', name: 'PepsiCo Inc.', latLong: { lat: 41.08, long: -73.71 } },
      { ticker: 'WMT', name: 'Walmart Inc.', latLong: { lat: 36.37, long: -94.21 } },
      { ticker: 'HD', name: 'Home Depot', latLong: { lat: 33.76, long: -84.38 } },
      { ticker: 'MCD', name: "McDonald's Corp.", latLong: { lat: 41.88, long: -87.63 } },
      { ticker: 'NKE', name: 'Nike Inc.', latLong: { lat: 45.51, long: -122.80 } },
      { ticker: 'COST', name: 'Costco Wholesale', latLong: { lat: 47.58, long: -122.15 } },
    ],
  },
  'European Equity': {
    region: 'europe',
    instruments: [
      // Switzerland
      { ticker: 'NESN', name: 'Nestle SA', latLong: { lat: 46.47, long: 6.51 } },
      { ticker: 'ROG', name: 'Roche Holding', latLong: { lat: 47.56, long: 7.59 } },
      { ticker: 'NOVN', name: 'Novartis AG', latLong: { lat: 47.56, long: 7.58 } },
      { ticker: 'UBSG', name: 'UBS Group', latLong: { lat: 47.37, long: 8.54 } },
      { ticker: 'ZURN', name: 'Zurich Insurance', latLong: { lat: 47.37, long: 8.54 } },
      // Netherlands
      { ticker: 'ASML', name: 'ASML Holding', latLong: { lat: 51.42, long: 5.45 } },
      { ticker: 'SHELL', name: 'Shell PLC', latLong: { lat: 52.08, long: 4.31 } },
      { ticker: 'UNA', name: 'Unilever NV', latLong: { lat: 52.09, long: 5.12 } },
      // Germany
      { ticker: 'SAP', name: 'SAP SE', latLong: { lat: 49.29, long: 8.64 } },
      { ticker: 'SIE', name: 'Siemens AG', latLong: { lat: 48.14, long: 11.58 } },
      { ticker: 'ALV', name: 'Allianz SE', latLong: { lat: 48.14, long: 11.58 } },
      { ticker: 'DTE', name: 'Deutsche Telekom', latLong: { lat: 50.94, long: 6.96 } },
      { ticker: 'MBG', name: 'Mercedes-Benz', latLong: { lat: 48.78, long: 9.18 } },
      { ticker: 'BMW', name: 'BMW AG', latLong: { lat: 48.18, long: 11.56 } },
      { ticker: 'VOW', name: 'Volkswagen AG', latLong: { lat: 52.43, long: 10.79 } },
      // France
      { ticker: 'MC', name: 'LVMH', latLong: { lat: 48.87, long: 2.33 } },
      { ticker: 'OR', name: "L'Oreal SA", latLong: { lat: 48.88, long: 2.30 } },
      { ticker: 'TTE', name: 'TotalEnergies', latLong: { lat: 48.90, long: 2.24 } },
      { ticker: 'SAN', name: 'Sanofi SA', latLong: { lat: 48.84, long: 2.27 } },
      { ticker: 'AIR', name: 'Airbus SE', latLong: { lat: 43.61, long: 1.44 } },
      // UK
      { ticker: 'AZN', name: 'AstraZeneca', latLong: { lat: 51.51, long: -0.13 } },
      { ticker: 'HSBA', name: 'HSBC Holdings', latLong: { lat: 51.51, long: -0.08 } },
      { ticker: 'ULVR', name: 'Unilever PLC', latLong: { lat: 51.51, long: -0.10 } },
      { ticker: 'GSK', name: 'GSK PLC', latLong: { lat: 51.50, long: -0.17 } },
      { ticker: 'BP', name: 'BP PLC', latLong: { lat: 51.51, long: -0.07 } },
      { ticker: 'RIO', name: 'Rio Tinto', latLong: { lat: 51.51, long: -0.13 } },
    ],
  },
  'Asian Equity': {
    region: 'asia',
    instruments: [
      // Taiwan
      { ticker: 'TSM', name: 'Taiwan Semiconductor', latLong: { lat: 24.78, long: 121.02 } },
      { ticker: 'HON', name: 'Hon Hai Precision', latLong: { lat: 25.04, long: 121.53 } },
      { ticker: 'MEDI', name: 'MediaTek Inc.', latLong: { lat: 24.78, long: 121.00 } },
      // China
      { ticker: 'BABA', name: 'Alibaba Group', latLong: { lat: 30.27, long: 120.15 } },
      { ticker: 'TCEHY', name: 'Tencent Holdings', latLong: { lat: 22.54, long: 114.06 } },
      { ticker: 'JD', name: 'JD.com Inc.', latLong: { lat: 39.91, long: 116.40 } },
      { ticker: 'PDD', name: 'PDD Holdings', latLong: { lat: 31.23, long: 121.47 } },
      { ticker: 'BIDU', name: 'Baidu Inc.', latLong: { lat: 39.98, long: 116.31 } },
      { ticker: 'NIO', name: 'NIO Inc.', latLong: { lat: 31.23, long: 121.47 } },
      { ticker: 'XPEV', name: 'XPeng Inc.', latLong: { lat: 23.13, long: 113.26 } },
      // Japan
      { ticker: 'SONY', name: 'Sony Group', latLong: { lat: 35.65, long: 139.74 } },
      { ticker: 'TM', name: 'Toyota Motor', latLong: { lat: 35.05, long: 137.16 } },
      { ticker: 'NTT', name: 'Nippon Telegraph', latLong: { lat: 35.68, long: 139.69 } },
      { ticker: 'MUFG', name: 'Mitsubishi UFJ', latLong: { lat: 35.67, long: 139.77 } },
      { ticker: 'HMC', name: 'Honda Motor', latLong: { lat: 35.66, long: 139.75 } },
      { ticker: 'SNE', name: 'Sony Entertainment', latLong: { lat: 35.65, long: 139.74 } },
      // Korea
      { ticker: 'SSNL', name: 'Samsung Electronics', latLong: { lat: 37.24, long: 127.05 } },
      { ticker: 'HYMTF', name: 'Hyundai Motor', latLong: { lat: 37.55, long: 127.05 } },
      { ticker: 'SKH', name: 'SK Hynix', latLong: { lat: 37.24, long: 127.05 } },
    ],
  },
  'Emerging Markets': {
    region: 'emerging-markets',
    instruments: [
      // Brazil
      { ticker: 'VALE', name: 'Vale SA', latLong: { lat: -20.32, long: -43.13 } },
      { ticker: 'PBR', name: 'Petrobras', latLong: { lat: -22.91, long: -43.17 } },
      { ticker: 'ITUB', name: 'Itau Unibanco', latLong: { lat: -23.55, long: -46.63 } },
      { ticker: 'BBD', name: 'Banco Bradesco', latLong: { lat: -23.55, long: -46.63 } },
      { ticker: 'ABEV', name: 'Ambev SA', latLong: { lat: -23.55, long: -46.63 } },
      // India
      { ticker: 'INFY', name: 'Infosys Ltd', latLong: { lat: 12.97, long: 77.59 } },
      { ticker: 'TCS', name: 'Tata Consultancy', latLong: { lat: 19.08, long: 72.88 } },
      { ticker: 'RELI', name: 'Reliance Industries', latLong: { lat: 19.08, long: 72.88 } },
      { ticker: 'HDBK', name: 'HDFC Bank', latLong: { lat: 19.08, long: 72.88 } },
      { ticker: 'WIPR', name: 'Wipro Ltd', latLong: { lat: 12.97, long: 77.59 } },
      // Mexico
      { ticker: 'AMX', name: 'America Movil', latLong: { lat: 19.43, long: -99.13 } },
      { ticker: 'WALMEX', name: 'Walmart de Mexico', latLong: { lat: 19.43, long: -99.13 } },
      // South Africa
      { ticker: 'NPN', name: 'Naspers Ltd', latLong: { lat: -33.93, long: 18.42 } },
      { ticker: 'SBKS', name: 'Standard Bank', latLong: { lat: -26.20, long: 28.04 } },
      // Southeast Asia
      { ticker: 'GRAB', name: 'Grab Holdings', latLong: { lat: 1.35, long: 103.82 } },
      { ticker: 'SE', name: 'Sea Ltd', latLong: { lat: 1.29, long: 103.85 } },
    ],
  },
  'Government Bonds': {
    region: 'global',
    instruments: [
      { ticker: 'UST2Y', name: 'US Treasury 2Y', latLong: { lat: 38.89, long: -77.03 } },
      { ticker: 'UST5Y', name: 'US Treasury 5Y', latLong: { lat: 38.90, long: -77.02 } },
      { ticker: 'UST10Y', name: 'US Treasury 10Y', latLong: { lat: 38.91, long: -77.01 } },
      { ticker: 'UST30Y', name: 'US Treasury 30Y', latLong: { lat: 38.92, long: -77.00 } },
      { ticker: 'TIPS', name: 'Treasury Inflation', latLong: { lat: 38.88, long: -77.04 } },
      { ticker: 'BUND2Y', name: 'German Bund 2Y', latLong: { lat: 50.11, long: 8.66 } },
      { ticker: 'BUND10Y', name: 'German Bund 10Y', latLong: { lat: 50.11, long: 8.68 } },
      { ticker: 'BUND30Y', name: 'German Bund 30Y', latLong: { lat: 50.11, long: 8.70 } },
      { ticker: 'JGB5Y', name: 'Japan JGB 5Y', latLong: { lat: 35.68, long: 139.73 } },
      { ticker: 'JGB10Y', name: 'Japan JGB 10Y', latLong: { lat: 35.68, long: 139.75 } },
      { ticker: 'GILT10Y', name: 'UK Gilt 10Y', latLong: { lat: 51.51, long: -0.13 } },
      { ticker: 'OAT10Y', name: 'French OAT 10Y', latLong: { lat: 48.86, long: 2.35 } },
    ],
  },
  'Corporate Bonds': {
    region: 'global',
    instruments: [
      { ticker: 'LQD', name: 'IG Corporate ETF', latLong: { lat: 40.71, long: -74.01 } },
      { ticker: 'VCIT', name: 'Intermediate Corp', latLong: { lat: 40.72, long: -74.00 } },
      { ticker: 'VCLT', name: 'Long-term Corp', latLong: { lat: 40.73, long: -73.99 } },
      { ticker: 'HYG', name: 'High Yield ETF', latLong: { lat: 41.88, long: -87.63 } },
      { ticker: 'JNK', name: 'SPDR High Yield', latLong: { lat: 42.36, long: -71.06 } },
      { ticker: 'EMB', name: 'EM Bond ETF', latLong: { lat: 40.74, long: -73.99 } },
      { ticker: 'BNDX', name: 'Intl Bond ETF', latLong: { lat: 40.75, long: -73.98 } },
      { ticker: 'VWOB', name: 'EM Govt Bond', latLong: { lat: 40.76, long: -73.97 } },
    ],
  },
  'Commodities': {
    region: 'global',
    instruments: [
      { ticker: 'GLD', name: 'Gold', latLong: { lat: 51.51, long: -0.13 } },
      { ticker: 'SLV', name: 'Silver', latLong: { lat: 51.51, long: -0.12 } },
      { ticker: 'PPLT', name: 'Platinum', latLong: { lat: -26.20, long: 28.04 } },
      { ticker: 'CL', name: 'Crude Oil WTI', latLong: { lat: 29.76, long: -95.37 } },
      { ticker: 'BRN', name: 'Brent Crude', latLong: { lat: 51.51, long: -0.13 } },
      { ticker: 'NG', name: 'Natural Gas', latLong: { lat: 29.76, long: -95.36 } },
      { ticker: 'CORN', name: 'Corn Futures', latLong: { lat: 41.88, long: -87.63 } },
      { ticker: 'WEAT', name: 'Wheat Futures', latLong: { lat: 41.88, long: -87.62 } },
      { ticker: 'SOYB', name: 'Soybean', latLong: { lat: 41.88, long: -87.61 } },
      { ticker: 'CPER', name: 'Copper', latLong: { lat: 51.51, long: -0.11 } },
    ],
  },
  'Real Assets': {
    region: 'global',
    instruments: [
      { ticker: 'VNQ', name: 'US REITs', latLong: { lat: 40.75, long: -73.99 } },
      { ticker: 'VNQI', name: 'Intl REITs', latLong: { lat: 48.86, long: 2.35 } },
      { ticker: 'XLRE', name: 'Real Estate Select', latLong: { lat: 40.76, long: -73.98 } },
      { ticker: 'IYR', name: 'iShares US Real Est', latLong: { lat: 40.77, long: -73.97 } },
      { ticker: 'WOOD', name: 'Timber', latLong: { lat: 45.52, long: -122.68 } },
      { ticker: 'LAND', name: 'Farmland Partners', latLong: { lat: 39.74, long: -104.99 } },
      { ticker: 'INFRA', name: 'Infrastructure', latLong: { lat: 40.78, long: -73.96 } },
      { ticker: 'PAVE', name: 'US Infrastructure', latLong: { lat: 40.79, long: -73.95 } },
    ],
  },
};

/**
 * Map asset class names to types
 */
const ASSET_CLASS_MAP: Record<string, AssetClassType> = {
  'Equities': 'equities',
  'Fixed Income': 'fixed-income',
  'Alternatives': 'alternatives',
};

// Contribution model descriptions
interface ContributionModelData {
  description: string;
  methodology: string;
  confidenceLevel: number;
  keyAssumptions: string;
  limitations: string;
}

const CONTRIBUTION_MODELS: Record<string, ContributionModelData> = {
  'Equilibrium Return': {
    description: 'Market-implied expected return based on market cap weights and global risk premia.',
    methodology: 'Derived from reverse optimization of the global market portfolio using CAPM.',
    confidenceLevel: 0.85,
    keyAssumptions: 'Markets are mean-variance efficient; investors have quadratic utility.',
    limitations: 'Assumes rational investors with access to same information.',
  },
  'Momentum Signal': {
    description: 'Return contribution from price momentum factors capturing trend persistence.',
    methodology: 'Cross-sectional momentum ranking with volatility scaling.',
    confidenceLevel: 0.78,
    keyAssumptions: 'Price trends persist due to underreaction to information.',
    limitations: 'Subject to momentum crashes during market reversals.',
  },
  'Value Signal': {
    description: 'Return contribution from valuation-based factors identifying undervalued securities.',
    methodology: 'Composite value score using fundamental ratios relative to peers.',
    confidenceLevel: 0.82,
    keyAssumptions: 'Markets eventually recognize intrinsic value.',
    limitations: 'Value stocks may remain cheap for extended periods.',
  },
  'Quality Signal': {
    description: 'Return contribution from quality metrics identifying sustainable advantages.',
    methodology: 'Multi-factor quality score emphasizing profitability and financial health.',
    confidenceLevel: 0.80,
    keyAssumptions: 'Past profitability indicates future profitability.',
    limitations: 'Quality premium may be arbitraged away over time.',
  },
  'Analyst Views': {
    description: 'Return contribution from analyst consensus estimates and recommendations.',
    methodology: 'Black-Litterman views from analyst target prices with accuracy weighting.',
    confidenceLevel: 0.75,
    keyAssumptions: 'Analyst estimates contain information not fully reflected in prices.',
    limitations: 'Analysts exhibit biases including optimism and herding.',
  },
  'Macro Overlay': {
    description: 'Return adjustment based on macroeconomic regime and business cycle.',
    methodology: 'Regime-switching model with GDP, inflation, and monetary policy indicators.',
    confidenceLevel: 0.70,
    keyAssumptions: 'Economic regimes are identifiable in real-time.',
    limitations: 'Structural changes may invalidate historical relationships.',
  },
};

/**
 * Generate contribution components for an instrument
 */
function generateContributions(instrumentReturn: number, instrumentName: string): DataNode[] {
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
        confidenceLevel: model.confidenceLevel,
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
  const marketData = INSTRUMENTS_BY_MARKET[market];
  if (!marketData) {
    return [];
  }

  const instruments = marketData.instruments;
  const count = instruments.length;

  return instruments.map((inst) => {
    const variance = (Math.random() - 0.5) * 0.08;
    const instReturn = baseReturn + variance;
    const weight = 1 / count;

    return {
      id: genId(),
      label: `${inst.ticker} - ${inst.name}`,
      shortLabel: inst.ticker,
      value: instReturn,
      weight,
      region: marketData.region,
      latLong: inst.latLong,
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

  const markets = marketsByClass[assetClass] || [];

  return markets.map((mkt) => {
    const variance = (Math.random() - 0.5) * 0.02;
    const mktReturn = baseReturn + variance;
    const marketData = INSTRUMENTS_BY_MARKET[mkt.name];
    const region = marketData?.region || 'global';

    return {
      id: genId(),
      label: mkt.name,
      shortLabel: mkt.name.split(' ')[0],
      value: mktReturn,
      weight: mkt.weight,
      region,
      latLong: marketData?.instruments[0]?.latLong || { lat: 0, long: 0 },
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
 * Each portfolio has approximately 100 instruments
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
 * Simple demo with full hierarchy - ~100 instruments
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
      children: generateAssetClasses(0.082),
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
