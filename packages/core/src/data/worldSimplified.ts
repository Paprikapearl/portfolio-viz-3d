/**
 * World Geometry Data
 *
 * More detailed continent outlines for the globe visualization.
 * Coordinates are [latitude, longitude] pairs defining polygon outlines.
 */

export interface ContinentData {
  name: string;
  coordinates: Array<[number, number]>; // [lat, long]
  center: [number, number];
}

/**
 * North America - detailed outline
 */
export const northAmerica: ContinentData = {
  name: 'North America',
  center: [45, -100],
  coordinates: [
    // Alaska
    [70, -168], [71, -156], [70, -145], [68, -141],
    // Canada north coast
    [69, -137], [70, -128], [72, -122], [74, -115], [76, -100], [76, -90],
    [73, -85], [70, -85], [68, -78], [65, -64], [60, -64],
    // Eastern Canada
    [55, -58], [52, -55], [47, -53], [46, -60], [45, -64], [44, -66],
    // US East Coast
    [42, -70], [41, -72], [39, -74], [37, -76], [35, -75], [32, -80],
    [30, -81], [28, -80], [25, -80],
    // Florida
    [24, -82], [26, -82], [29, -84], [30, -86],
    // Gulf Coast
    [30, -88], [30, -90], [29, -94], [28, -96], [26, -97],
    // Mexico
    [23, -97], [20, -97], [18, -95], [16, -94], [15, -92],
    // Central America
    [16, -88], [15, -84], [12, -83], [9, -79], [8, -77],
    // Mexico West
    [16, -93], [19, -105], [22, -106], [24, -108], [28, -112],
    [31, -114], [32, -117],
    // US West Coast
    [33, -117], [34, -120], [37, -122], [40, -124], [43, -124],
    [46, -124], [48, -123],
    // Canada West
    [49, -125], [52, -128], [54, -130], [56, -132], [58, -136],
    [60, -140], [61, -147], [64, -153], [66, -162], [68, -165],
    [70, -168],
  ],
};

/**
 * South America - detailed outline
 */
export const southAmerica: ContinentData = {
  name: 'South America',
  center: [-15, -60],
  coordinates: [
    // Colombia/Venezuela coast
    [12, -72], [11, -74], [12, -71], [11, -68], [10, -65], [10, -62],
    // Brazil north
    [5, -60], [4, -52], [2, -50], [0, -50], [-2, -44], [-4, -38],
    // Brazil east coast
    [-6, -35], [-8, -35], [-10, -36], [-13, -38], [-16, -39],
    [-18, -39], [-20, -40], [-23, -42], [-25, -47],
    // Brazil/Uruguay/Argentina
    [-28, -49], [-32, -52], [-35, -57], [-38, -58],
    // Argentina
    [-41, -63], [-45, -66], [-48, -66], [-50, -68],
    // Tierra del Fuego
    [-52, -70], [-54, -68], [-55, -67], [-54, -64],
    // Argentina west
    [-52, -72], [-48, -74], [-44, -73], [-40, -72], [-36, -72],
    // Chile
    [-32, -71], [-28, -71], [-24, -70], [-20, -70], [-16, -73],
    // Peru
    [-12, -77], [-8, -79], [-5, -81], [-2, -80],
    // Ecuador/Colombia
    [0, -80], [2, -78], [4, -77], [7, -77], [10, -75], [12, -72],
  ],
};

/**
 * Europe - detailed outline
 */
export const europe: ContinentData = {
  name: 'Europe',
  center: [50, 10],
  coordinates: [
    // Portugal/Spain
    [37, -9], [37, -7], [36, -5], [36, -2], [38, 0],
    // Spain/France Mediterranean
    [40, 0], [42, 3], [43, 5], [43, 7],
    // France Atlantic
    [44, -1], [46, -1], [47, -2], [48, -4], [48, -1],
    // English Channel / UK approximation point
    [50, -5], [51, 1],
    // Low Countries
    [52, 4], [53, 5], [54, 8],
    // Denmark
    [55, 8], [56, 8], [57, 10], [55, 12],
    // Baltic
    [54, 14], [54, 18], [56, 21], [58, 24], [60, 25],
    // Finland
    [62, 28], [65, 26], [68, 28], [70, 28],
    // Norway
    [71, 25], [70, 20], [68, 15], [64, 11], [62, 5], [60, 5],
    [58, 7], [57, 7],
    // Back through Baltic
    [55, 13], [54, 10],
    // Germany/Poland
    [52, 14], [50, 14],
    // Back west
    [49, 8], [47, 7], [46, 6],
    // Alps / Italy
    [46, 10], [47, 12], [46, 13],
    // Italy
    [45, 12], [44, 12], [43, 13], [42, 14], [41, 16], [40, 18],
    [38, 16], [37, 15],
    // Sicily approximate
    [38, 13], [37, 14],
    // Back to Italy toe
    [39, 17], [40, 18], [41, 17], [42, 16],
    // Adriatic up
    [43, 14], [45, 14], [46, 14],
    // Balkans
    [45, 18], [45, 20], [44, 22], [42, 23], [40, 24],
    // Greece
    [39, 23], [38, 24], [37, 24], [36, 28], [38, 26],
    [40, 26], [41, 26],
    // Turkey (European part)
    [42, 28], [41, 29],
    // Black Sea
    [43, 28], [44, 34], [46, 36], [47, 40],
    // Eastern Europe
    [50, 40], [55, 38], [58, 32], [60, 30],
    // Back to Scandinavia connection
    [60, 28],
    // Western loop back
    [50, 30], [48, 24], [47, 19], [46, 16],
    [45, 14], [44, 8], [43, 3], [42, -1], [40, -4], [38, -6], [37, -9],
  ],
};

