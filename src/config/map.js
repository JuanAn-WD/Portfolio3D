import { mulberry32 } from '../helpers/rng'

/**
 * Mapa del pueblo, colocado sobre el planeta (radio 50).
 * Para mover algo, edita las listas de abajo y recarga.
 *
 * Ejes: X hacia el este, Z hacia el sur, Y hacia arriba. El suelo es la esfera:
 * estas coordenadas son metros de arco desde el polo. El personaje se queda
 * arriba y el planeta gira debajo, como antes.
 * `rotation` es un giro en radianes alrededor de Y. `face(dx, dz)` apunta la
 * puerta (eje local +Z del modelo, ya centrado) hacia ese vector.
 *
 * Escala: el personaje mide ~1,1 m con PLAYER.scale. Las casas de Edifices
 * rondan 1–2 unidades en el GLB; un scale 3 las deja en tamaño de pueblo.
 * Los modelos se apoyan en el suelo (el pivote original no siempre está en
 * el centro: se recentran al colocarlos).
 *
 * Vista aérea de depuración (solo con npm run dev): ?vista=mapa (oblicua) o ?vista=cenital.
 */

export const face = (dx, dz) => Math.atan2(dx, dz)

const EAST = face(1, 0)
const WEST = face(-1, 0)
const SOUTH = face(0, 1)
const NORTH = face(0, -1)

export const ISLAND = {
  rx: 38,
  rz: 30,
  /** Muro invisible, fracción del radio. El jugador no puede caer al agua. */
  wall: 0.955,
  wallHeight: 1.7,
}

export const PLAYER = {
  /** En el planeta se ve a la escala del treadmill original. */
  scale: 0.85,
  /** El polo del planeta se gira para que este punto quede bajo los pies. */
  spawn: [0, 0, 7.6],
  speed: 4.5,
}

const M = {
  tree: '/models/ExtDecoration/tree.glb',
  pine: '/models/ExtDecoration/tree-pine.glb',
  pineSmall: '/models/ExtDecoration/tree-pine-small.glb',
  rocks: '/models/ExtDecoration/rocks.glb',
  grass: '/models/ExtDecoration/grass.glb',
  flowers: '/models/ExtDecoration/flowers.glb',
  flowersTall: '/models/ExtDecoration/flowers-tall.glb',
  mushrooms: '/models/ExtDecoration/mushrooms.glb',
  plant: '/models/ExtDecoration/plant.glb',
  hedge: '/models/ExtDecoration/hedge.glb',
  fence: '/models/ExtDecoration/fence-straight.glb',
  rope: '/models/ExtDecoration/fence-rope.glb',
  crate: '/models/ExtDecoration/crate.glb',
  crateItem: '/models/ExtDecoration/crate-item.glb',
  barrel: '/models/ExtDecoration/barrel.glb',
  flag: '/models/ExtDecoration/flag.glb',
  pipe: '/models/ExtDecoration/pipe.glb',
  tank: '/models/Edifices/detail-tank.glb',
  parasolA: '/models/Edifices2/detail-parasol-a.glb',
  parasolB: '/models/Edifices2/detail-parasol-b.glb',
  chimneyS: '/models/Edifices/chimney-small.glb',
}

/** Invierno sustituye estos GLB. Las claves tienen que ser literales para el script de poda. */
const WINTER_SWAP = {
  '/models/ExtDecoration/tree.glb': '/models/ExtDecoration/tree-snow.glb',
  '/models/ExtDecoration/tree-pine.glb': '/models/ExtDecoration/tree-pine-snow.glb',
  '/models/ExtDecoration/tree-pine-small.glb': '/models/ExtDecoration/tree-pine-snow-small.glb',
  '/models/ExtDecoration/flowers.glb': '/models/ExtDecoration/stones.glb',
  '/models/ExtDecoration/flowers-tall.glb': '/models/ExtDecoration/stones.glb',
}

function seasonal(path, isWinter) {
  return isWinter ? (WINTER_SWAP[path] || path) : path
}

