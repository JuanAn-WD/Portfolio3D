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
  GLOBE_RADIUS,
  PLAYER_RADIUS,
  SEA_LIMIT,
  SPIN,
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
    if (fresh) {
      writeSurfaceQuat(PLAYER.spawn[0], PLAYER.spawn[2], 0, _spawnQ)
      globe.quaternion.copy(_spawnQ).invert()
    } else {
      globe.quaternion.copy(stored)
    }
    globe.updateMatrixWorld(true)
    _playerLocal.set(0, 0, 0)
    globe.worldToLocal(_playerLocal)
    worldRef.current.player.copy(_playerLocal)
  }, [globeQuatRef])

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

    state.camera.position.lerp(_camGoal, 0.1)
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
          <GlobeFrame key={`${lamp[0]}-${lamp[1]}`} x={lamp[0]} z={lamp[1]}>
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
