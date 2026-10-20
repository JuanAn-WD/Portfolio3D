import { mulberry32 } from '../helpers/rng'

export const FOREST_SEED = 2
export const FOREST_ATTEMPTS = 380

/**
 * Horizontal collision radii at scale=1, calibrated from GLB vertex footprints
 * (~0.85–0.95 × halfXZ). Trees use a trunk-biased radius (canopy is wider).
 */
export const DECO_HITBOX_RADIUS = {
  tree: 0.42,
  pine: 0.38,
  'pine-small': 0.26,
  rock: 0.30,
  hedge: 0,
  plant: 0.22,
  // type `stones` renders rocks.glb — same footprint as rock
  stones: 0.30,
  // winter flower→stones.glb replacement
  'stone-scatter': 0.34,
  mushrooms: 0,
  grass: 0,
  flowers: 0,
  'flowers-tall': 0,
  detail: 0,
  crate: 0.24,
  barrel: 0.25,
  lamp: 0.12,
  flag: 0.10,
  parasol: 0.48,
  pipe: 0.18,
}

/** Winter swaps some soft props to stones.glb — collision must follow the visible mesh. */
export function colliderTypeFor(type, isWinter = false) {
  if (isWinter && (type === 'flowers' || type === 'flowers-tall' || type === 'detail')) {
    return 'stone-scatter'
  }
  return type
}

/** Place a point on the globe from flat village coords (same as GlobeBuilding / GlobeDetail). */
export function flatToGlobePos(x, z, y = 0) {
  const lat = z / 50
  const lon = -x / 50
  const r = 50 + y
  const cx = Math.cos(lat)
  const sx = Math.sin(lat)
  const cz = Math.cos(lon)
  const sz = Math.sin(lon)
  const y1 = r * cx
  const z1 = r * sx
  return { x: -y1 * sz, y: y1 * cz, z: z1 }
}

export function decoPath(type, isWinter) {
  if (type === 'tree') return isWinter ? '/models/ExtDecoration/tree-snow.glb' : '/models/ExtDecoration/tree.glb'
  if (type === 'pine') return isWinter ? '/models/ExtDecoration/tree-pine-snow.glb' : '/models/ExtDecoration/tree-pine.glb'
  if (type === 'pine-small') return isWinter ? '/models/ExtDecoration/tree-pine-snow-small.glb' : '/models/ExtDecoration/tree-pine-small.glb'
  if (type === 'rock') return '/models/ExtDecoration/rocks.glb'
  if (type === 'flowers-tall') return isWinter ? '/models/ExtDecoration/stones.glb' : '/models/ExtDecoration/flowers-tall.glb'
  if (type === 'mushrooms') return '/models/ExtDecoration/mushrooms.glb'
  if (type === 'detail') return isWinter ? '/models/ExtDecoration/stones.glb' : '/models/ExtDecoration/flowers.glb'
  if (type === 'grass') return '/models/ExtDecoration/grass.glb'
  if (type === 'flowers') return isWinter ? '/models/ExtDecoration/stones.glb' : '/models/ExtDecoration/flowers.glb'
  if (type === 'plant') return '/models/ExtDecoration/plant.glb'
  if (type === 'stones') return '/models/ExtDecoration/rocks.glb'
  return ''
}

export function generateDecorations(seed = FOREST_SEED) {
  const rand = mulberry32(seed)
  const items = []
  for (let i = 0; i < FOREST_ATTEMPTS; i++) {
    const lat = (rand() - 0.5) * Math.PI * 2
    const lon = (rand() - 0.5) * Math.PI * 2
    const localY = Math.cos(lat) * Math.cos(lon)
    if (localY < 0.38) continue

    if (localY > 0.90) {
      if (rand() > 0.15) continue
      const type = rand() > 0.5 ? 'grass' : 'flowers'
      items.push({ id: i, lat, lon, type, scale: 0.5 + rand() * 0.5, rotY: rand() * Math.PI * 2 })
      continue
    }

    const isIntermediate = localY > 0.75
    const r = rand()
    let type
    if (isIntermediate) {
      type =
        r < 0.15 ? 'pine-small' :
          r < 0.30 ? 'grass' :
            r < 0.45 ? 'flowers' :
              r < 0.55 ? 'mushrooms' :
                r < 0.65 ? 'rock' :
                  r < 0.80 ? 'plant' : 'stones'
    } else {
      type =
        r < 0.25 ? 'tree' :
          r < 0.45 ? 'pine' :
            r < 0.55 ? 'pine-small' :
              r < 0.65 ? 'rock' :
                r < 0.75 ? 'flowers-tall' :
                  r < 0.85 ? 'mushrooms' : 'detail'
    }

    items.push({
      id: i,
      lat,
      lon,
      type,
      scale: isIntermediate ? 0.6 + rand() * 0.8 : 1.0 + rand() * 1.4,
      rotY: rand() * Math.PI * 2,
    })
  }
  return items
}

/**
 * @param {Array} decorations procedural forest items
 * @param {object} [opts]
 * @param {boolean} [opts.isWinter]
 * @param {Array<{position:[number,number,number], radius:number}>} [opts.extra] flat-space blockers (village)
 * @param {number} [opts.cellSize]
 */
export function buildDecoGrid(decorations, opts = {}) {
  const { isWinter = false, extra = [], cellSize = 5 } = typeof opts === 'number'
    ? { cellSize: opts } // back-compat: buildDecoGrid(deco, 5)
    : opts

  const blocking = decorations
    .map((d) => {
      const type = colliderTypeFor(d.type, isWinter)
      const base = DECO_HITBOX_RADIUS[type] ?? 0
      if (base <= 0) return null
      const cx = Math.cos(d.lat)
      const sx = Math.sin(d.lat)
      const cz = Math.cos(d.lon)
      const sz = Math.sin(d.lon)
      const y1 = 50 * cx
      const z1 = 50 * sx
      return {
        pos: { x: -y1 * sz, y: y1 * cz, z: z1 },
        radius: d.scale * base,
      }
    })
    .filter(Boolean)

  for (const item of extra) {
    const [x, y, z] = item.position
    if (!(item.radius > 0)) continue
    blocking.push({ pos: flatToGlobePos(x, z, y || 0), radius: item.radius })
  }

  const grid = new Map()
  for (const deco of blocking) {
    const cx = Math.floor(deco.pos.x / cellSize)
    const cz = Math.floor(deco.pos.z / cellSize)
    const key = `${cx},${cz}`
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key).push(deco)
  }
  return { grid, cellSize }
}

export function queryDecoGrid(gridData, x, z) {
  const { grid, cellSize } = gridData
  const cx = Math.floor(x / cellSize)
  const cz = Math.floor(z / cellSize)
  const out = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const cell = grid.get(`${cx + dx},${cz + dz}`)
      if (cell) out.push(...cell)
    }
  }
  return out
}