/**
 * Edificios. Los que tienen `action` abren una ficha o el estudio.
 * `keep` es el radio (m) que la vegetación procedural respeta.
 * `chimney.offset` es [x, z] en metros, en el espacio local del edificio.
 * `chimney.height` es la altura del GLB de la chimenea (sin escala).
 */
export const buildings = [
  {
    id: 'studio',
    model: '/models/Edifices/building-h.glb',
    position: [0, 0, -14.2],
    rotation: SOUTH,
    // La puerta de building-h está en el eje -Z. Este giro la deja mirando al camino.
    modelYaw: Math.PI,
    scale: 3.4,
    keep: 4.2,
    label: 'Sobre mí',
    tooltip: 'entrar al estudio',
    action: 'enterHouse',
    marker: true,
    // Puerta naranja a la derecha del garaje (tras el giro del modelo).
    doorOffset: [0.9, 0],
  },
  {
    id: 'home-l',
    model: '/models/Edifices/building-l.glb',
    position: [-14, 0, 11],
    rotation: face(14, -11),
    scale: 2.2,
    keep: 3.3,
  },
  {
    id: 'lab',
    model: '/models/Edifices/building-e.glb',
    position: [13.2, 0, -8.2],
    // El camino llega desde el sur; la fachada con puerta mira ahí.
    rotation: SOUTH,
    // Puerta y garaje en -Z del GLB: media vuelta para alinearlas con +Z.
    modelYaw: Math.PI,
    scale: 3.2,
    keep: 4.4,
    label: 'Portfolio 3D',
    tooltip: 'ver el proyecto Portfolio 3D',
    action: 'openProject',
    projectId: 'portfolio3d',
    marker: true,
    // Puerta azul a la derecha del garaje, en el frente ya girado.
    doorOffset: [1.05, 0],
  },
  {
    id: 'shelving',
    model: '/models/Edifices/building-c.glb',
    position: [11, 0, 14.2],
    // El camino llega desde el norte; la fachada con puerta mira ahí.
    rotation: NORTH,
    // Puertas azul y garaje en -Z: media vuelta para alinearlas con +Z.
    modelYaw: Math.PI,
    scale: 2.95,
    keep: 4.6,
    label: 'Shelvingit',
    tooltip: 'ver Shelvingit',
    action: 'openProject',
    projectId: 'shelvingit',
    marker: true,
    doorOffset: [0.95, 0],
  },
  // Streak365 retirado por ahora (proyecto + building). Descomentar junto con content.js → projects.streak365.
  // {
  //   id: 'streak',
  //   model: '/models/Edifices/building-a.glb',
  //   position: [-7.6, 0, 13.35],
  //   rotation: SOUTH,
  //   modelYaw: Math.PI,
  //   scale: 2.75,
  //   keep: 3.5,
  //   label: 'Streak365',
  //   tooltip: 'ver Streak365',
  //   action: 'openProject',
  //   projectId: 'streak365',
  //   marker: true,
  //   doorOffset: [1.25, 0],
  //   signOffset: [-2.85, 0, 4.1],
  // },
  {
    id: 'home-b',
    model: '/models/Edifices/building-b.glb',
    position: [-22.6, 0, -16],
    rotation: EAST,
    scale: 2.95,
    keep: 4.2,
  },
  {
    id: 'home-g',
    model: '/models/Edifices/building-g.glb',
    position: [-22.4, 0, -8],
    rotation: EAST,
    scale: 3.15,
    keep: 3.5,
    chimney: { model: M.chimneyS, offset: [0.15, 0.35], scale: 1.35, height: 0.75 },
  },
  {
    id: 'home-f',
    model: '/models/Edifices/building-f.glb',
    position: [-23, 0, 0.4],
    rotation: EAST,
    scale: 2.8,
    keep: 3.2,
  },
  {
    id: 'barn',
    model: '/models/Edifices/building-q.glb',
    position: [-30.2, 0, -6.4],
    rotation: EAST,
    scale: 3.15,
    keep: 4.4,
  },
  {
    id: 'shop-a',
    model: '/models/Edifices2/building-a.glb',
    position: [21.5, 0, 3],
    rotation: WEST,
    scale: 3.35,
    keep: 3.3,
  },
  {
    id: 'shop-e',
    model: '/models/Edifices2/building-e.glb',
    position: [21.5, 0, 10],
    rotation: WEST,
    scale: 3,
    keep: 3.6,
  },
  {
    id: 'shop-j',
    model: '/models/Edifices2/building-j.glb',
    position: [21.5, 0, -4],
    rotation: WEST,
    scale: 2.65,
    keep: 3.6,
  },
  {
    id: 'tower-a',
    model: '/models/Edifices2/building-skyscraper-a.glb',
    position: [28.5, 0, -11],
    rotation: WEST,
    scale: 1.9,
    keep: 2.8,
  },
  {
    id: 'tower-c',
    model: '/models/Edifices2/building-skyscraper-c.glb',
    position: [28.5, 0, -3],
    rotation: WEST,
    scale: 1.9,
    keep: 2.8,
  },
  {
    id: 'tower-e',
    model: '/models/Edifices2/building-skyscraper-e.glb',
    position: [28.5, 0, 5],
    rotation: WEST,
    scale: 1.8,
    keep: 2.6,
  },
  {
    id: 'block-a',
    model: '/models/Edifices2/low-detail-building-a.glb',
    position: [20, 0, 17],
    rotation: face(-20, -17),
    scale: [2.6, 2.35, 2.2],
    keep: 2.4,
  },
  {
    id: 'block-c',
    model: '/models/Edifices2/low-detail-building-c.glb',
    position: [27, 0, 13.5],
    rotation: WEST,
    scale: [2.5, 2.15, 2.2],
    keep: 2.3,
  },
  {
    id: 'block-h',
    model: '/models/Edifices2/low-detail-building-h.glb',
    position: [-14, 0, 21],
    rotation: face(14, -21),
    scale: [2.7, 2.2, 2.3],
    keep: 2.4,
  },
  {
    id: 'block-wide',
    model: '/models/Edifices2/low-detail-building-wide-a.glb',
    position: [21, 0, -11],
    rotation: WEST,
    scale: [2.4, 2.3, 2.2],
    keep: 2.6,
  },
]

