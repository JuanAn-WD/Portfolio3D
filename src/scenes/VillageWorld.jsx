import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

import { dampAngle } from '../helpers/dampAngle'
import { usePrefersReducedMotion } from '../helpers/usePrefersReducedMotion'
import { useMovement } from '../context/MovementContext'
import { projects } from '../config/content'
import { PLAYER, buildMap, isWinterMonth } from '../config/map'
import { createDiscGeometry, createPlanetGeometry, createRibbonGeometry, projectOntoGlobe } from '../world/geometries'
import {
  CAMERA_HOME,
  DEFAULT_ZOOM,
  GLOBE_RADIUS,
  PLAYER_RADIUS,
  SEA_LIMIT,
  SPIN,
  ZOOM_MAX,
  ZOOM_MIN,
  pointBlocked,
  spheresFromColliders,
  writeSurfaceQuat,
} from '../world/globe'
import { Juanan } from '../Juanan'
import { DayNightLighting } from '../components/DayNightLighting'
import { FlatInstances } from '../components/FlatInstances'
import { MapBuilding } from '../components/MapBuilding'
import { Critter } from '../components/Critter'
import { StreetLamp } from '../components/StreetLamp'
import { GlobeFrame } from '../components/GlobeFrame'
import { Ocean } from '../components/Ocean'

const VISTAS = {
  mapa: { pos: [62, -6, 70], look: [0, -36, 0] },
  cenital: { pos: [0.4, 78, 18], look: [0, -28, 0] },
  puerta: { pos: [-0.15, 1.25, 3.35], look: [0.35, 0.62, -0.8] },
}

const _axis = new THREE.Vector3()
const _stepQ = new THREE.Quaternion()
const _prevQ = new THREE.Quaternion()
const _playerLocal = new THREE.Vector3()
const _camGoal = new THREE.Vector3(0, 3.5, 6.5)
const _spawnQ = new THREE.Quaternion()

function readVista() {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('vista')
  return VISTAS[value] ? value : null
}

function readFeet() {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('pies')
  if (!value) return null
  const [x, z] = value.split(',').map(Number)
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null
  return [x, z]
}

