import { useGLTF } from '@react-three/drei'
import { buildings, fauna, interiorFurniture } from './content'

const FOREST_MODELS = [
  '/models/ExtDecoration/tree.glb',
  '/models/ExtDecoration/tree-snow.glb',
  '/models/ExtDecoration/tree-pine.glb',
  '/models/ExtDecoration/tree-pine-snow.glb',
  '/models/ExtDecoration/tree-pine-small.glb',
  '/models/ExtDecoration/tree-pine-snow-small.glb',
  '/models/ExtDecoration/rocks.glb',
  '/models/ExtDecoration/stones.glb',
  '/models/ExtDecoration/flowers-tall.glb',
  '/models/ExtDecoration/mushrooms.glb',
  '/models/ExtDecoration/flowers.glb',
  '/models/ExtDecoration/grass.glb',
  '/models/ExtDecoration/plant.glb',
  '/models/ExtDecoration/crate.glb',
  '/models/ExtDecoration/barrel.glb',
  '/models/ExtDecoration/crate-item.glb',
  '/models/ExtDecoration/pipe.glb',
  '/models/ExtDecoration/flag.glb',
  '/models/Edifices2/detail-parasol-a.glb',
  '/models/Edifices2/detail-parasol-b.glb',
]

export const USED_MODEL_PATHS = [
  '/models/Player/juanan.glb',
  ...buildings.map((b) => b.modelPath),
  ...buildings.flatMap((b) => (b.chimney ? [b.chimney.path] : [])),
  ...fauna.map((f) => f.modelPath),
  ...interiorFurniture.map((f) => f.path),
  ...FOREST_MODELS,
]

export function preloadUsedModels() {
  for (const path of new Set(USED_MODEL_PATHS)) {
    useGLTF.preload(path)
  }
}
