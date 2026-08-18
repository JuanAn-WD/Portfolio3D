/**
 * Single flat tile of a walking path, projected onto the sphere surface.
 */
function GlobePathTile({ position, rotationY = 0, isWinter }) {
  const lat = position[2] / 50
  const lon = -position[0] / 50
  return (
    <group rotation={[lat, 0, lon]}>
      {/* 50.02 para que esté ligerísimamente por encima del suelo y no parpadee */}
      <group position={[0, 50.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, rotationY]} receiveShadow>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial color={isWinter ? "#e2e8f0" : "#94a3b8"} roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Generates a line of path tiles between two flat-space points,
 * wrapped onto the globe.
 */
export function GlobePath({ start, end, steps = 10, isWinter }) {
  const tiles = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = start[0] + (end[0] - start[0]) * t
    const z = start[1] + (end[1] - start[1]) * t
    const rotY = Math.atan2(start[0] - end[0], start[1] - end[1])
    tiles.push(<GlobePathTile key={i} position={[x, 0, z]} rotationY={rotY} isWinter={isWinter} />)
  }
  return <>{tiles}</>
}