function readZoom() {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('zoom')
  if (raw == null || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function PlanetClouds({ reducedMotion }) {
  const group = useRef()
  const clouds = useMemo(() => [
    { p: [-18, 62, -8], s: 1.15 },
    { p: [8, 64, -16], s: 1.4 },
    { p: [22, 60, 6], s: 0.95 },
    { p: [-12, 63, 18], s: 1.15 },
    { p: [14, 66, 22], s: 0.85 },
  ], [])

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return
    group.current.rotation.y += delta * 0.012
  })

  return (
    <group ref={group}>
      {clouds.map((cloud, i) => (
        <group key={i} position={cloud.p} scale={cloud.s}>
          <mesh>
            <sphereGeometry args={[1.25, 8, 6]} />
            <meshStandardMaterial color="#f6fbff" roughness={1} />
          </mesh>
          <mesh position={[1.15, -0.18, 0.15]}>
            <sphereGeometry args={[0.92, 8, 6]} />
            <meshStandardMaterial color="#f6fbff" roughness={1} />
          </mesh>
          <mesh position={[-1.1, -0.12, 0.05]}>
            <sphereGeometry args={[0.78, 8, 6]} />
            <meshStandardMaterial color="#eef4f8" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function VillageWorld({ onEnterHouse, onOpenModal, setTooltip, isFrozen, globeQuatRef, active = true }) {
  const isWinter = useMemo(() => isWinterMonth(), [])
  const map = useMemo(() => buildMap(isWinter), [isWinter])
  const planetGeo = useMemo(() => createPlanetGeometry(isWinter), [isWinter])
  const pathGeo = useMemo(() => projectOntoGlobe(createRibbonGeometry(map.paths, 0.08)), [map.paths])
  const pathEdgeGeo = useMemo(
    () => projectOntoGlobe(createRibbonGeometry(map.paths.map((path) => ({ ...path, width: path.width + 0.45 })), 0.05)),
    [map.paths],
  )
  const plazaGeo = useMemo(() => createDiscGeometry(5.4, 0.07), [])
  const spheres = useMemo(() => {
    const list = spheresFromColliders(map.colliders)
    for (const lamp of map.lamps) list.push({ x: lamp[0], z: lamp[1], radius: 0.22 })
    return list
  }, [map])

  const reducedMotion = usePrefersReducedMotion()
  const vista = useMemo(() => readVista(), [])
  const feet = useMemo(() => readFeet(), [])
  const globeRef = useRef()
  const buildingsRef = useRef([])
  const worldRef = useRef({
    spheres,
    buildings: buildingsRef.current,
    actors: [],
    player: new THREE.Vector3(0, GLOBE_RADIUS, 0),
    playerRadius: PLAYER_RADIUS,
  })
  const [, getKeys] = useKeyboardControls()
  const { axes } = useMovement()
  const [anim, setAnim] = useState('idle')
  const [lifeReady, setLifeReady] = useState(false)
  const playerRot = useRef(Math.PI)
  const playerVisualRef = useRef()
  const initialZoom = useMemo(() => {
    const fromUrl = readZoom()
    return fromUrl == null ? DEFAULT_ZOOM : THREE.MathUtils.clamp(fromUrl, ZOOM_MIN, ZOOM_MAX)
  }, [])
  const zoomRef = useRef(initialZoom)
  const fog = useMemo(() => new THREE.Fog(isWinter ? '#b7c3ce' : '#7eb8c9', 58, 130), [isWinter])

  useEffect(() => () => {
    planetGeo.dispose()
    pathGeo.dispose()
    pathEdgeGeo.dispose()
    plazaGeo.dispose()
  }, [planetGeo, pathGeo, pathEdgeGeo, plazaGeo])

  useEffect(() => {
    if (!active || lifeReady) return undefined
    const id = window.setTimeout(() => setLifeReady(true), reducedMotion ? 0 : 700)
    return () => window.clearTimeout(id)
  }, [active, reducedMotion, lifeReady])

  useLayoutEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const stored = globeQuatRef?.current
    const fresh = !stored || (Math.abs(stored.x) < 1e-6 && Math.abs(stored.y) < 1e-6 && Math.abs(stored.z) < 1e-6 && Math.abs(stored.w) > 0.999)
    if (fresh || feet) {
      const fx = feet ? feet[0] : PLAYER.spawn[0]
      const fz = feet ? feet[1] : PLAYER.spawn[2]
      writeSurfaceQuat(fx, fz, 0, _spawnQ)
      globe.quaternion.copy(_spawnQ).invert()
    } else {
      globe.quaternion.copy(stored)
    }
    globe.updateMatrixWorld(true)
    _playerLocal.set(0, 0, 0)
    globe.worldToLocal(_playerLocal)
    worldRef.current.player.copy(_playerLocal)
  }, [globeQuatRef, feet])

  useEffect(() => {
    if (!active || vista) return undefined
    const closerCode = (code) => code === 'Equal' || code === 'NumpadAdd'
    const fartherCode = (code) => code === 'Minus' || code === 'NumpadSubtract'
    const onWheel = (event) => {
      if (isFrozen || event.ctrlKey) return
      event.preventDefault()
      const next = zoomRef.current * Math.exp(event.deltaY * 0.00115)
      zoomRef.current = THREE.MathUtils.clamp(next, ZOOM_MIN, ZOOM_MAX)
    }
    const onKey = (event) => {
      if (isFrozen || event.metaKey || event.ctrlKey || event.altKey) return
      const closer = closerCode(event.code)
      const farther = fartherCode(event.code)
      if (!closer && !farther) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      event.preventDefault()
      const step = event.repeat ? 0.97 : 0.9
      zoomRef.current = THREE.MathUtils.clamp(
        zoomRef.current * (closer ? step : (1 / step)),
        ZOOM_MIN,
        ZOOM_MAX,
      )
    }
    let pinch = 0
    const pinchDist = (touches) => Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY,
    )
    const onTouchStart = (event) => {
      if (event.touches.length === 2) pinch = pinchDist(event.touches)
    }
    const onTouchMove = (event) => {
      if (isFrozen || event.touches.length !== 2 || pinch <= 0) return
      const dist = pinchDist(event.touches)
      zoomRef.current = THREE.MathUtils.clamp(zoomRef.current * (pinch / dist), ZOOM_MIN, ZOOM_MAX)
      pinch = dist
      event.preventDefault()
    }
    const onTouchEnd = (event) => {
      if (event.touches.length < 2) pinch = 0
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [active, isFrozen, vista])

  const registerHitbox = useCallback((hit) => {
    buildingsRef.current.push(hit)
    return () => {
      buildingsRef.current = buildingsRef.current.filter((item) => item.id !== hit.id)
      worldRef.current.buildings = buildingsRef.current
    }
  }, [])

  const handleActivate = useCallback((event) => {
    if (!event.close) {
      setTooltip((current) => (current?.id === event.id ? null : current))
      return
    }
    const building = map.buildings.find((item) => item.id === event.id)
    if (!building) return
    setTooltip({
      id: building.id,
      text: building.tooltip,
      action: () => {
        if (building.action === 'enterHouse') onEnterHouse()
        else if (building.projectId) onOpenModal(projects[building.projectId])
      },
    })
  }, [map.buildings, onEnterHouse, onOpenModal, setTooltip])

  useFrame((state, delta) => {
    const world = worldRef.current
    world.spheres = spheres
    world.buildings = buildingsRef.current
    const globe = globeRef.current
    if (globe && globeQuatRef?.current) globeQuatRef.current.copy(globe.quaternion)

    if (!active) {
      if (state.scene.fog === fog) state.scene.fog = null
      return
    }
    state.scene.fog = fog

    const view = vista ? VISTAS[vista] : null
    if (view) {
      state.camera.position.set(view.pos[0], view.pos[1], view.pos[2])
      state.camera.lookAt(view.look[0], view.look[1], view.look[2])
      return
    }

    _camGoal.set(CAMERA_HOME[0], CAMERA_HOME[1], CAMERA_HOME[2]).multiplyScalar(zoomRef.current)
    state.camera.position.lerp(_camGoal, 0.12)
    state.camera.lookAt(0, 0.8, 0)

    const d = Math.min(delta, 0.05)
    if (!globe || isFrozen) {
      if (anim !== 'idle') setAnim('idle')
      return
    }

    const keys = getKeys()
    let tx = axes.x
    let tz = axes.z
    if (keys.forward) tz -= 1
    if (keys.backward) tz += 1
    if (keys.left) tx -= 1
    if (keys.right) tx += 1

    const tryRotate = (ax, az, amount) => {
      if (amount === 0) return
      _prevQ.copy(globe.quaternion)
      _axis.set(ax, 0, az).normalize()
      _stepQ.setFromAxisAngle(_axis, amount * SPIN * d)
      globe.quaternion.premultiply(_stepQ)
      globe.updateMatrixWorld(true)
      _playerLocal.set(0, 0, 0)
      globe.worldToLocal(_playerLocal)
      const wet = _playerLocal.y / GLOBE_RADIUS < SEA_LIMIT
      const hit = wet || pointBlocked(_playerLocal, PLAYER_RADIUS, 'player', world)
      if (hit) {
        globe.quaternion.copy(_prevQ)
        globe.updateMatrixWorld(true)
      }
    }

    if (tx !== 0 || tz !== 0) {
      const len = Math.hypot(tx, tz) || 1
      tx /= len
      tz /= len
      tryRotate(-Math.sign(tz), 0, Math.abs(tz))
      tryRotate(0, Math.sign(tx), Math.abs(tx))
      playerRot.current = dampAngle(playerRot.current, Math.atan2(tx, tz), 14, d)
      if (anim !== 'walk') setAnim('walk')
    } else if (anim !== 'idle') {
      setAnim('idle')
    }

    if (globe) {
      _playerLocal.set(0, 0, 0)
      globe.worldToLocal(_playerLocal)
      world.player.copy(_playerLocal)
    }
    if (playerVisualRef.current) playerVisualRef.current.rotation.y = playerRot.current
  })

  return (
    <>
      <DayNightLighting
        isWinter={isWinter}
        reducedMotion={reducedMotion || vista === 'cenital'}
        active={active}
        shadowSize={26}
      />

      <group ref={playerVisualRef} position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[0.34, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <Juanan animationName={anim} scale={PLAYER.scale} />
      </group>

      <group ref={globeRef} position={[0, -GLOBE_RADIUS, 0]}>
        <mesh geometry={planetGeo} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.9} />
        </mesh>
        <Ocean radius={GLOBE_RADIUS} isWinter={isWinter} reducedMotion={reducedMotion} />

        <mesh geometry={pathEdgeGeo} receiveShadow>
          <meshStandardMaterial color={isWinter ? '#c5ced6' : '#a67c52'} roughness={1} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
        <mesh geometry={pathGeo} receiveShadow>
          <meshStandardMaterial color={isWinter ? '#e6edf2' : '#d7b483'} roughness={0.96} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
        <mesh geometry={plazaGeo} receiveShadow>
          <meshStandardMaterial color={isWinter ? '#d5dee6' : '#e4d2ae'} roughness={0.94} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>

        {map.instances.map((group) => (
          <FlatInstances key={`${group.model}-${group.shadow}`} model={group.model} items={group.items} shadow={group.shadow} />
        ))}

        {map.lamps.map((lamp) => (
          <GlobeFrame key={`${lamp[0]}-${lamp[1]}`} x={lamp[0]} y={-0.03} z={lamp[1]}>
            <StreetLamp position={[0, 0]} />
          </GlobeFrame>
        ))}

        {map.buildings.map((building) => (
          <MapBuilding
            key={building.id}
            {...building}
            enabled={active && !isFrozen}
            onActivate={handleActivate}
            onHitbox={registerHitbox}
          />
        ))}

        <PlanetClouds reducedMotion={reducedMotion} />

        {lifeReady && (
          <Suspense fallback={null}>
            {map.animals.map((animal) => (
              <Critter
                key={animal.id}
                frozen={isFrozen || !active}
                reducedMotion={reducedMotion}
                worldRef={worldRef}
                {...animal}
              />
            ))}
          </Suspense>
        )}
      </group>
    </>
  )
}
