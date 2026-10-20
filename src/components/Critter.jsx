import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { ISLAND } from '../config/map'
import { dampAngle } from '../helpers/dampAngle'
import { belowSea, pointBlocked, writeFlatToGlobe, writeSurfaceQuat } from '../world/globe'

const _next = new THREE.Vector3()
const _globe = new THREE.Vector3()
const _air = new THREE.Vector3()
const _quat = new THREE.Quaternion()

function insideIsland(x, z) {
  const e = Math.hypot(x / ISLAND.rx, z / ISLAND.rz)
  return e < ISLAND.wall - 0.04
}

/**
 * Animal sobre el planeta. Deambula en metros de mapa y no atraviesa
 * edificios, props, al personaje ni a otros animales.
 */
export function Critter({
  id,
  model,
  position,
  scale = 0.5,
  roam = 2,
  speed = 0.4,
  fly = 0,
  frozen = false,
  reducedMotion = false,
  worldRef,
}) {
  const { scene, animations } = useGLTF(model)
  const clone = useMemo(() => {
    const c = cloneSkeleton(scene)
    c.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(c)
    const center = box.getCenter(new THREE.Vector3())
    c.position.set(-center.x, -box.min.y, -center.z)
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return c
  }, [scene])
  const { actions, names } = useAnimations(animations, clone)
  const root = useRef()
  const heading = useRef()
  const facing = useRef(0)
  const home = useMemo(() => new THREE.Vector3(position[0], 0, position[2]), [position])
  const flat = useRef(home.clone())
  const target = useRef(home.clone())
  const wait = useRef(1 + Math.random())
  const mode = useRef('idle')
  const bodyRadius = Math.max(0.16, scale * 0.48)

  const play = (next) => {
    if (mode.current === next || !actions) return
    const pick = names.find((name) => name === next) || names.find((name) => name.startsWith(next))
    if (!pick || !actions[pick]) return
    mode.current = next
    names.forEach((name) => {
      const action = actions[name]
      if (!action) return
      if (name === pick) action.reset().fadeIn(0.2).play()
      else action.fadeOut(0.2)
    })
  }

  const publish = (x, z, lift) => {
    const world = worldRef?.current
    if (!world) return
    writeFlatToGlobe(x, z, lift, _globe)
    let slot = world.actors.find((actor) => actor.id === id)
    if (!slot) {
      slot = { id, x: 0, y: 0, z: 0, radius: bodyRadius }
      world.actors.push(slot)
    }
    slot.x = _globe.x
    slot.y = _globe.y
    slot.z = _globe.z
    slot.radius = bodyRadius
  }

  const hits = (x, z, lift) => {
    const world = worldRef?.current
    if (!world) return false
    if (belowSea(x, z) || !insideIsland(x, z)) return true
    writeFlatToGlobe(x, z, lift, _air)
    return pointBlocked(_air, bodyRadius, id, world)
  }

  useLayoutEffect(() => {
    const world = worldRef?.current
    if (!world) return undefined
    writeFlatToGlobe(home.x, home.z, fly > 0 ? fly : -0.012, _globe)
    world.actors.push({ id, x: _globe.x, y: _globe.y, z: _globe.z, radius: bodyRadius })
    return () => {
      world.actors = world.actors.filter((actor) => actor.id !== id)
    }
  }, [home, fly, id, worldRef, bodyRadius])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (!root.current) return
    const lift = fly > 0 ? fly + Math.sin(state.clock.elapsedTime * 3.2 + home.x) * 0.18 : -0.012
    const pos = flat.current

    if (!(frozen || reducedMotion)) {
      wait.current -= dt
      if (wait.current <= 0) {
        const angle = Math.random() * Math.PI * 2
        const radius = roam * (0.35 + Math.random() * 0.65)
        _next.set(home.x + Math.cos(angle) * radius, 0, home.z + Math.sin(angle) * radius)
        if (hits(_next.x, _next.z, lift)) _next.copy(home)
        target.current.copy(_next)
        wait.current = 2.4 + Math.random() * 3.4
      }

      const dx = target.current.x - pos.x
      const dz = target.current.z - pos.z
      const dist = Math.hypot(dx, dz)
      if (dist > 0.18) {
        const step = Math.min(dist, speed * dt * (fly > 0 ? 1.6 : 1))
        const nx = pos.x + (dx / dist) * step
        const nz = pos.z + (dz / dist) * step
        if (!hits(nx, nz, lift)) {
          pos.x = nx
          pos.z = nz
        } else if (!hits(nx, pos.z, lift)) {
          pos.x = nx
        } else if (!hits(pos.x, nz, lift)) {
          pos.z = nz
        } else {
          wait.current = 0.35
          target.current.copy(pos)
        }
        facing.current = dampAngle(facing.current, Math.atan2(dx, dz), 8, dt)
        play('walk')
      } else {
        play('idle')
      }
    } else {
      play('idle')
    }

    publish(pos.x, pos.z, lift)
    writeFlatToGlobe(pos.x, pos.z, lift, _globe)
    writeSurfaceQuat(pos.x, pos.z, 0, _quat)
    root.current.position.copy(_globe)
    root.current.quaternion.copy(_quat)
    if (heading.current) heading.current.rotation.y = facing.current
  })

  return (
    <group ref={root}>
      <group ref={heading} scale={scale}>
        <primitive object={clone} />
      </group>
    </group>
  )
}
