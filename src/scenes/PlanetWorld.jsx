import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

import { dampAngle } from '../helpers/dampAngle'
import { Juanan } from '../Juanan'
import { Prop } from '../components/Prop'
import { GlobePath } from '../components/GlobePathTile'
import { GlobeBuilding } from '../components/GlobeBuilding'
import { GlobePet } from '../components/GlobePet'
import { Ocean } from '../components/Ocean'
import { Clouds } from '../components/Clouds'
import { Butterflies } from '../components/Butterflies'
import { Fireflies } from '../components/Fireflies'
import { VillageDetails } from '../components/VillageDetails'
import { DayNightLighting } from '../components/DayNightLighting'

// -------------------------------------------------------------
// Radio de colisión (esfera) por tipo de decoración.
// El radio base se multiplica por el scale del objeto en runtime.
// Radio 0 → el elemento no bloquea al jugador.
// -------------------------------------------------------------
const DECO_HITBOX_RADIUS = {
  'tree':         0.85,  // árbol grande
  'pine':         0.70,  // pino mediano cónico
  'pine-small':   0.45,  // pino pequeño
  'rock':         0.60,  // roca
  'hedge':        0.75,  // seto arbusto
  'plant':        0.25,  // planta decorativa
  'stones':       0.30,  // grupo de piedras
  'mushrooms':    0,     // setas — demasiado pequeñas
  'grass':        0,     // hierba — no bloquea
  'flowers':      0,     // flores — no bloquea
  'flowers-tall': 0,     // flores altas — delgadas, no bloquea
  'detail':       0,     // detalles varios — no bloquea
}

// -------------------------------------------------------------
// 💥 COLISIÓN EXACTA DE EDIFICIOS — Raycast sobre geometría real
// -------------------------------------------------------------

// Radio del personaje (unidades de mundo)
const PLAYER_RADIUS = 0.65

// El jugador siempre está en el origen del mundo
const _RAY_ORIGIN = new THREE.Vector3(0, 0, 0)

// 12 direcciones de rayo: anillo horizontal (8) + diagonales arriba (4)
// Cubriendo así toda la geometría del edificio de manera omnidireccional
const COLLISION_RAYS = (() => {
  const dirs = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    dirs.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).normalize())
  }
  dirs.push(new THREE.Vector3(1, 1, 0).normalize())
  dirs.push(new THREE.Vector3(-1, 1, 0).normalize())
  dirs.push(new THREE.Vector3(0, 1, 1).normalize())
  dirs.push(new THREE.Vector3(0, 1, -1).normalize())
  return dirs
})()

