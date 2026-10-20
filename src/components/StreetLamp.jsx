/** Farola baja: poste, pantalla y una luz cálida que no proyecta sombra. */
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
      <pointLight position={[0, 2.2, 0]} intensity={0.55} color="#fde68a" distance={8} decay={2} />
    </group>
  )
}
