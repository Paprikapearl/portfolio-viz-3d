# 3D Visualization Design Principles

Adaptation of the core design principles for 3D financial visualization. Same quality bar, spatial execution.

## Design Direction

**Personality: Sophistication & Trust + Data & Analysis**

This is a financial analytics tool. Users need to trust the data and understand complex hierarchies quickly. The 3D exists to reveal structure, not to impress.

- **Cool foundation**: Dark slate background (#0a0a1a), steel grays for ground plane
- **Accent**: Diverging scale — red (negative returns) through neutral to green (positive)
- **Tone**: Technical precision, not playful

## Core 3D Craft Principles

### The Spatial Grid

All positioning uses a consistent unit system:
- `0.1` - micro spacing (edge gaps)
- `0.3` - element width (bar dimensions)
- `0.5` - standard spacing (between siblings)
- `1.0` - section spacing (between hierarchy levels)
- `2.0` - major separation (exploded view distance)

### Geometry: Bars Only

**One geometry type. Commit to it.**

Cubes/rectangular prisms are the only shape. They:
- Communicate magnitude through height
- Communicate weight through width/depth
- Stack and split predictably
- Feel solid and trustworthy

No rings, spheres, or decorative geometry. The data is the decoration.

### Bar Proportions

```
Width/Depth: Based on portfolio weight (0.2 - 0.6 units)
Height: Based on value magnitude (0.3 - 2.0 units)
```

Negative values: Bar extends downward from the baseline. Same color treatment, inverted direction.

### Color for Meaning Only

**Diverging scale centered at zero:**
- Negative returns: `#ef4444` (red)
- Near-zero: `#fbbf24` (amber)
- Positive returns: `#22c55e` (green)

No decorative color. Gray for structure (ground plane, grid). Color only appears on data geometry.

### Animation Principles

**150-200ms transitions. No exceptions.**

```typescript
const ANIMATION_CONFIG = {
  duration: 180,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // ease-out-quart equivalent
};
```

**Never use:**
- Spring/bouncy physics
- Overshoot
- Elastic easing
- Delays longer than 50ms between elements

**The split animation:**
1. Parent bar fades slightly (opacity 0.3)
2. Children emerge from parent's center position
3. Children translate outward to final positions
4. All children animate simultaneously (no stagger)
5. Total duration: 180ms

### Depth & Elevation in 3D

In actual 3D space, depth is literal. Use it intentionally:

**Vertical = hierarchy level**
- Root (portfolio): y = 0
- Children: y = parent.y + 1.5
- Grandchildren: y = parent.y + 3.0

**Radial = sibling distribution**
- Siblings spread in a circle around parent's x/z position
- Equal angular spacing
- Consistent radius per level

### Lighting Strategy

**Three-light setup for form definition:**
1. Key light (directional): Top-right, 0.8 intensity
2. Fill light (directional): Left, 0.3 intensity
3. Ambient: 0.4 intensity

No dramatic shadows. Shadows exist to ground objects, not for effect.

### Material Properties

**Matte, not glossy:**
```typescript
{
  metalness: 0.1,
  roughness: 0.7,
}
```

**Highlight on interaction:**
- Hover: Subtle emissive glow (0.15 intensity)
- Selected: Stronger emissive (0.25 intensity)
- Use same color as base, not white

### Labels & Typography

Labels in 3D follow 2D principles:
- System font, 500 weight
- Dark background pill (#000 at 75% opacity)
- Only visible on hover or when expanded
- Position above geometry, never inside

**Show labels for:**
- Always: Root node
- On hover: Any node
- When expanded: Direct children only

### Ground Plane

The ground plane provides context without competing:
- Color: #1a1a2e (dark slate)
- Grid: Subtle (#333 lines), 20x20 units
- No reflection, no gradient

### Camera Defaults

```typescript
position: [0, 8, 12]  // Elevated, looking down at ~35°
fov: 50               // Moderate perspective, not dramatic
minDistance: 3
maxDistance: 30
```

Users control the camera. Don't animate it without explicit action.

## Anti-Patterns in 3D

### Never Do This
- Bouncy/spring animations
- Particle effects
- Lens flare or bloom
- Reflective/mirror materials
- Dramatic camera movements
- Multiple geometry types in one visualization
- Color gradients on geometry
- Shadows darker than 30% opacity

### Always Question
- "Does this 3D add understanding, or just complexity?"
- "Would this data be clearer as a 2D chart?"
- "Is the animation serving comprehension or showing off?"
- "Can users still read the values?"

## The Standard

3D visualization earns its complexity by revealing structure that 2D cannot. Every rotation, every animation, every material choice should serve data comprehension.

The goal: A financial analyst looks at this and immediately understands portfolio composition. The 3D is invisible — only the insight remains.