/**
 * Africa - detailed outline
 */
export const africa: ContinentData = {
  name: 'Africa',
  center: [0, 20],
  coordinates: [
    // Morocco
    [35, -6], [34, -2], [36, 0], [37, 10],
    // Tunisia/Libya
    [37, 10], [33, 12], [32, 15], [32, 20], [31, 25],
    // Egypt
    [31, 32], [30, 32], [29, 33], [27, 34], [24, 35], [22, 36],
    // Red Sea coast
    [20, 37], [16, 40], [12, 43], [11, 44],
    // Horn of Africa
    [10, 45], [12, 48], [12, 51], [10, 51],
    // East Africa coast
    [5, 42], [0, 42], [-4, 40], [-8, 40], [-11, 40],
    // Mozambique
    [-15, 40], [-18, 38], [-22, 35], [-26, 33],
    // South Africa
    [-30, 31], [-32, 29], [-34, 26], [-34, 22], [-34, 18],
    // Cape
    [-33, 18], [-32, 18], [-30, 17], [-28, 15],
    // West coast going north
    [-25, 14], [-22, 14], [-18, 12], [-15, 12], [-10, 8],
    [-5, 5], [0, 2], [5, 0], [6, -3],
    // Gulf of Guinea
    [4, -7], [5, -5], [6, 1], [5, 5], [4, 8], [5, 10],
    // Nigeria to Senegal
    [10, 10], [14, 14], [15, 10], [16, 5], [17, -3], [20, -6],
    [15, -17], [17, -16], [21, -17],
    // Mauritania/Western Sahara
    [24, -16], [27, -13], [29, -10], [32, -8], [35, -6],
  ],
};

/**
 * Asia - detailed outline
 */
export const asia: ContinentData = {
  name: 'Asia',
  center: [45, 90],
  coordinates: [
    // Starting from Turkey/Middle East
    [42, 28], [40, 30], [38, 35], [37, 36],
    // Syria/Lebanon/Israel coast
    [36, 36], [34, 36], [32, 35], [30, 35], [29, 33],
    // Arabian Peninsula
    [28, 34], [24, 37], [20, 40], [15, 43], [13, 45],
    [13, 48], [16, 52], [22, 55], [24, 56], [26, 56],
    // Iran/Pakistan
    [26, 62], [25, 63], [24, 67], [25, 70],
    // India
    [23, 70], [22, 72], [20, 73], [18, 73], [15, 74], [12, 75],
    [8, 77], [8, 78], [10, 80], [13, 80], [16, 82],
    // Bay of Bengal
    [20, 87], [22, 88], [22, 90], [24, 90],
    // Bangladesh/Myanmar
    [26, 92], [24, 94], [20, 93], [16, 96], [14, 98],
    // Thailand/Malaysia
    [10, 99], [7, 100], [5, 100], [2, 103], [1, 104],
    // Indonesia approximate
    [0, 105], [-2, 106], [-6, 106], [-8, 114], [-8, 118],
    [-5, 120], [0, 120], [2, 118],
    // Philippines approximate
    [6, 120], [10, 119], [14, 120], [18, 122],
    // Back to mainland
    [20, 110], [22, 108], [21, 106], [18, 106],
    // Vietnam
    [16, 108], [12, 109], [10, 106], [8, 105],
    // China coast
    [22, 114], [24, 118], [26, 120], [28, 122], [30, 122],
    [32, 122], [34, 120], [36, 122], [38, 122], [40, 122],
    // Korea
    [42, 128], [43, 131], [42, 130], [38, 128], [35, 126], [34, 128],
    // Japan approximate
    [34, 130], [36, 136], [38, 140], [40, 140], [42, 143], [44, 145],
    // Russia Far East
    [46, 143], [50, 140], [54, 137], [58, 140], [62, 150],
    [65, 168], [68, 175], [70, 180],
    // Russia Arctic coast
    [72, 175], [74, 150], [76, 120], [76, 100], [76, 80], [74, 70],
    [72, 60], [70, 55],
    // Russia European part
    [66, 50], [62, 45], [58, 50], [55, 60], [52, 55], [50, 52],
    [48, 50], [46, 48], [44, 40], [42, 28],
  ],
};

/**
 * Australia - detailed outline
 */
export const australia: ContinentData = {
  name: 'Australia',
  center: [-25, 135],
  coordinates: [
    // Northern Territory
    [-12, 130], [-12, 132], [-11, 132], [-12, 136], [-14, 136],
    // Gulf of Carpentaria
    [-16, 138], [-17, 140], [-16, 141],
    // Cape York
    [-11, 142], [-10, 143], [-14, 144],
    // Queensland coast
    [-17, 146], [-19, 147], [-21, 149], [-24, 152], [-27, 153],
    // New South Wales
    [-29, 153], [-32, 152], [-35, 151], [-37, 150],
    // Victoria / Bass Strait
    [-38, 147], [-39, 146], [-39, 144],
    // South Australia
    [-38, 141], [-37, 140], [-36, 138], [-35, 137], [-34, 136],
    [-35, 135], [-34, 135], [-32, 133], [-32, 131],
    // Western Australia south
    [-34, 124], [-34, 120], [-34, 116], [-32, 115], [-30, 115],
    // Western Australia west coast
    [-28, 114], [-26, 113], [-24, 113], [-22, 114], [-20, 118],
    // Northwest
    [-18, 122], [-16, 124], [-14, 127], [-12, 130],
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
    for (let long = -180; long <= 180; long += 5) {
      line.push([lat, long]);
    }
    lines.push(line);
  }

  // Longitude lines (vertical arcs)
  for (let long = -180; long < 180; long += longStep) {
    const line: Array<[number, number]> = [];
    for (let lat = -80; lat <= 80; lat += 5) {
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