/** Polilíneas [x, z]. El ancho es el total, en metros. */
export const paths = [
  { width: 2.8, points: [[0, 7.2], [0, 0], [0, -11.2]] },
  { width: 2.55, points: [[-15, 0], [0, 0], [12, 0], [17.5, 2]] },
  { width: 2.35, points: [[-1, 1.2], [-8, 6], [-11.6, 9.1]] },
  { width: 2.35, points: [[2, 1.5], [7, 8], [10.2, 10.4]] },
  { width: 2.3, points: [[7, -0.6], [11, -4.5], [13.5, -5.5]] },
  { width: 2.45, points: [[-16, -18], [-16, -8], [-16, 2], [-13, 7]] },
  { width: 2.2, points: [[-14.7, 4.2], [-16.6, 7.4]] },
  // Pasa algo más al sur junto a Shelvingit: los tanques de su lado oeste llegan a z 17,3.
  { width: 2.7, points: [[-12, 16.2], [0, 17.6], [8, 19.7], [13, 19.9]] },
  { width: 2.15, points: [[-7.45, 16.5], [-7.45, 15.2]] },
  { width: 2.3, points: [[0, 5.5], [0, 12], [0, 17.6], [0, 21]] },
  { width: 2.2, points: [[13, 19.9], [18, 17.7]] },
]

/** Farolas procedurales (el GLB poles.glb de este pack son troncos, no farolas). Van al borde del camino, nunca dentro. */
export const lamps = [
  [-3.4, -3.3],
  [3.4, -3.3],
  [-2.2, 4.6],
  [2.2, 4.6],
  [2, -8.2],
  [-9, 2.1],
  [8.5, 2.1],
  [-14.2, -12],
  [-14.2, -3],
  [12.5, 5],
  [1.75, 12.4],
  [7.6, 21.6],
  [14.7, -3.9],
  [1.7, 20.4],
  [15, 16.9],
  [25, -7],
  [25, 1],
  [-11, 18],
]

