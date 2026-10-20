import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { ISLAND } from '../config/map'
import { dampAngle } from '../helpers/dampAngle'

const _next = new THREE.Vector3()

function insideIsland(x, z) {
  const e = Math.hypot(x / ISLAND.rx, z / ISLAND.rz)
  return e < ISLAND.wall - 0.04
}

/** Animal con animación idle/walk. Deambula dentro de `roam` metros de su casa. */
export function Critter({
  model,
  position,
  scale = 0.5,
  roam = 2,
  speed = 0.4,
  fly = 0,
  frozen = false,
  reducedMotion = false,
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
  const target = useRef(home.clone())
  const wait = useRef(1 + Math.random())
  const mode = useRef('idle')

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

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (!root.current) return
    const baseY = fly > 0 ? fly + Math.sin(state.clock.elapsedTime * 3.2 + home.x) * 0.18 : 0

    if (frozen || reducedMotion) {
      play('idle')
      root.current.position.y = baseY
      return
    }

    wait.current -= dt
    if (wait.current <= 0) {
      const angle = Math.random() * Math.PI * 2
      const radius = roam * (0.35 + Math.random() * 0.65)
      _next.set(home.x + Math.cos(angle) * radius, 0, home.z + Math.sin(angle) * radius)
      if (!insideIsland(_next.x, _next.z)) _next.copy(home)
      target.current.copy(_next)
      wait.current = 2.4 + Math.random() * 3.4
    }

    const pos = root.current.position
    const dx = target.current.x - pos.x
    const dz = target.current.z - pos.z
    const dist = Math.hypot(dx, dz)
    if (dist > 0.18) {
      const step = Math.min(dist, speed * dt * (fly > 0 ? 1.6 : 1))
      pos.x += (dx / dist) * step
      pos.z += (dz / dist) * step
      facing.current = dampAngle(facing.current, Math.atan2(dx, dz), 8, dt)
      play('walk')
    } else {
      play('idle')
    }
    pos.y = baseY
    if (heading.current) heading.current.rotation.y = facing.current
  })

  return (
    <group ref={root} position={[home.x, fly, home.z]}>
      <group ref={heading} scale={scale}>
        <primitive object={clone} />
      </group>
    </group>
  )
}
