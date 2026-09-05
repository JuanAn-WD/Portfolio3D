import { useRef, useState, useMemo, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

import { dampAngle } from '../helpers/dampAngle'
import { usePrefersReducedMotion } from '../helpers/usePrefersReducedMotion'
import { useMovement } from '../context/MovementContext'
import { buildings, projects } from '../config/content'
import { FOREST_SEED, generateDecorations, buildDecoGrid, queryDecoGrid } from '../config/forest'
import { Juanan } from '../Juanan'
import { GlobePath } from '../components/GlobePathTile'
import { GlobeBuilding } from '../components/GlobeBuilding'
import { Ocean } from '../components/Ocean'
import { Clouds } from '../components/Clouds'
import { Butterflies } from '../components/Butterflies'
import { Fireflies } from '../components/Fireflies'
import { VillageDetails } from '../components/VillageDetails'
import { DayNightLighting } from '../components/DayNightLighting'
import { ProceduralForest } from '../components/ProceduralForest'
import { Fauna } from '../components/Fauna'

const PLAYER_RADIUS = 0.65
const BUILDING_RADIUS = 3.5

const _input = new THREE.Vector2()
const _axis = new THREE.Vector3()
const _stepQ = new THREE.Quaternion()
const _prevQ = new THREE.Quaternion()
const _camGoal = new THREE.Vector3(0, 3.5, 6.5)
const _hitP = new THREE.Vector3()

export function PlanetWorld({ onEnterHouse, onOpenModal, setTooltip, isFrozen, globeQuatRef, active = true }) {
  const globeRef = useRef()
  const buildingRefs = useRef({})
  const oldBuildingPos = useRef({})
  const _playerGlobe = useRef(new THREE.Vector3())
  const playerVisualRef = useRef()
  const [, getKeys] = useKeyboardControls()
  const { axes } = useMovement()
  const [anim, setAnim] = useState('idle')
  const playerRot = useRef(0)
  const reducedMotion = usePrefersReducedMotion()

  const currentMonth = new Date().getMonth()
  const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1
  const groundColor = isWinter ? '#f1f5f9' : '#4ade80'

  const globeGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(50, 48, 48)
    const posAttribute = geo.attributes.position
    const colors = []
    const grassColor = new THREE.Color(groundColor)
    const sandColor = new THREE.Color(isWinter ? '#cbd5e1' : '#fef08a')
    const tempColor = new THREE.Color()

    for (let i = 0; i < posAttribute.count; i++) {
      const y = posAttribute.getY(i)
      const normalizedY = y / 50
      if (normalizedY < 0.46 && normalizedY > 0.2) {
        const blend = THREE.MathUtils.smoothstep(normalizedY, 0.35, 0.46)
        tempColor.lerpColors(sandColor, grassColor, blend)
      } else if (normalizedY <= 0.2) {
        tempColor.copy(sandColor)
      } else {
        tempColor.copy(grassColor)
      }
      colors.push(tempColor.r, tempColor.g, tempColor.b)
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [groundColor, isWinter])

  const decorations = useMemo(() => generateDecorations(FOREST_SEED), [])
  const decoGrid = useMemo(() => buildDecoGrid(decorations), [decorations])

  useLayoutEffect(() => {
    if (globeRef.current && globeQuatRef?.current) {
      globeRef.current.quaternion.copy(globeQuatRef.current)
    }
  }, [globeQuatRef])

  const handleEnter = (data) => {
    if (data.action === 'enterHouse') {
      setTooltip(null)
      onEnterHouse()
    } else if (data.action === 'openProject' && data.projectId) {
      onOpenModal(projects[data.projectId])
    }
  }

  useFrame((state, delta) => {
    if (globeRef.current && globeQuatRef?.current) {
      globeQuatRef.current.copy(globeRef.current.quaternion)
    }
    const d = Math.min(delta, 0.05)
    if (isFrozen || !active) return

    const keys = getKeys()
    let tx = axes.x
    let tz = axes.z
    if (keys.forward) tz -= 1
    if (keys.backward) tz += 1
    if (keys.left) tx -= 1
    if (keys.right) tx += 1

    if (tx !== 0 || tz !== 0) {
      _input.set(tx, tz).normalize()

      const tryRotate = (ax, az, amount) => {
        if (amount === 0 || !globeRef.current) return

        for (const b of buildings) {
          const ref = buildingRefs.current[b.refKey]
          if (!oldBuildingPos.current[b.refKey]) oldBuildingPos.current[b.refKey] = new THREE.Vector3()
          if (ref) ref.getWorldPosition(oldBuildingPos.current[b.refKey])
        }

        _prevQ.copy(globeRef.current.quaternion)
        _axis.set(ax, 0, az).normalize()
        _stepQ.setFromAxisAngle(_axis, amount * 0.2 * d)
        globeRef.current.quaternion.premultiply(_stepQ)
        globeRef.current.updateMatrixWorld(true)

        const playerLocalPos = _playerGlobe.current
        playerLocalPos.set(0, 0, 0)
        globeRef.current.worldToLocal(playerLocalPos)
        if (playerLocalPos.y / 50 < 0.38) {
          globeRef.current.quaternion.copy(_prevQ)
          globeRef.current.updateMatrixWorld(true)
          return
        }

        let hit = false
        const nearby = queryDecoGrid(decoGrid, playerLocalPos.x, playerLocalPos.z)
        for (const deco of nearby) {
          const dx = playerLocalPos.x - deco.pos.x
          const dy = playerLocalPos.y - deco.pos.y
          const dz = playerLocalPos.z - deco.pos.z
          const r = deco.radius + PLAYER_RADIUS
          if (dx * dx + dy * dy + dz * dz < r * r) {
            hit = true
            break
          }
        }

        if (!hit) {
          for (const b of buildings) {
            const ref = buildingRefs.current[b.refKey]
            const oldPos = oldBuildingPos.current[b.refKey]
            if (!ref || !oldPos) continue
            ref.getWorldPosition(_hitP)
            const newDist = _hitP.length()
            if (newDist < BUILDING_RADIUS && newDist < oldPos.length()) {
              hit = true
              break
            }
          }
        }

        if (hit) {
          globeRef.current.quaternion.copy(_prevQ)
          globeRef.current.updateMatrixWorld(true)
        }
      }

      tryRotate(-Math.sign(_input.y), 0, Math.abs(_input.y))
      tryRotate(0, Math.sign(_input.x), Math.abs(_input.x))

      playerRot.current = dampAngle(playerRot.current, Math.atan2(tx, tz), 14, d)
      if (anim !== 'walk') setAnim('walk')
    } else if (anim !== 'idle') {
      setAnim('idle')
    }

    if (playerVisualRef.current) playerVisualRef.current.rotation.y = playerRot.current
    state.camera.position.lerp(_camGoal, 0.1)
    state.camera.lookAt(0, 0.8, 0)
  })

  return (
    <>
      <DayNightLighting
        cycleDuration={90}
        isWinter={isWinter}
        reducedMotion={reducedMotion}
        active={active}
      />

      <group ref={playerVisualRef} position={[0, 0, 0]}>
        <Juanan animationName={anim} scale={0.8} />
      </group>

      <group ref={globeRef} position={[0, -50, 0]}>
        <mesh receiveShadow geometry={globeGeometry}>
          <meshStandardMaterial vertexColors roughness={0.8} />
        </mesh>

        <Ocean radius={50} isWinter={isWinter} reducedMotion={reducedMotion} />
        <Clouds count={16} isWinter={isWinter} />

        <GlobePath start={[0, 0]} end={[-5, -7]} steps={8} isWinter={isWinter} />
        <GlobePath start={[0, 0]} end={[8, -3]} steps={10} isWinter={isWinter} />
        <GlobePath start={[0, 0]} end={[5, 9]} steps={10} isWinter={isWinter} />

        <ProceduralForest decorations={decorations} isWinter={isWinter} />
        <VillageDetails isWinter={isWinter} />

        {buildings.map((b) => (
          <GlobeBuilding
            key={b.id}
            ref={(el) => { buildingRefs.current[b.refKey] = el }}
            modelPath={b.modelPath}
            position={b.position}
            rotation={b.rotation}
            scale={b.scale}
            popupTitle={b.popupTitle}
            popupHeight={b.popupHeight}
            interactDistance={b.interactDistance}
            chimney={b.chimney}
            interactData={b}
            setTooltip={setTooltip}
            onEnter={handleEnter}
          />
        ))}

        <Fauna frozen={isFrozen} reducedMotion={reducedMotion} />
        <Fireflies count={24} isWinter={isWinter} reducedMotion={reducedMotion} />
        <Butterflies count={10} isWinter={isWinter || reducedMotion} />
      </group>
    </>
  )
}
