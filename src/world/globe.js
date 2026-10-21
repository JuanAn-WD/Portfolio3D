import * as THREE from 'three'

/** Mismo radio que el planeta original: 1 unidad de mapa = 1 metro de arco. */
export const GLOBE_RADIUS = 50
/** Por debajo de esta altura (y / radio) empieza el mar y no se puede pisar. */
export const SEA_LIMIT = 0.38
/** Radio del personaje en el planeta. */
export const PLAYER_RADIUS = 0.42
/** Giro del planeta, igual que el treadmill original (radianes por segundo a tope). */
export const SPIN = 0.2
export const CAMERA_HOME = [0, 3.5, 6.5]
export const ZOOM_MIN = 0.58
export const ZOOM_MAX = 2.55
/** Al entrar, la cámara arranca en el tope de alejamiento. */
export const DEFAULT_ZOOM = ZOOM_MAX

const _euler = new THREE.Euler()
const _yawQ = new THREE.Quaternion()
const _up = new THREE.Vector3(0, 1, 0)
const _rel = new THREE.Vector3()
const _flatQ = new THREE.Quaternion()

/**
 * Punto del mapa (x este, z sur, y altura) en el espacio local del planeta.
 * Sale del mismo giro que `writeSurfaceQuat`, así la normal del suelo y la
 * orientación de lo que se coloca encima coinciden en todo el mapa.
 */
export function writeFlatToGlobe(x, z, y, target) {
  writeSurfaceQuat(x, z, 0, _flatQ)
  return target.set(0, GLOBE_RADIUS + y, 0).applyQuaternion(_flatQ)
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

/** Esfera de choque con su centro ya llevado al planeta (`center`), para no recalcularlo en cada consulta. */
export function globeSphere(x, z, radius) {
  return { x, z, radius, center: writeFlatToGlobe(x, z, 0, new THREE.Vector3()) }
}

export function spheresFromColliders(colliders) {
  const list = []
  for (const collider of colliders) {
    const radius = collider.type === 'cyl'
      ? collider.args[1]
      : Math.max(collider.args[0], collider.args[2])
    if (!(radius > 0)) continue
    list.push(globeSphere(collider.position[0], collider.position[2], radius))
  }
  return list
}

/** Añade a la elipse de un edificio su centro en el planeta y el giro inverso, precalculados. */
export function globeHitbox(hit) {
  return {
    ...hit,
    center: writeFlatToGlobe(hit.x, hit.z, 0, new THREE.Vector3()),
    inverse: writeSurfaceQuat(hit.x, hit.z, hit.yaw, new THREE.Quaternion()).invert(),
  }
}

function ellipseHit(point, building, radius) {
  _rel.subVectors(point, building.center).applyQuaternion(building.inverse)
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
    const dx = point.x - sphere.center.x
    const dy = point.y - sphere.center.y
    const dz = point.z - sphere.center.z
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

/**
 * Metros que hay que bajar un objeto rígido para que el borde de su base
 * toque la esfera. `foot` es el radio horizontal de esa base.
 * `bury` esconde el canto unos centímetros dentro del césped.
 */
export function groundSink(foot, bury = 0.02) {
  const r = Math.min(Math.abs(foot) || 0, GLOBE_RADIUS * 0.85)
  const sag = GLOBE_RADIUS - Math.sqrt(GLOBE_RADIUS * GLOBE_RADIUS - r * r)
  return sag + bury
}
