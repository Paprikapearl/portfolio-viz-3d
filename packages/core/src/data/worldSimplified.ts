/**
 * Simplified World Geometry
 *
 * Simplified continent outlines for the globe visualization.
 * Coordinates are [latitude, longitude] pairs defining polygon outlines.
 * These are deliberately simplified (low polygon count) for visual appeal
 * and performance, not geographic accuracy.
 */

export interface ContinentData {
  name: string;
  coordinates: Array<[number, number]>; // [lat, long]
  center: [number, number];
}

/**
 * North America - simplified outline
 */
export const northAmerica: ContinentData = {
  name: 'North America',
  center: [45, -100],
  coordinates: [
    [60, -140],
    [70, -140],
    [72, -95],
    [65, -60],
    [45, -55],
    [30, -80],
    [25, -98],
    [30, -118],
    [35, -120],
    [48, -125],
    [55, -130],
    [60, -140],
  ],
};

/**
 * South America - simplified outline
 */
export const southAmerica: ContinentData = {
  name: 'South America',
  center: [-15, -60],
  coordinates: [
    [12, -72],
    [5, -60],
    [-5, -35],
    [-22, -40],
    [-35, -55],
    [-55, -68],
    [-50, -75],
    [-40, -72],
    [-20, -70],
    [-5, -80],
    [10, -78],
    [12, -72],
  ],
};

/**
 * Europe - simplified outline
 */
export const europe: ContinentData = {
  name: 'Europe',
  center: [50, 10],
  coordinates: [
    [35, -10],
    [43, -9],
    [48, -5],
    [52, 0],
    [58, 0],
    [65, 10],
    [70, 28],
    [65, 40],
    [55, 40],
    [45, 40],
    [38, 28],
    [35, 28],
    [36, 15],
    [38, 0],
    [35, -10],
  ],
};

/**
 * Africa - simplified outline
 */
export const africa: ContinentData = {
  name: 'Africa',
  center: [0, 20],
  coordinates: [
    [35, -5],
    [32, 10],
    [32, 32],
    [22, 37],
    [12, 43],
    [0, 42],
    [-12, 40],
    [-25, 35],
    [-35, 20],
    [-35, 18],
    [-28, 15],
    [-20, 12],
    [-5, 8],
    [5, -5],
    [15, -17],
    [25, -15],
    [35, -5],
  ],
};

/**
 * Asia - simplified outline
 */
export const asia: ContinentData = {
  name: 'Asia',
  center: [45, 90],
  coordinates: [
    [65, 40],
    [75, 60],
    [75, 100],
    [72, 140],
    [65, 170],
    [55, 165],
    [50, 140],
    [35, 130],
    [35, 120],
    [22, 120],
    [10, 105],
    [5, 100],
    [10, 78],
    [25, 68],
    [30, 70],
    [28, 50],
    [35, 35],
    [45, 40],
    [55, 40],
    [65, 40],
  ],
};

/**
 * Australia - simplified outline
 */
export const australia: ContinentData = {
  name: 'Australia',
  center: [-25, 135],
  coordinates: [
    [-12, 130],
    [-12, 142],
    [-18, 148],
    [-28, 153],
    [-38, 147],
    [-38, 140],
    [-32, 133],
    [-32, 125],
    [-22, 115],
    [-15, 122],
    [-12, 130],
  ],
};

/**
 * All continents
 */
export const continents: ContinentData[] = [
  northAmerica,
  southAmerica,
  europe,
  africa,
  asia,
  australia,
];

/**
 * Get a continent by name
 */
export function getContinentByName(name: string): ContinentData | undefined {
  return continents.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Major latitude lines for reference
 */
export const latitudeLines: number[] = [
  66.5,   // Arctic Circle
  23.5,   // Tropic of Cancer
  0,      // Equator
  -23.5,  // Tropic of Capricorn
  -66.5,  // Antarctic Circle
];

/**
 * Major longitude lines for reference
 */
export const longitudeLines: number[] = [
  -180, -150, -120, -90, -60, -30,
  0, 30, 60, 90, 120, 150, 180,
];

/**
 * Generate graticule (grid) lines for the globe
 *
 * @param latStep Degrees between latitude lines
 * @param longStep Degrees between longitude lines
 * @returns Array of line segments, each as array of [lat, long] pairs
 */
export function generateGraticule(
  latStep: number = 30,
  longStep: number = 30
): Array<Array<[number, number]>> {
  const lines: Array<Array<[number, number]>> = [];

  // Latitude lines (horizontal circles)
  for (let lat = -60; lat <= 60; lat += latStep) {
    const line: Array<[number, number]> = [];
    for (let long = -180; long <= 180; long += 10) {
      line.push([lat, long]);
    }
    lines.push(line);
  }

  // Longitude lines (vertical arcs)
  for (let long = -180; long < 180; long += longStep) {
    const line: Array<[number, number]> = [];
    for (let lat = -80; lat <= 80; lat += 10) {
      line.push([lat, long]);
    }
    lines.push(line);
  }

  return lines;
}

/**
 * Region bounding boxes for camera focusing
 */
export const regionBounds: Record<string, {
  center: [number, number];
  latRange: [number, number];
  longRange: [number, number];
}> = {
  'north-america': {
    center: [40, -100],
    latRange: [15, 70],
    longRange: [-170, -50],
  },
  'europe': {
    center: [50, 10],
    latRange: [35, 70],
    longRange: [-10, 40],
  },
  'asia': {
    center: [35, 100],
    latRange: [5, 70],
    longRange: [60, 145],
  },
  'emerging-markets': {
    center: [-10, 20],
    latRange: [-40, 30],
    longRange: [-80, 120],
  },
};
