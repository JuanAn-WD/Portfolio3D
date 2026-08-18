import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Animated ocean that wraps the globe.
 * Uses a custom shader for wave animation with translucent water effect.
 * Renders only on parts of the sphere that don't have land (below a certain latitude threshold).
 */
export function Ocean({ radius = 50, isWinter = false }) {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(isWinter ? '#94a3b8' : '#0ea5e9') },
    uColor2: { value: new THREE.Color(isWinter ? '#cbd5e1' : '#06b6d4') },
    uGlobeCenter: { value: new THREE.Vector3(0, 0, 0) },
  }), [isWinter])

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime
      // Get the globe's actual world position for correct calculations
      meshRef.current.getWorldPosition(uniforms.uGlobeCenter.value)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius + 0.15, 64, 64]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vLocalPos;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vLocalPos = position; // position in local/object space (centered on globe)
            vec3 pos = position;

            // Wave displacement along the normal
            float wave1 = sin(pos.x * 3.0 + uTime * 0.8) * 0.12;
            float wave2 = sin(pos.z * 2.5 + uTime * 0.6) * 0.08;
            float wave3 = sin((pos.x + pos.z) * 4.0 + uTime * 1.2) * 0.04;
            pos += normal * (wave1 + wave2 + wave3);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vLocalPos;

          void main() {
            // Use LOCAL position normalized to determine which part of the sphere we're on.
            // The "top" of the globe (where the player walks) is the +Y direction in local space.
            float localY = normalize(vLocalPos).y;

            // Only render water below a certain latitude (hide the top land cap)
            // The land area covers roughly the top 40% of the sphere
            if (localY > 0.35) discard;

            // Blend two water colors with animated pattern
            float blend = sin(vLocalPos.x * 5.0 + uTime * 0.3) * 0.5 + 0.5;
            vec3 waterColor = mix(uColor1, uColor2, blend);

            // Fresnel-like edge glow
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
            waterColor += vec3(0.15, 0.25, 0.35) * fresnel;

            // Sparkle highlights
            float sparkle = pow(sin(vLocalPos.x * 20.0 + uTime * 2.0) * sin(vLocalPos.z * 20.0 + uTime * 1.5), 8.0);
            waterColor += vec3(1.0) * sparkle * 0.3;

            // Smooth fade at the water/land transition zone
            float alpha = smoothstep(0.35, 0.15, localY) * 0.65;

            gl_FragColor = vec4(waterColor, alpha);
          }
        `}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