/**
 * Vallas. El modelo mide 1 m en X; `scale` es el largo de cada tramo.
 * `gate` (metros) abre un hueco en el centro del tramo.
 * `solid: false` cambia la caja de choque por un poste fino (radio `hit`): setos y cuerdas siguen frenando.
 * El corral empieza al sur de la casa `home-f` para no atravesarla.
 */
export const fenceRuns = [
  { from: [-31, 3.8], to: [-17.6, 3.8], scale: 2 },
  { from: [-17.6, 3.8], to: [-17.6, 11], scale: 2, gate: 2.8 },
  { from: [-17.6, 11], to: [-31, 11], scale: 2 },
  { from: [-31, 11], to: [-31, 3.8], scale: 2 },
  { from: [-18.6, 8.2], to: [-18.6, 14.6], scale: 2.15, model: M.hedge, solid: false },
  { from: [-18.6, 14.6], to: [-13.6, 14.6], scale: 2.15, model: M.hedge, solid: false },
  { from: [-8, 24.5], to: [8, 24.5], scale: 2, model: M.rope, solid: false },
]

/** Rectángulos (x, z, w, d) donde no se siembra vegetación. */
export const clearings = [
  { x: -7.2, z: -7.2, w: 14.4, d: 14.4 },
  { x: -31.2, z: 3.6, w: 14.2, d: 7.8 },
  { x: -4, z: 19.5, w: 8, d: 5 },
  { x: -2.2, z: 5.4, w: 4.4, d: 4 },
]

/** Props colocados a mano. `hit` es radio de tronco; `box` es [ancho, alto, fondo] en metros. */
export const props = [
  { model: M.flag, position: [3.05, 0, -4.7], rotation: 0.5, scale: 3.5, hit: 0.2, hitHeight: 2.4, shadow: true },
  // Mirador al final del camino sur.
  { model: M.parasolA, position: [-2.2, 0, 21.6], rotation: 0.3, scale: 4.8, hit: 0.2, hitHeight: 2, shadow: true },
  { model: M.parasolB, position: [2.2, 0, 21.6], rotation: 1.1, scale: 4.5, hit: 0.2, hitHeight: 2, shadow: true },
  { model: M.flag, position: [0, 0, 23.2], rotation: 0, scale: 3.5, hit: 0.15, hitHeight: 2.4, shadow: true },
  { model: M.crate, position: [17.4, 0, 4.6], rotation: 0.4, scale: 1.55, box: [0.78, 0.78, 0.78], shadow: true },
  { model: M.barrel, position: [18.3, 0, 6.1], rotation: 0.2, scale: 1.65, hit: 0.42, hitHeight: 0.9, shadow: true },
  { model: M.crateItem, position: [17.7, 0, 9], rotation: 0.8, scale: 1.45, box: [0.72, 0.72, 0.72], shadow: true },
  { model: M.crate, position: [6.2, 0, 14.6], rotation: 0.6, scale: 1.5, box: [0.75, 0.75, 0.75], shadow: true },
  { model: M.barrel, position: [15.6, 0, 14.6], rotation: 1.2, scale: 1.5, hit: 0.38, hitHeight: 0.85, shadow: true },
  { model: M.tank, position: [-27.4, 0, 6.4], rotation: 0.6, scale: 2.3, box: [1.9, 1, 1.2], shadow: true },
  { model: M.pipe, position: [17.2, 0, -6.2], rotation: Math.PI / 2, scale: 1.35, box: [1.35, 0.7, 1.35], shadow: true },
  { model: M.pineSmall, position: [-5.2, 0, 10.2], rotation: 0.8, scale: 1.85, hit: 0.32, shadow: true },
  { model: M.tree, position: [5.8, 0, 10.6], rotation: 1.4, scale: 2.05, hit: 0.4, shadow: true },
  { model: M.tree, position: [-18.2, 0, 15.2], rotation: 0.4, scale: 2.35, hit: 0.42, shadow: true },
  { model: M.pine, position: [17, 0, 21.5], rotation: 2.1, scale: 2.15, hit: 0.4, shadow: true },
  { model: M.pine, position: [-8.5, 0, -21.5], rotation: 0.2, scale: 2.45, hit: 0.42, shadow: true },
  { model: M.pine, position: [7.5, 0, -21.2], rotation: 1.7, scale: 2.3, hit: 0.4, shadow: true },
  { model: M.tree, position: [-30, 0, -12], rotation: 0.9, scale: 2.2, hit: 0.4, shadow: true },
  { model: M.rocks, position: [-8.5, 0, 22.4], rotation: 0.5, scale: 2.1, hit: 0.55, hitHeight: 0.7, shadow: true },
  { model: M.rocks, position: [9.2, 0, 22.8], rotation: 1.3, scale: 1.8, hit: 0.48, hitHeight: 0.65, shadow: true },
  { model: M.rocks, position: [24, 0, 20], rotation: 0.2, scale: 1.7, hit: 0.45, hitHeight: 0.6, shadow: true },
]