// -------------------------------------------------------------
// 🌍 ESCENA 1: EL PLANETA INFINITO (Pueblo Interconectado)
// -------------------------------------------------------------
export function PlanetWorld({ onEnterHouse, onOpenModal, setTooltip, isFrozen }) {
  const globeRef = useRef()
  // Referencias para colisiones
  const houseRef = useRef()
  const labRef = useRef()

  // Pre-allocated vectors reutilizados en cada frame (evita GC pressure)
  const _colP = useRef(new THREE.Vector3())
  const _colOldHP = useRef(new THREE.Vector3())
  const _colOldLP = useRef(new THREE.Vector3())
  const _colPlayerGlobe = useRef(new THREE.Vector3())
  // Raycaster con far=PLAYER_RADIUS — Three.js descarta automáticamente
  // los triángulos más lejanos, haciendo cada test más rápido
  const _raycaster = useRef(
    new THREE.Raycaster(_RAY_ORIGIN.clone(), new THREE.Vector3(), 0, PLAYER_RADIUS)
  )

  const playerVisualRef = useRef()
  const [, getKeys] = useKeyboardControls()
  const [anim, setAnim] = useState('idle')
  const playerRot = useRef(0)

  // ❄️ LÓGICA DE INVIERNO
  const currentMonth = new Date().getMonth()
  const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1
  const groundColor = isWinter ? "#f1f5f9" : "#4ade80"

  // 🌍 GEOMETRÍA DEL GLOBO (Con arena en la costa)
  const globeGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(50, 64, 64)
    const posAttribute = geo.attributes.position
    const colors = []
    const grassColor = new THREE.Color(groundColor)
    const sandColor = new THREE.Color(isWinter ? '#cbd5e1' : '#fef08a') // Hielo sucio/nieve en invierno, arena cálida en verano
    const tempColor = new THREE.Color()

    for (let i = 0; i < posAttribute.count; i++) {
      const y = posAttribute.getY(i)
      const normalizedY = y / 50

      // El agua está en < 0.35, la colisión en 0.38
      // Transición suave de arena a hierba entre 0.36 y 0.46
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

  // 🌲 BOSQUE PROCEDURAL — mezcla ampliada de árboles, rocas, flores, setos y detalles
  const decorations = useMemo(() => {
    const items = []
    for (let i = 0; i < 550; i++) {
      const lat = (Math.random() - 0.5) * Math.PI * 2
      const lon = (Math.random() - 0.5) * Math.PI * 2

      // Filtramos objetos que spawnearían en el agua (por debajo de la costa)
      const localY = Math.cos(lat) * Math.cos(lon)
      if (localY < 0.38) continue

      // ZONA 0: Pueblo y Spawn (localY > 0.92)
      // La altura local del spawn es 1.0. Esto crea un claro circular perfecto 
      // alrededor del pueblo y las casas, independientemente del wrap-around matemático.
      if (localY > 0.90) {
        // En el pueblo mismo, solo algunas briznas de hierba ocasionales
        if (Math.random() > 0.15) continue
        
        const type = Math.random() > 0.5 ? 'grass' : 'flowers'
        const scaleBase = 0.5 + Math.random() * 0.5
        items.push({ id: i, lat, lon, type, scale: scaleBase, rotY: Math.random() * Math.PI * 2 })
        continue
      }

      // ZONA 1: Zona intermedia / Afueras del pueblo (0.75 < localY <= 0.90)
      const isIntermediate = localY > 0.75
      const rand = Math.random()
      let type
      if (isIntermediate) {
        // Transition zone: more grass, flowers, smaller trees, paths etc
        type =
          rand < 0.15 ? 'pine-small' :
            rand < 0.30 ? 'grass' :
              rand < 0.45 ? 'flowers' :
                rand < 0.55 ? 'mushrooms' :
                  rand < 0.65 ? 'rock' :
                    rand < 0.75 ? 'plant' :
                      rand < 0.85 ? 'hedge' : 'stones'
      } else {
        // Outer forest: bigger trees, more variety
        type =
          rand < 0.25 ? 'tree' :
            rand < 0.45 ? 'pine' :
              rand < 0.55 ? 'pine-small' :
                rand < 0.65 ? 'rock' :
                  rand < 0.75 ? 'flowers-tall' :
                    rand < 0.85 ? 'hedge' :
                      rand < 0.92 ? 'mushrooms' : 'detail'
      }

      const scaleBase = isIntermediate ? 0.6 + Math.random() * 0.8 : 1.0 + Math.random() * 1.4
      items.push({ id: i, lat, lon, type, scale: scaleBase, rotY: Math.random() * Math.PI * 2 })
    }
    return items
  }, [])

  /**
   * Hitbox de esfera por elemento de decoración.
   * Cada tipo tiene su propio radio base en DECO_HITBOX_RADIUS;
   * el radio final escala con el tamaño del modelo (deco.scale).
   * Posición pre-calculada en espacio local del globo:
   *   pos = Rz(lon) * Rx(lat) * [0, 50, 0]
   */
  const blockingDecos = useMemo(() => {
    return decorations
      .filter(d => (DECO_HITBOX_RADIUS[d.type] ?? 0) > 0)
      .map(d => {
        const pos = new THREE.Vector3(0, 50, 0)
        pos.applyEuler(new THREE.Euler(d.lat, 0, d.lon, 'XYZ'))
        
        return {
          pos,
          radius: d.scale * DECO_HITBOX_RADIUS[d.type],
        }
      })
  }, [decorations])

  useFrame((state, delta) => {
    if (isFrozen) return

    const { forward, backward, left, right } = getKeys()
    let tx = 0, tz = 0
    if (forward) tz -= 1; if (backward) tz += 1; if (left) tx -= 1; if (right) tx += 1

    if (tx !== 0 || tz !== 0) {
      const input = new THREE.Vector2(tx, tz).normalize()

      const tryRotate = (ax, az, amount) => {
        if (amount === 0) return

        // Guardamos las posiciones previas de los edificios
        if (houseRef.current) houseRef.current.getWorldPosition(_colOldHP.current)
        if (labRef.current) labRef.current.getWorldPosition(_colOldLP.current)

        const prevQ = globeRef.current.quaternion.clone()
        const axis = new THREE.Vector3(ax, 0, az).normalize()
        const q = new THREE.Quaternion().setFromAxisAngle(axis, amount * 0.2 * delta)

        globeRef.current.quaternion.premultiply(q)
        globeRef.current.updateMatrixWorld(true)

        // 🌊 COLISIÓN CON EL BORDE DEL AGUA
        const playerLocalPos = _colPlayerGlobe.current
        playerLocalPos.set(0, 0, 0)
        globeRef.current.worldToLocal(playerLocalPos)
        if (playerLocalPos.y / 50 < 0.38) {
          globeRef.current.quaternion.copy(prevQ)
          globeRef.current.updateMatrixWorld(true)
          return
        }

        let hit = false

        // 🏠 COLISIÓN EXACTA DE EDIFICIOS — Raycast sobre geometría real del GLB
        // Broad phase: si el edificio está a más de 9 unidades, no hacemos nada.
        // Narrow phase: 12 rayos desde el origen del mundo en todas las direcciones;
        //   si alguno impacta geometría del edificio dentro de PLAYER_RADIUS → colisión.
        const checkBuildingRaycast = (ref, oldPos) => {
          if (!ref.current) return false
          // --- Broad phase (barato) ---
          ref.current.getWorldPosition(_colP.current)
          if (_colP.current.length() > 9) return false
          const oldDist = oldPos.length()
          const newDist = _colP.current.length()
          // --- Narrow phase: raycasting exacto sobre los triángulos del modelo ---
          for (const dir of COLLISION_RAYS) {
            _raycaster.current.set(_RAY_ORIGIN, dir)
            const hits = _raycaster.current.intersectObject(ref.current, true)
            if (hits.length > 0) {
              // Solo bloquear si el edificio se está acercando (player se mueve hacia él)
              return newDist < oldDist
            }
          }
          return false
        }

        // Reutilizamos _colPlayerGlobe para la comprobación vs decoraciones
        // (ya tiene la posición actualizada del jugador en espacio del globo)
        for (const deco of blockingDecos) {
          if (!hit && playerLocalPos.distanceTo(deco.pos) < deco.radius) {
            hit = true
          }
        }

        if (!hit && checkBuildingRaycast(houseRef, _colOldHP.current)) hit = true
        if (!hit && checkBuildingRaycast(labRef, _colOldLP.current)) hit = true

        if (hit) {
          globeRef.current.quaternion.copy(prevQ)
          globeRef.current.updateMatrixWorld(true)
        }
      }

      tryRotate(-Math.sign(input.y), 0, Math.abs(input.y))
      tryRotate(0, Math.sign(input.x), Math.abs(input.x))

      playerRot.current = dampAngle(playerRot.current, Math.atan2(tx, tz), 14, delta)
      if (anim !== 'walk') setAnim('walk')
    } else {
      if (anim !== 'idle') setAnim('idle')
    }

    if (playerVisualRef.current) playerVisualRef.current.rotation.y = playerRot.current
    state.camera.position.lerp(new THREE.Vector3(0, 3.5, 6.5), 0.1)
    state.camera.lookAt(0, 0.8, 0)
  })

  return (
    <>
      {/* 🌅 ILUMINACIÓN DINÁMICA DÍA/NOCHE */}
      <DayNightLighting cycleDuration={90} isWinter={isWinter} />

      {/* 👤 PERSONAJE */}
      <group ref={playerVisualRef} position={[0, 0, 0]}>
        <Juanan animationName={anim} scale={0.8} />

      </group>

      <group ref={globeRef} position={[0, -50, 0]}>
        {/* 🌍 GLOBO */}
        <mesh receiveShadow geometry={globeGeometry}>
          <meshStandardMaterial vertexColors roughness={0.8} />
        </mesh>

        {/* 🌊 OCÉANO */}
        <Ocean radius={50} isWinter={isWinter} />

        {/* ☁️ NUBES (dentro del globo para que roten con el planeta) */}
        <Clouds count={25} />



        {/* 🛣️ CAMINOS QUE CONECTAN EL PUEBLO */}
        <GlobePath start={[0, 0]} end={[-5, -7]} steps={8} isWinter={isWinter} />
        <GlobePath start={[0, 0]} end={[8, -3]} steps={10} isWinter={isWinter} />



        {/* 🌲 NATURALEZA PROCEDURAL */}
        {decorations.map((deco) => {
          let path = ''
          if (deco.type === 'tree') path = isWinter ? "/models/ExtDecoration/tree-snow.glb" : "/models/ExtDecoration/tree.glb"
          if (deco.type === 'pine') path = isWinter ? "/models/ExtDecoration/tree-pine-snow.glb" : "/models/ExtDecoration/tree-pine.glb"
          if (deco.type === 'pine-small') path = isWinter ? "/models/ExtDecoration/tree-pine-snow-small.glb" : "/models/ExtDecoration/tree-pine-small.glb"
          if (deco.type === 'rock') path = "/models/ExtDecoration/rocks.glb"
          if (deco.type === 'flowers-tall') path = isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers-tall.glb"
          if (deco.type === 'hedge') path = "/models/ExtDecoration/hedge.glb"
          if (deco.type === 'mushrooms') path = "/models/ExtDecoration/mushrooms.glb"
          if (deco.type === 'detail') path = isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers.glb"
          if (deco.type === 'grass') path = "/models/ExtDecoration/grass.glb"
          if (deco.type === 'flowers') path = isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers.glb"
          if (deco.type === 'plant') path = "/models/ExtDecoration/plant.glb"
          if (deco.type === 'stones') path = "/models/ExtDecoration/stones.glb"

          return (
            <group key={deco.id} rotation={[deco.lat, 0, deco.lon]}>
              <group position={[0, 50, 0]}>
                <group rotation={[0, deco.rotY, 0]}>
                  <Prop path={path} scale={deco.scale} />
                </group>
              </group>
            </group>
          )
        })}

        {/* 🏘️ DETALLES DEL PUEBLO — farolas, vallas, bancos, carteles, etc. */}
        <VillageDetails isWinter={isWinter} />

        {/* 🏠 EDIFICIO 1: Casa / Setup (con chimenea humeante) */}
        <GlobeBuilding
          ref={houseRef}
          modelPath="/models/Edifices/building-h.glb"
          position={[-7, -0.1, -8]}
          rotation={[0, Math.PI / 0.85, 0]}
          scale={3}
          popupTitle="🏠 Setup Personal"
          popupHeight={6.5}
          interactDistance={4.5}
          interactData={{ title: "Entrar a la Casa / Setup" }}
          setTooltip={setTooltip}
          onEnter={onEnterHouse}
        />

        {/* 🧪 EDIFICIO 2: Laboratorio (con chimenea humeante) */}
        <GlobeBuilding
          ref={labRef}
          modelPath="/models/Edifices/building-e.glb"
          position={[8, -0.1, -4]}
          rotation={[0, -Math.PI / 0.75, 0]}
          scale={3}
          popupTitle="🧪 Laboratorio"
          popupHeight={6.5}
          interactDistance={4.5}
          chimney={{ path: "/models/Edifices/chimney-medium.glb", position: [1.0, 1, -0.6], scale: 1.0 }}
          interactData={{ title: "Laboratorio de Proyectos", description: "Aquí experimento con nuevas tecnologías, arquitecturas cloud y frameworks de UI.", tags: ["React", "Three.js"], link: "https://github.com" }}
          setTooltip={setTooltip}
          onEnter={onOpenModal}
        />


        {/* 🐾 FAUNA DEL PUEBLO — set original */}
        <GlobePet modelPath="/models/Animals/animal-cow.glb" position={[-12, 0, -4]} scale={0.4} />
        <GlobePet modelPath="/models/Animals/animal-pig.glb" position={[6, 0, 12]} scale={0.35} />
        <GlobePet modelPath="/models/Animals/animal-bunny.glb" position={[-2, 0, -3]} scale={0.25} speed={0.8} flyHeight={1.5} />
        <GlobePet modelPath="/models/Animals/animal-bee.glb" position={[2, 0, 3]} scale={0.2} speed={0.6} />
        <GlobePet modelPath="/models/Animals/animal-dog.glb" position={[-3, 0, 8]} scale={0.35} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-cat.glb" position={[-8, 0, -4]} scale={0.25} speed={0.4} />

        {/* 🐾 FAUNA AMPLIADA — nuevas especies repartidas por el planeta */}
        <GlobePet modelPath="/models/Animals/animal-koala.glb" position={[-15, 0, -8]} scale={0.3} speed={0.3} />
        <GlobePet modelPath="/models/Animals/animal-panda.glb" position={[16, 0, 8]} scale={0.35} speed={0.35} />
        <GlobePet modelPath="/models/Animals/animal-monkey.glb" position={[-6, 0, -12]} scale={0.3} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-elephant.glb" position={[18, 0, -2]} scale={0.5} speed={0.25} />
        <GlobePet modelPath="/models/Animals/animal-penguin.glb" position={[3, 0, -16]} scale={0.3} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-hog.glb" position={[-14, 0, -14]} scale={0.35} speed={0.4} />
        <GlobePet modelPath="/models/Animals/animal-chick.glb" position={[-5, 0, 5]} scale={0.15} speed={0.9} />

        {/* 🦀 CANGREJOS EN LA PLAYA (Distancia ~56 unidades desde el centro) */}
        <GlobePet modelPath="/models/Animals/animal-deer.glb" position={[56, 0, 0]} scale={0.25} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-deer.glb" position={[-40, 0, 40]} scale={0.25} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-deer.glb" position={[0, 0, -57]} scale={0.25} speed={0.5} />
        <GlobePet modelPath="/models/Animals/animal-deer.glb" position={[40, 0, -40]} scale={0.25} speed={0.5} />

        {/* 🐦 VOLADORES — parrots surcando el cielo del pueblo */}
        <GlobePet modelPath="/models/Animals/animal-parrot.glb" position={[6, 0, -6]} scale={0.3} speed={0.7} flyHeight={2.2} />
        <GlobePet modelPath="/models/Animals/animal-parrot.glb" position={[-9, 0, 9]} scale={0.3} speed={0.65} flyHeight={2.5} />

        {/* ✨ LUCIÉRNAGAS */}
        <Fireflies count={40} isWinter={isWinter} />
      </group>
    </>
  )
}
