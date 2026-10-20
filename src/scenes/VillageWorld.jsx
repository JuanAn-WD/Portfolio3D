import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { CapsuleCollider, CuboidCollider, CylinderCollider, Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

import { dampAngle } from '../helpers/dampAngle'
import { usePrefersReducedMotion } from '../helpers/usePrefersReducedMotion'
import { useMovement } from '../context/MovementContext'
import { projects } from '../config/content'
import { ISLAND, PLAYER, buildMap, isWinterMonth } from '../config/map'
import { createIslandGeometry, createRibbonGeometry } from '../world/geometries'
import { Juanan } from '../Juanan'
import { DayNightLighting } from '../components/DayNightLighting'
import { FlatInstances } from '../components/FlatInstances'
import { MapBuilding } from '../components/MapBuilding'
import { Critter } from '../components/Critter'
import { StreetLamp } from '../components/StreetLamp'

const VISTAS = {
  mapa: { pos: [14, 32, 30], look: [0, 0.5, -2] },
  cenital: { pos: [0.2, 68, 0.2], look: [0, 0, 0] },
}

const _camGoal = new THREE.Vector3()
const _look = new THREE.Vector3()
const _offset = new THREE.Vector3(0, 5.15, 8.35)

function readVista() {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('vista')
  return VISTAS[value] ? value : null
}

function Water({ reducedMotion, isWinter }) {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(isWinter ? '#7f96a8' : '#127a96') },
    uColorB: { value: new THREE.Color(isWinter ? '#415868' : '#0c3d52') },
  }), [isWinter])

  useFrame((state) => {
    if (!reducedMotion) uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <circleGeometry args={[120, 72]} />
      <shaderMaterial
        transparent
        depthWrite
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 0.18 + uTime * 0.8) * cos(pos.y * 0.16 + uTime * 0.55);
            pos.z += wave * 0.08;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec2 vUv;
          void main() {
            float d = distance(vUv, vec2(0.5));
            vec3 col = mix(uColorA, uColorB, smoothstep(0.05, 0.48, d));
            gl_FragColor = vec4(col, 0.94);
          }
        `}
      />
    </mesh>
  )
}

function SkyClouds({ reducedMotion }) {
  const group = useRef()
  const clouds = useMemo(() => [
    { p: [-22, 15.5, -12], s: 1.15 },
    { p: [6, 17.5, -18], s: 1.45 },
    { p: [24, 14.8, 4], s: 0.95 },
    { p: [-10, 16.2, 16], s: 1.2 },
    { p: [16, 18.2, 20], s: 0.85 },
  ], [])

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return
    group.current.position.x += delta * 0.4
    if (group.current.position.x > 36) group.current.position.x = -36
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

function IslandVisual({ geometry }) {
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
    </mesh>
  )
}

function WallRing() {
  const segments = useMemo(() => {
    const list = []
    const n = 72
    const rx = ISLAND.rx * ISLAND.wall
    const rz = ISLAND.rz * ISLAND.wall
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2
      const a1 = ((i + 1) / n) * Math.PI * 2
      const x0 = Math.cos(a0) * rx
      const z0 = Math.sin(a0) * rz
      const x1 = Math.cos(a1) * rx
      const z1 = Math.sin(a1) * rz
      const dx = x1 - x0
      const dz = z1 - z0
      const len = Math.hypot(dx, dz)
      list.push({
        position: [(x0 + x1) / 2, ISLAND.wallHeight / 2, (z0 + z1) / 2],
        rotation: Math.atan2(-dz, dx),
        args: [len / 2 + 0.15, ISLAND.wallHeight / 2, 0.42],
      })
    }
    return list
  }, [])

  return segments.map((seg, i) => (
    <RigidBody key={i} type="fixed" colliders={false} position={seg.position} rotation={[0, seg.rotation, 0]}>
      <CuboidCollider args={seg.args} />
    </RigidBody>
  ))
}

function Explorer({ frozen, active, playerRef, anchorRef, vista, reducedMotion }) {
  const body = useRef()
  const visual = useRef()
  const facing = useRef(Math.PI)
  const [, getKeys] = useKeyboardControls()
  const { axes } = useMovement()
  const [anim, setAnim] = useState('idle')
  const snapped = useRef(false)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (!active) {
      snapped.current = false
      return
    }

    const pos = body.current?.translation()
    if (pos) {
      if (pos.y < -3 && body.current) {
        body.current.setTranslation({ x: PLAYER.spawn[0], y: PLAYER.spawn[1], z: PLAYER.spawn[2] }, true)
        body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      }
      playerRef.current.set(pos.x, pos.y, pos.z)
      if (!vista) anchorRef.current.set(pos.x, 0, pos.z)
    }

    const view = vista ? VISTAS[vista] : null
    if (view) {
      state.camera.position.set(view.pos[0], view.pos[1], view.pos[2])
      state.camera.lookAt(view.look[0], view.look[1], view.look[2])
    } else if (pos) {
      _camGoal.set(pos.x, pos.y, pos.z).add(_offset)
      _look.set(pos.x, pos.y + 1.05, pos.z)
      if (!snapped.current) {
        state.camera.position.copy(_camGoal)
        snapped.current = true
      } else {
        const k = 1 - Math.exp(-3.4 * dt)
        state.camera.position.lerp(_camGoal, reducedMotion ? 1 : k)
      }
      state.camera.lookAt(_look)
    }

    if (!body.current) return
    if (frozen) {
      const linvel = body.current.linvel()
      body.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true)
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
    const moving = tx !== 0 || tz !== 0
    if (moving) {
      const len = Math.hypot(tx, tz) || 1
      tx = (tx / len) * PLAYER.speed
      tz = (tz / len) * PLAYER.speed
      facing.current = dampAngle(facing.current, Math.atan2(tx, tz), 14, dt)
      if (anim !== 'walk') setAnim('walk')
    } else if (anim !== 'idle') {
      setAnim('idle')
    }

    const linvel = body.current.linvel()
    body.current.setLinvel({
      x: THREE.MathUtils.damp(linvel.x, tx, 14, dt),
      y: linvel.y,
      z: THREE.MathUtils.damp(linvel.z, tz, 14, dt),
    }, true)
    if (visual.current) visual.current.rotation.y = facing.current
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      position={PLAYER.spawn}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      friction={1}
      canSleep={false}
      colliders={false}
    >
      <CapsuleCollider args={[0.32, 0.28]} position={[0, 0.6, 0]} />
      <group ref={visual}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry args={[0.42, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <Juanan animationName={anim} scale={PLAYER.scale} />
      </group>
    </RigidBody>
  )
}

export function VillageWorld({ onEnterHouse, onOpenModal, setTooltip, isFrozen, active = true }) {
  const isWinter = useMemo(() => isWinterMonth(), [])
  const map = useMemo(() => buildMap(isWinter), [isWinter])
  const islandGeo = useMemo(() => createIslandGeometry(ISLAND.rx, ISLAND.rz), [])
  const pathGeo = useMemo(() => createRibbonGeometry(map.paths, 0.05), [map.paths])
  const pathEdgeGeo = useMemo(
    () => createRibbonGeometry(map.paths.map((path) => ({ ...path, width: path.width + 0.45 })), 0.032),
    [map.paths],
  )
  const reducedMotion = usePrefersReducedMotion()
  const vista = useMemo(() => readVista(), [])
  const playerRef = useRef(new THREE.Vector3(...PLAYER.spawn))
  const anchorRef = useRef(new THREE.Vector3())
  const [lifeReady, setLifeReady] = useState(false)
  const fog = useMemo(() => new THREE.Fog(isWinter ? '#b7c3ce' : '#7eb8c9', 32, 84), [isWinter])

  useEffect(() => () => {
    islandGeo.dispose()
    pathGeo.dispose()
    pathEdgeGeo.dispose()
  }, [islandGeo, pathGeo, pathEdgeGeo])

  useEffect(() => {
    if (!active || lifeReady) return undefined
    const id = window.setTimeout(() => setLifeReady(true), reducedMotion ? 0 : 700)
    return () => window.clearTimeout(id)
  }, [active, reducedMotion, lifeReady])

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

  useFrame((state) => {
    if (!active) {
      if (state.scene.fog === fog) state.scene.fog = null
      return
    }
    state.scene.fog = fog
  })

  return (
    <>
      <DayNightLighting
        isWinter={isWinter}
        reducedMotion={reducedMotion || vista === 'cenital'}
        active={active}
        anchorRef={anchorRef}
        shadowSize={42}
      />
      <Water reducedMotion={reducedMotion} isWinter={isWinter} />
      <SkyClouds reducedMotion={reducedMotion} />
      <IslandVisual geometry={islandGeo} />

      <mesh geometry={pathEdgeGeo} receiveShadow>
        <meshStandardMaterial color={isWinter ? '#c5ced6' : '#a67c52'} roughness={1} />
      </mesh>
      <mesh geometry={pathGeo} receiveShadow>
        <meshStandardMaterial color={isWinter ? '#e6edf2' : '#d7b483'} roughness={0.96} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <circleGeometry args={[5.4, 40]} />
        <meshStandardMaterial color={isWinter ? '#d5dee6' : '#e4d2ae'} roughness={0.94} />
      </mesh>

      {map.instances.map((group) => (
        <FlatInstances key={`${group.model}-${group.shadow}`} model={group.model} items={group.items} shadow={group.shadow} />
      ))}

      {map.lamps.map((lamp) => (
        <StreetLamp key={`${lamp[0]}-${lamp[1]}`} position={lamp} />
      ))}

      <Physics gravity={[0, -24, 0]} paused={!active} debug={false}>
        <RigidBody type="fixed" colliders={false} friction={1.4} position={[0, -0.3, 0]}>
          <CuboidCollider args={[ISLAND.rx, 0.3, ISLAND.rz]} />
        </RigidBody>
        <WallRing />
        {map.colliders.map((collider, index) => (
          <RigidBody
            key={`${collider.type}-${index}`}
            type="fixed"
            colliders={false}
            position={collider.position}
            rotation={[0, collider.rotation, 0]}
            friction={0.9}
          >
            {collider.type === 'cyl'
              ? <CylinderCollider args={collider.args} />
              : <CuboidCollider args={collider.args} />}
          </RigidBody>
        ))}

        {map.buildings.map((building) => (
          <MapBuilding
            key={building.id}
            {...building}
            playerRef={playerRef}
            enabled={active && !isFrozen}
            onActivate={handleActivate}
          />
        ))}

        <Explorer
          frozen={isFrozen}
          active={active}
          playerRef={playerRef}
          anchorRef={anchorRef}
          vista={vista}
          reducedMotion={reducedMotion}
        />
      </Physics>

      {lifeReady && (
        <Suspense fallback={null}>
          {map.animals.map((animal) => (
            <Critter
              key={animal.id}
              frozen={isFrozen || !active}
              reducedMotion={reducedMotion}
              {...animal}
            />
          ))}
        </Suspense>
      )}
    </>
  )
}
