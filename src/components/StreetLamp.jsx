import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { writeFlatToGlobe } from '../world/globe'

/** Farola baja: poste y pantalla emisiva. La luz real la ponen las LampLights cercanas. */
export function StreetLamp({ position = [0, 0, 0] }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.16, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 2.05, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={1.35} toneMapped={false} />
      </mesh>
    </group>
  )
}

const LAMP_INTENSITY = 0.65
const FADE_NEAR = 6
const FADE_FAR = 12

/**
 * Pocas luces puntuales (siempre las mismas, para no recompilar shaders) que se
 * colocan en las farolas más cercanas al jugador y solo se encienden de noche.
 * `lamps` son pares [x, z] del mapa; va dentro del grupo del planeta.
 */
export function LampLights({ lamps, worldRef, nightRef, count = 3 }) {
  const lights = useRef([])
  const spots = useMemo(
    () => lamps.map(([x, z]) => writeFlatToGlobe(x, z, 2.2, new THREE.Vector3())),
    [lamps],
  )
  const pickedRef = useRef([])
  const distRef = useRef([])

  useFrame(() => {
    const player = worldRef?.current?.player
    const night = nightRef?.current ?? 0
    if (!player) return

    const picked = pickedRef.current
    const pickedDist = distRef.current
    picked.length = count
    pickedDist.length = count
    picked.fill(-1)
    pickedDist.fill(Infinity)
    if (night > 0.01) {
      for (let i = 0; i < spots.length; i++) {
        const d = spots[i].distanceTo(player)
        for (let k = 0; k < count; k++) {
          if (d >= pickedDist[k]) continue
          for (let m = count - 1; m > k; m--) {
            pickedDist[m] = pickedDist[m - 1]
            picked[m] = picked[m - 1]
          }
          pickedDist[k] = d
          picked[k] = i
          break
        }
      }
    }

    for (let k = 0; k < count; k++) {
      const light = lights.current[k]
      if (!light) continue
      const index = picked[k]
      if (index < 0) {
        light.intensity = 0
        continue
      }
      light.position.copy(spots[index])
      // Se apaga con la distancia para que no salte al cambiar de farola.
      const fade = 1 - THREE.MathUtils.smoothstep(pickedDist[k], FADE_NEAR, FADE_FAR)
      light.intensity = LAMP_INTENSITY * night * fade
    }
  })

  return (
    <>
      {Array.from({ length: count }, (_, k) => (
        <pointLight
          key={k}
          ref={(el) => { lights.current[k] = el }}
          intensity={0}
          color="#fde68a"
          distance={8}
          decay={2}
        />
      ))}
    </>
  )
}
