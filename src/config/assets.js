import { useGLTF } from '@react-three/drei'
import { interiorFurniture } from './content'
import { EXTRA_MODELS, buildMap, isWinterMonth } from './map'

const map = buildMap(isWinterMonth())

/** Critical for first paint: player, buildings, paths props. */
export const CORE_MODEL_PATHS = [
  '/models/Player/juanan.glb',
  ...EXTRA_MODELS,
  ...map.buildings.map((b) => b.model),
  ...map.buildings.flatMap((b) => (b.chimney ? [b.chimney.model] : [])),
  ...map.instances.map((group) => group.model),
]

/** Deferred after core load: animals + interior furniture. */
export const DEFERRED_MODEL_PATHS = [
  ...map.animals.map((animal) => animal.model),
  ...interiorFurniture.map((item) => item.path),
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