/**
 * Anillo de flores alrededor de la plaza (radio 6,6 m). Sin choque: se pisan.
 * Se salta cualquier hueco que caiga sobre un camino (en invierno pasan a ser piedras que sí frenan).
 * Con 16 huecos quedan 10 flores repartidas entre los caminos.
 */
const RING = 16
for (let i = 0; i < RING; i++) {
  const a = (i / RING) * Math.PI * 2
  const x = Math.cos(a) * 6.6
  const z = Math.sin(a) * 6.6
  const onPath = paths.some((path) => path.points.slice(1).some((b, j) => (
    distToSegment(x, z, path.points[j][0], path.points[j][1], b[0], b[1]) < path.width / 2 + 0.5
  )))
  if (onPath) continue
  props.push({
    model: i % 2 === 0 ? M.flowers : M.flowersTall,
    position: [x, 0, z],
    rotation: a,
    scale: i % 2 === 0 ? 1.55 : 1.35,
    shadow: false,
  })
}

/**
 * Siembra alrededor del pueblo. `band` limita a un anillo del radio de la isla
 * (0 en el centro, 1 en la orilla) para las rocas de costa.
 */
export const scatterZones = [
  { model: M.pine, count: 9, x: -16, z: -28.5, w: 34, d: 8, scale: [1.85, 2.5], hit: 0.4, shadow: true, seed: 4 },
  { model: M.tree, count: 7, x: -12, z: -26.5, w: 26, d: 7, scale: [1.9, 2.45], hit: 0.42, shadow: true, seed: 8 },
  { model: M.pineSmall, count: 7, x: -36, z: -6, w: 10, d: 18, scale: [1.45, 1.95], hit: 0.3, shadow: true, seed: 12 },
  { model: M.tree, count: 4, x: 16, z: 10, w: 14, d: 8, scale: [1.7, 2.15], hit: 0.38, shadow: true, seed: 15 },
  { model: M.rocks, count: 16, x: -37, z: -29, w: 74, d: 58, scale: [1.35, 2.15], hit: 0.42, hitHeight: 0.55, shadow: true, seed: 18, band: [0.78, 0.96] },
  { model: M.grass, count: 28, x: -32, z: -22, w: 62, d: 42, scale: [1.15, 1.75], seed: 21 },
  { model: M.flowers, count: 10, x: -26, z: -14, w: 48, d: 30, scale: [1.25, 1.7], seed: 24 },
  { model: M.mushrooms, count: 6, x: -14, z: -26, w: 26, d: 7, scale: [1.05, 1.45], hit: 0.18, seed: 28 },
  { model: M.plant, count: 7, x: -20, z: 4, w: 12, d: 12, scale: [1.25, 1.7], hit: 0.26, seed: 33 },
  { model: M.pineSmall, count: 6, x: -14, z: 18.5, w: 28, d: 5, scale: [1.45, 1.9], hit: 0.3, shadow: true, seed: 41 },
  { model: M.flowers, count: 8, x: -12, z: 14, w: 24, d: 9, scale: [1.25, 1.7], seed: 44 },
]

