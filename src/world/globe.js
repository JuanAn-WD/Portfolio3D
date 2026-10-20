import * as THREE from 'three'

/** Mismo radio que el planeta original: 1 unidad de mapa = 1 metro de arco. */
export const GLOBE_RADIUS = 50
/** Por debajo de esta altura (y / radio) empieza el mar y no se puede pisar. */
export const SEA_LIMIT = 0.38
/** Radio del personaje en el planeta. */
export const PLAYER_RADIUS = 0.42
/** Giro del planeta, igual que el treadmill original (radianes por segundo a tope). */
export const SPIN = 0.2

const _euler = new THREE.Euler()
const _yawQ = new THREE.Quaternion()
const _up = new THREE.Vector3(0, 1, 0)
const _rel = new THREE.Vector3()
const _q = new THREE.Quaternion()

/** Punto del mapa (x este, z sur, y altura) en el espacio local del planeta. */
export function writeFlatToGlobe(x, z, y, target) {
  const lat = z / GLOBE_RADIUS
  const lon = -x / GLOBE_RADIUS
  const r = GLOBE_RADIUS + y
  const cx = Math.cos(lat)
  const sx = Math.sin(lat)
  const cz = Math.cos(lon)
  const sz = Math.sin(lon)
  const y1 = r * cx
  target.set(-y1 * sz, y1 * cz, r * sx)
  return target
}

/** Orientación que deja el +Y local pegado a la normal del suelo, más un giro de puerta. */
export function writeSurfaceQuat(x, z, yaw, target) {
  _euler.set(z / GLOBE_RADIUS, 0, -x / GLOBE_RADIUS, 'XYZ')
  target.setFromEuler(_euler)
  if (yaw) {
    _yawQ.setFromAxisAngle(_up, yaw)
    target.multiply(_yawQ)
  }
  return target
}

export function spheresFromColliders(colliders) {
  const list = []
  for (const collider of colliders) {
    const radius = collider.type === 'cyl'
      ? collider.args[1]
      : Math.max(collider.args[0], collider.args[2])
    if (!(radius > 0)) continue
    list.push({ x: collider.position[0], z: collider.position[2], radius })
  }
  return list
}

function ellipseHit(point, building, radius) {
  writeFlatToGlobe(building.x, building.z, 0, _rel)
  const dx = point.x - _rel.x
  const dy = point.y - _rel.y
  const dz = point.z - _rel.z
  writeSurfaceQuat(building.x, building.z, building.yaw, _q)
  _rel.set(dx, dy, dz).applyQuaternion(_q.invert())
  if (_rel.y > building.halfY + 0.4 || _rel.y < -0.6) return false
  const ex = building.halfX + radius
  const ez = building.halfZ + radius
  return (_rel.x * _rel.x) / (ex * ex) + (_rel.z * _rel.z) / (ez * ez) < 1
}

/**
 * `point` está en el espacio local del planeta.
 * `ignoreId` evita chocar consigo mismo (`'player'` o el id del animal).
 */
export function pointBlocked(point, radius, ignoreId, world) {
  for (const sphere of world.spheres) {
    writeFlatToGlobe(sphere.x, sphere.z, 0, _rel)
    const dx = point.x - _rel.x
    const dy = point.y - _rel.y
    const dz = point.z - _rel.z
    const reach = radius + sphere.radius
    if (dx * dx + dy * dy + dz * dz < reach * reach) return true
  }

  for (const building of world.buildings) {
    if (ellipseHit(point, building, radius)) return true
  }

  for (const actor of world.actors) {
    if (actor.id === ignoreId) continue
    const dx = point.x - actor.x
    const dy = point.y - actor.y
    const dz = point.z - actor.z
    const reach = radius + actor.radius
    if (dx * dx + dy * dy + dz * dz < reach * reach) return true
  }

  if (ignoreId !== 'player' && world.player) {
    const player = world.player
    const dx = point.x - player.x
    const dy = point.y - player.y
    const dz = point.z - player.z
    const reach = radius + world.playerRadius
    if (dx * dx + dy * dy + dz * dz < reach * reach) return true
  }

  return false
}

export function belowSea(x, z) {
  writeFlatToGlobe(x, z, 0, _rel)
  return _rel.y / GLOBE_RADIUS < SEA_LIMIT
}
