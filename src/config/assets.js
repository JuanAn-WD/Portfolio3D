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

/** Critical for first paint: player, buildings, forest / village props. */
export const CORE_MODEL_PATHS = [
  '/models/Player/juanan.glb',
  ...buildings.map((b) => b.modelPath),
  ...buildings.flatMap((b) => (b.chimney ? [b.chimney.path] : [])),
  ...FOREST_MODELS,
]

/** Deferred after core load: fauna + interior (only needed inside the house). */
export const DEFERRED_MODEL_PATHS = [
  ...fauna.map((f) => f.modelPath),
  ...interiorFurniture.map((f) => f.path),
]

export const USED_MODEL_PATHS = [...CORE_MODEL_PATHS, ...DEFERRED_MODEL_PATHS]

function preloadPaths(paths) {
  for (const path of new Set(paths)) {
    useGLTF.preload(path)
  }
}

export function preloadCoreModels() {
  preloadPaths(CORE_MODEL_PATHS)
}

export function preloadDeferredModels() {
  preloadPaths(DEFERRED_MODEL_PATHS)
}

/** @deprecated Prefer preloadCoreModels + preloadDeferredModels */
export function preloadUsedModels() {
  preloadCoreModels()
  preloadDeferredModels()
}
