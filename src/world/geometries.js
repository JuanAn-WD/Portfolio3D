import * as THREE from 'three'
import { GLOBE_RADIUS, writeFlatToGlobe } from './globe'

const grass = new THREE.Color('#3f9a4e')
const grassDark = new THREE.Color('#2d7a3e')
const sand = new THREE.Color('#e7d3a1')
const sandDark = new THREE.Color('#d2b57a')
const cliff = new THREE.Color('#8a6244')
const cliffDark = new THREE.Color('#5c4030')

function hash(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Isla elíptica extruida. La cara superior queda en y = 0; el acantilado baja.
 * `rx` / `rz` son los radios en metros.
 */
export function createIslandGeometry(rx, rz, depth = 1.65) {
  const shape = new THREE.Shape()
  const steps = 80
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const x = Math.cos(a) * rx
    const y = Math.sin(a) * rz
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  const extruded = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  })
  extruded.translate(0, 0, -depth)
  extruded.rotateX(-Math.PI / 2)

  const geo = extruded.index ? extruded.toNonIndexed() : extruded
  if (geo !== extruded) extruded.dispose()
  geo.computeVertexNormals()

  const pos = geo.attributes.position
  const norm = geo.attributes.normal
  const colors = new Float32Array(pos.count * 3)
  const tmp = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const ny = norm.getY(i)
    const ellipse = Math.hypot(x / rx, z / rz)
    const n = hash(x, z)
    const southBeach = z > 14 && ellipse > 0.48 && Math.abs(x) < 24
    const shore = ellipse > 0.8 || southBeach

    if (ny > 0.55 && y > -0.35) {
      if (shore) tmp.copy(sand).lerp(sandDark, n * 0.55)
      else tmp.copy(grass).lerp(grassDark, n * 0.7)
    } else {
      const shade = THREE.MathUtils.clamp((y + depth) / depth, 0, 1)
      tmp.copy(cliffDark).lerp(cliff, shade * 0.85 + n * 0.15)
    }
    colors[i * 3] = tmp.r
    colors[i * 3 + 1] = tmp.g
    colors[i * 3 + 2] = tmp.b
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeBoundingBox()
  return geo
}

/** Cinta de camino sobre el suelo. `points` son pares [x, z]. */
export function createRibbonGeometry(paths, y = 0.04) {
  const positions = []
  const normals = []
  const indices = []

  for (const path of paths) {
    const pts = path.points
    if (!pts || pts.length < 2) continue
    const half = path.width / 2
    const base = positions.length / 3
    const perp = []

    for (let i = 0; i < pts.length; i++) {
      const prev = pts[Math.max(0, i - 1)]
      const next = pts[Math.min(pts.length - 1, i + 1)]
      let dx = next[0] - prev[0]
      let dz = next[1] - prev[1]
      const len = Math.hypot(dx, dz) || 1
      dx /= len
      dz /= len
      perp.push([-dz, dx])
    }

    for (let i = 0; i < pts.length; i++) {
      const [x, z] = pts[i]
      const [px, pz] = perp[i]
      positions.push(x + px * half, y, z + pz * half)
      positions.push(x - px * half, y, z - pz * half)
      normals.push(0, 1, 0, 0, 1, 0)
    }

    for (let i = 0; i < pts.length - 1; i++) {
      const a = base + i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  return geo
}

/** Lleva una malla plana (x, altura, z) a la superficie del planeta. */
export function projectOntoGlobe(geometry) {
  const pos = geometry.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    writeFlatToGlobe(v.x, v.z, v.y, v)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/** Disco del suelo (la plaza) ya proyectado sobre la esfera. */
export function createDiscGeometry(radius, lift = 0.06) {
  const geo = new THREE.CircleGeometry(radius, 48)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, lift)
  return projectOntoGlobe(geo)
}

/** Planeta con hierba arriba y arena hacia el mar. El polo norte es +Y. */
export function createPlanetGeometry(isWinter) {
  const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const grassA = new THREE.Color(isWinter ? '#e6edf2' : '#3f9a4e')
  const grassB = new THREE.Color(isWinter ? '#c5ced6' : '#2d7a3e')
  const sandA = new THREE.Color(isWinter ? '#f4f7fa' : '#e7d3a1')
  const sandB = new THREE.Color(isWinter ? '#d5dee6' : '#d2b57a')
  const tint = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / GLOBE_RADIUS
    const n = hash(pos.getX(i), pos.getZ(i))
    if (y > 0.5) tint.copy(n > 0.5 ? grassA : grassB)
    else if (y > 0.36) tint.copy(sandA).lerp(n > 0.5 ? grassA : grassB, (y - 0.36) / 0.14)
    else tint.copy(n > 0.45 ? sandA : sandB)
    colors[i * 3] = tint.r
    colors[i * 3 + 1] = tint.g
    colors[i * 3 + 2] = tint.b
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geo
}