export const animals = [
  { id: 'cow', model: '/models/Animals/animal-cow.glb', position: [-25.2, 0, 6.4], scale: 0.78, roam: 3.1, speed: 0.32 },
  { id: 'pig', model: '/models/Animals/animal-pig.glb', position: [-22.2, 0, 7.2], scale: 0.6, roam: 2.4, speed: 0.4 },
  { id: 'chick', model: '/models/Animals/animal-chick.glb', position: [-29, 0, 5.4], scale: 0.3, roam: 1.8, speed: 0.55 },
  { id: 'bunny', model: '/models/Animals/animal-bunny.glb', position: [-22.4, 0, 5.4], scale: 0.34, roam: 2.1, speed: 0.62 },
  { id: 'hog', model: '/models/Animals/animal-hog.glb', position: [-28.2, 0, 8.2], scale: 0.55, roam: 1.7, speed: 0.3 },
  { id: 'dog', model: '/models/Animals/animal-dog.glb', position: [-10.6, 0, 8.2], scale: 0.5, roam: 2, speed: 0.5 },
  { id: 'cat', model: '/models/Animals/animal-cat.glb', position: [-16.8, 0, 13.2], scale: 0.4, roam: 1.4, speed: 0.32 },
  { id: 'deer', model: '/models/Animals/animal-deer.glb', position: [-5, 0, -22.4], scale: 0.62, roam: 3.2, speed: 0.38 },
  { id: 'fox', model: '/models/Animals/animal-fox.glb', position: [8.2, 0, -22.6], scale: 0.42, roam: 2.8, speed: 0.48 },
  { id: 'crab-a', model: '/models/Animals/animal-crab.glb', position: [2, 0, 25.5], scale: 0.28, roam: 2, speed: 0.42 },
  { id: 'crab-b', model: '/models/Animals/animal-crab.glb', position: [-5, 0, 25.3], scale: 0.26, roam: 1.6, speed: 0.38 },
  { id: 'parrot', model: '/models/Animals/animal-parrot.glb', position: [-18.2, 0, 15.2], scale: 0.4, roam: 2.4, speed: 0.55, fly: 2.6 },
  { id: 'bee', model: '/models/Animals/animal-bee.glb', position: [2.8, 0, 4.2], scale: 0.24, roam: 3.2, speed: 0.75, fly: 1.55 },
]

function ellipse(x, z) {
  return Math.hypot(x / ISLAND.rx, z / ISLAND.rz)
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const abx = bx - ax
  const abz = bz - az
  const denom = abx * abx + abz * abz || 1
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / denom))
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t))
}

function insideKeep(x, z, keeps) {
  for (const keep of keeps) {
    const dx = x - keep.x
    const dz = z - keep.z
    if (dx * dx + dz * dz < keep.r * keep.r) return true
  }
  return false
}

function blocked(x, z, clearance, keeps) {
  if (ellipse(x, z) > 0.9) return true
  for (const rect of clearings) {
    if (x >= rect.x && x <= rect.x + rect.w && z >= rect.z && z <= rect.z + rect.d) return true
  }
  if (insideKeep(x, z, keeps)) return true
  for (const path of paths) {
    for (let i = 0; i < path.points.length - 1; i++) {
      const a = path.points[i]
      const b = path.points[i + 1]
      if (distToSegment(x, z, a[0], a[1], b[0], b[1]) < path.width / 2 + clearance) return true
    }
  }
  return false
}

function expandFenceRun(run) {
  const model = run.model || M.fence
  const scale = run.scale || 2
  const [x0, z0] = run.from
  const [x1, z1] = run.to
  const dx = x1 - x0
  const dz = z1 - z0
  const length = Math.hypot(dx, dz)
  if (length < 0.2) return []
  const yaw = Math.atan2(-dz, dx)
  const n = Math.max(1, Math.round(length / scale))
  const items = []
  const solid = run.solid !== false
  const hedge = model === M.hedge
  const rope = model === M.rope
  const height = (hedge ? 0.4 : rope ? 0.3 : 0.4) * scale
  const spacing = length / n

  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n
    if (run.gate && Math.abs(t - 0.5) * length < run.gate / 2) continue
    const x = x0 + dx * t
    const z = z0 + dz * t
    items.push({
      model,
      position: [x, 0, z],
      rotation: yaw,
      scale,
      shadow: solid || hedge,
      box: solid ? [spacing * 1.05, height, 0.42] : null,
      hit: hedge ? 0.34 * scale : rope ? 0.16 * scale : 0,
    })
  }
  return items
}

