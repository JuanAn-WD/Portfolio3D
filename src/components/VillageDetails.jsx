import { Prop } from './Prop'

/**
 * Village details: procedural street lamps, benches, signs, crates,
 * barrels, parasols and natural props filling the central village area.
 * Placed on the globe surface using lat/lon projection.
 * NOTE: poles.glb removed — replaced with inline procedural geometry
 * because in this Kenney pack it renders as brown wooden log clusters.
 */

function GlobeDetail({ modelPath, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const lat = position[2] / 50
  const lon = -position[0] / 50
  return (
    <group rotation={[lat, 0, lon]}>
      <group position={[0, 50 + position[1], 0]}>
        <group rotation={rotation}>
          <Prop path={modelPath} scale={scale} />
        </group>
      </group>
    </group>
  )
}

/** Farola procedural: poste metálico gris + bombilla cálida + pointLight */
function StreetLamp({ position = [0, 0, 0] }) {
  const lat = position[2] / 50
  const lon = -position[0] / 50
  return (
    <group rotation={[lat, 0, lon]}>
      <group position={[0, 50 + position[1], 0]}>
        {/* Poste */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Bombilla */}
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        {/* Luz cálida */}
        <pointLight position={[0, 2.5, 0]} intensity={2.0} color="#fde68a" distance={5} castShadow={false} />
      </group>
    </group>
  )
}

export function VillageDetails({ isWinter }) {
  return (
    <group>
      {/* 🏮 FAROLAS procedurales a lo largo de los caminos con luz cálida */}
      <StreetLamp position={[-2, 0, -3]} />
      <StreetLamp position={[-4, 0, -5.5]} />
      <StreetLamp position={[3, 0, -1]} />
      <StreetLamp position={[6, 0, -2]} />
      <StreetLamp position={[2, 0, 4]} />
      <StreetLamp position={[4, 0, 7]} />

      {/* 🛒 ATREZZO adicional del mercado */}
      <GlobeDetail modelPath="/models/ExtDecoration/crate.glb" position={[6.5, 0, 8]} scale={0.9} />
      <GlobeDetail modelPath="/models/ExtDecoration/barrel.glb" position={[3.8, 0, 9]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/crate-item.glb" position={[6, 0, 9.5]} scale={0.8} />
      <GlobeDetail modelPath="/models/Edifices2/detail-parasol-a.glb" position={[5.5, 0, 10]} scale={1.0} />
      <GlobeDetail modelPath="/models/Edifices2/detail-parasol-b.glb" position={[3.5, 0, 10.5]} scale={0.9} />

      <GlobeDetail modelPath="/models/ExtDecoration/barrel.glb" position={[-5.5, 0, -6]} scale={1.1} />
      <GlobeDetail modelPath="/models/ExtDecoration/pipe.glb" position={[-6.5, 0, -7]} rotation={[0, Math.PI / 2, 0]} scale={0.8} />

      {/* 🌿 HIERBAS y FLORES cerca de los caminos */}
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[1, 0, -2]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[-1, 0, 2]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[4, 0, -3]} scale={0.9} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/grass.glb" : "/models/ExtDecoration/flowers.glb"} position={[0, 0, 1]} scale={1.1} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/grass.glb" : "/models/ExtDecoration/flowers.glb"} position={[-2, 0, -1]} scale={0.9} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/grass.glb" : "/models/ExtDecoration/flowers-tall.glb"} position={[2, 0, -1]} scale={1.0} />

      {/* 🍄 SETAS y PLANTAS */}
      <GlobeDetail modelPath="/models/ExtDecoration/mushrooms.glb" position={[1, 0, 5]} scale={0.8} />
      <GlobeDetail modelPath="/models/ExtDecoration/plant.glb" position={[-4, 0, -3]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/plant.glb" position={[7, 0, 3]} scale={0.9} />

      {/* 🚩 BANDERA decorativa */}
      <GlobeDetail modelPath="/models/ExtDecoration/flag.glb" position={[2.2, 0, 1.6]} scale={1.3} />
    </group>
  )
}
