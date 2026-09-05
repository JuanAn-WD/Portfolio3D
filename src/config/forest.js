import { mulberry32 } from '../helpers/rng'

export const FOREST_SEED = 2
export const FOREST_ATTEMPTS = 380

export const DECO_HITBOX_RADIUS = {
  tree: 0.85,
  pine: 0.70,
  'pine-small': 0.45,
  rock: 0.60,
  hedge: 0,
  plant: 0.25,
  stones: 0.30,
  mushrooms: 0,
  grass: 0,
  flowers: 0,
  'flowers-tall': 0,
  detail: 0,
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

export function buildDecoGrid(decorations, cellSize = 5) {
  const blocking = decorations
    .filter((d) => (DECO_HITBOX_RADIUS[d.type] ?? 0) > 0)
    .map((d) => {
      const pos = { x: 0, y: 50, z: 0 }
      // Rz(lon) * Rx(lat) * (0, 50, 0) — same as THREE.Euler(lat, 0, lon, 'XYZ')
      const cx = Math.cos(d.lat)
      const sx = Math.sin(d.lat)
      const cz = Math.cos(d.lon)
      const sz = Math.sin(d.lon)
      const y1 = 50 * cx
      const z1 = 50 * sx
      pos.x = -y1 * sz
      pos.y = y1 * cz
      pos.z = z1
      return { pos, radius: d.scale * DECO_HITBOX_RADIUS[d.type] }
    })

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