/** Las flores se atraviesan. En invierno pasan a ser piedras y sí frenan. */
function dressGroundCover(modelPath, isWinter, hit, hitHeight) {
  const model = seasonal(modelPath, isWinter)
  const flower = modelPath === M.flowers || modelPath === M.flowersTall
  if (!flower) return { model, hit: hit || 0, hitHeight }
  if (model === modelPath) return { model, hit: 0, hitHeight: 0 }
  return { model, hit: hit || 0.34, hitHeight: hitHeight || 0.4 }
}

function expandScatter(isWinter, keeps) {
  const items = []
  for (const zone of scatterZones) {
    const rand = mulberry32(zone.seed)
    let placed = 0
    let guard = 0
    while (placed < zone.count && guard < zone.count * 40) {
      guard++
      const x = zone.x + rand() * zone.w
      const z = zone.z + rand() * zone.d
      const e = ellipse(x, z)
      if (zone.band) {
        // La costa no mira caminos ni claros, pero tampoco puede caer dentro de una casa.
        if (e < zone.band[0] || e > zone.band[1] || insideKeep(x, z, keeps)) continue
      } else if (blocked(x, z, zone.hit ? 1.15 : 0.7, keeps)) {
        continue
      }
      const span = zone.scale[1] - zone.scale[0]
      const dressed = dressGroundCover(zone.model, isWinter, zone.hit, zone.hitHeight)
      items.push({
        model: dressed.model,
        position: [x, 0, z],
        rotation: rand() * Math.PI * 2,
        scale: zone.scale[0] + rand() * span,
        shadow: !!zone.shadow,
        hit: dressed.hit,
        hitHeight: dressed.hitHeight || (dressed.hit ? 1.5 : 0),
      })
      placed++
    }
  }
  return items
}

function groupInstances(list) {
  const map = new Map()
  for (const item of list) {
    const key = `${item.model}|${item.shadow ? 1 : 0}`
    if (!map.has(key)) map.set(key, { model: item.model, shadow: !!item.shadow, items: [] })
    map.get(key).items.push(item)
  }
  return [...map.values()]
}

function toCollider(item) {
  if (item.box) {
    const [w, h, d] = item.box
    return {
      type: 'box',
      position: [item.position[0], h / 2, item.position[2]],
      rotation: item.rotation || 0,
      args: [w / 2, h / 2, d / 2],
    }
  }
  if (item.hit) {
    const h = item.hitHeight || 1.5
    return {
      type: 'cyl',
      position: [item.position[0], h / 2, item.position[2]],
      rotation: 0,
      args: [h / 2, item.hit],
    }
  }
  return null
}

const builtMaps = new Map()

/** Datos listos para render. `isWinter` cambia árboles y flores. Se calcula una vez por estación. */
export function buildMap(isWinter = false) {
  const cached = builtMaps.get(isWinter)
  if (cached) return cached

  const keeps = buildings.map((b) => ({
    x: b.position[0],
    z: b.position[2],
    r: b.keep ?? 3.5,
  }))

  const hand = props.map((item) => {
    const dressed = dressGroundCover(item.model, isWinter, item.hit, item.hitHeight)
    return { ...item, model: dressed.model, hit: dressed.hit, hitHeight: dressed.hitHeight }
  })
  const fences = fenceRuns.flatMap(expandFenceRun)
  const scattered = expandScatter(isWinter, keeps)
  const all = [...hand, ...fences, ...scattered]
  const colliders = all.map(toCollider).filter(Boolean)

  const map = {
    buildings,
    paths,
    lamps,
    animals,
    instances: groupInstances(all),
    colliders,
  }
  builtMaps.set(isWinter, map)
  return map
}

export function isWinterMonth(date = new Date()) {
  const month = date.getMonth()
  return month === 11 || month === 0 || month === 1
}

/** GLB que el mapa usa y no salen en las listas de props (el cartel de las puertas). */
export const EXTRA_MODELS = ['/models/ExtDecoration/sign.glb']
