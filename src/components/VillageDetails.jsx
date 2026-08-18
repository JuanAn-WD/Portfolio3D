import { Prop } from './Prop'

/**
 * Village details: street lamps with warm light, fences, benches,
 * signs, and various props that fill the central village area.
 * Placed on the globe surface using lat/lon projection.
 */

function GlobeDetail({ modelPath, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, light = null }) {
  const lat = position[2] / 50
  const lon = -position[0] / 50
  return (
    <group rotation={[lat, 0, lon]}>
      <group position={[0, 50 + position[1], 0]}>
        <group rotation={rotation}>
          <Prop path={modelPath} scale={scale} />
          {light && (
            <pointLight
              position={light.position || [0, 2, 0]}
              intensity={light.intensity || 1.5}
              color={light.color || '#fde68a'}
              distance={light.distance || 6}
              castShadow={false}
            />
          )}
        </group>
      </group>
    </group>
  )
}

export function VillageDetails({ isWinter }) {
  return (
    <group>
      {/* 🏮 FAROLAS a lo largo de los caminos con luz cálida */}
      {/* Camino centro → casa */}
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[-2, 0, -3]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[-4, 0, -5.5]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />

      {/* Camino centro → laboratorio */}
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[3, 0, -1]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[6, 0, -2]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />

      {/* Camino centro → tienda */}
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[2, 0, 3]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[4, 0, 6]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />

      {/* Camino centro → fábrica */}
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[-3, 0, 0.5]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />
      <GlobeDetail modelPath="/models/ExtDecoration/poles.glb" position={[-6, 0, 1.5]} scale={1.0}
        light={{ position: [0, 2.5, 0], intensity: 2.0, color: '#fde68a', distance: 5 }} />

      {/* 🪵 VALLAS delimitando zonas */}
      <GlobeDetail modelPath="/models/ExtDecoration/fence-straight.glb" position={[-3, 0, -9]} rotation={[0, Math.PI / 4, 0]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/fence-straight.glb" position={[-6, 0, -7]} rotation={[0, Math.PI / 4, 0]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/fence-corner.glb" position={[-7, 0, -8]} rotation={[0, Math.PI / 4, 0]} scale={1.2} />

      <GlobeDetail modelPath="/models/ExtDecoration/fence-straight.glb" position={[10, 0, -5]} rotation={[0, -Math.PI / 3, 0]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/fence-straight.glb" position={[9, 0, -6]} rotation={[0, -Math.PI / 3, 0]} scale={1.2} />

      {/* 🪑 BANCOS junto a caminos */}
      <GlobeDetail modelPath="/models/InteriorHouse/bench.glb" position={[-1, 0, -4]} rotation={[0, Math.PI / 2, 0]} scale={1.0} />
      <GlobeDetail modelPath="/models/InteriorHouse/bench.glb" position={[5, 0, 1]} rotation={[0, -Math.PI / 4, 0]} scale={1.0} />
      <GlobeDetail modelPath="/models/InteriorHouse/bench.glb" position={[-5, 0, 2]} rotation={[0, Math.PI, 0]} scale={1.0} />

      {/* 🪧 CARTELES decorativos */}
      <GlobeDetail modelPath="/models/ExtDecoration/sign.glb" position={[0, 0, -1]} rotation={[0, 0, 0]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/sign.glb" position={[3, 0, 10]} rotation={[0, Math.PI, 0]} scale={1.0} />

      {/* 🛒 ATREZZO adicional del mercado */}
      <GlobeDetail modelPath="/models/ExtDecoration/crate.glb" position={[6.5, 0, 8]} scale={0.9} />
      <GlobeDetail modelPath="/models/ExtDecoration/barrel.glb" position={[3.8, 0, 9]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/crate-item.glb" position={[6, 0, 9.5]} scale={0.8} />
      <GlobeDetail modelPath="/models/Edifices2/detail-parasol-a.glb" position={[5.5, 0, 10]} scale={1.0} />
      <GlobeDetail modelPath="/models/Edifices2/detail-parasol-b.glb" position={[3.5, 0, 10.5]} scale={0.9} />

      {/* 🏗️ Detalles junto a la fábrica */}
      <GlobeDetail modelPath="/models/ExtDecoration/barrel.glb" position={[-10, 0, 4.5]} scale={1.1} />
      <GlobeDetail modelPath="/models/ExtDecoration/crate-strong.glb" position={[-10.5, 0, 2]} scale={0.9} />
      <GlobeDetail modelPath="/models/ExtDecoration/pipe.glb" position={[-11, 0, 3]} rotation={[0, Math.PI / 2, 0]} scale={0.8} />

      {/* 🌿 HIERBAS y FLORES cerca de los caminos */}
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[1, 0, -2]} scale={1.2} />
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[-1, 0, 2]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/grass.glb" position={[4, 0, -3]} scale={0.9} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers.glb"} position={[0, 0, 1]} scale={1.1} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers.glb"} position={[-2, 0, -1]} scale={0.9} />
      <GlobeDetail modelPath={isWinter ? "/models/ExtDecoration/stones.glb" : "/models/ExtDecoration/flowers-tall.glb"} position={[2, 0, -1]} scale={1.0} />

      {/* 🍄 SETAS y PLANTAS */}
      <GlobeDetail modelPath="/models/ExtDecoration/mushrooms.glb" position={[1, 0, 5]} scale={0.8} />
      <GlobeDetail modelPath="/models/ExtDecoration/plant.glb" position={[-4, 0, -3]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/plant.glb" position={[7, 0, 3]} scale={0.9} />

      {/* 🪨 ROCAS y PIEDRAS decorativas */}
      <GlobeDetail modelPath="/models/ExtDecoration/rocks.glb" position={[0, 0, 4]} scale={0.8} />
      <GlobeDetail modelPath="/models/ExtDecoration/stones.glb" position={[-7, 0, -2]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/rocks.glb" position={[9, 0, 6]} scale={0.7} />

      {/* 🏘️ EDIFICIOS LOW-DETAIL de fondo (relleno de pueblo) */}
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-a.glb" position={[-12, 0, -10]} rotation={[0, 0.5, 0]} scale={1.4} />
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-c.glb" position={[14, 0, -8]} rotation={[0, -0.8, 0]} scale={1.3} />
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-e.glb" position={[-14, 0, 8]} rotation={[0, 1.2, 0]} scale={1.5} />
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-g.glb" position={[10, 0, 14]} rotation={[0, 2.0, 0]} scale={1.2} />
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-d.glb" position={[-6, 0, 14]} rotation={[0, 0.8, 0]} scale={1.3} />
      <GlobeDetail modelPath="/models/Edifices2/low-detail-building-b.glb" position={[16, 0, 2]} rotation={[0, -1.5, 0]} scale={1.1} />

      {/* 🌳 SETOS extra junto a edificios */}
      <GlobeDetail modelPath="/models/ExtDecoration/hedge.glb" position={[-6, 0, -6.5]} rotation={[0, Math.PI / 4, 0]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/hedge-corner.glb" position={[7, 0, -4.5]} rotation={[0, -Math.PI / 3, 0]} scale={1.0} />
      <GlobeDetail modelPath="/models/ExtDecoration/hedge.glb" position={[6, 0, 7]} rotation={[0, Math.PI, 0]} scale={1.1} />

      {/* 🚩 BANDERAS decorativas */}
      <GlobeDetail modelPath="/models/ExtDecoration/flag.glb" position={[0, 0, 0]} scale={1.3} />
    </group>
  )
}
