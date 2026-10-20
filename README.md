# Portfolio 3D

Pueblo costero explorable, hecho con **React Three Fiber**, **Three.js** y **Rapier**.

El personaje camina por la isla (WASD en el mundo: W hacia el norte). Hay edificios con fichas de proyecto, un estudio interior y un ciclo día/noche. Un muro invisible en la orilla evita caer al agua.

## Cómo está organizado el mapa

Todo el layout vive en `src/config/map.js`:

| Export | Qué es |
| --- | --- |
| `buildings` | Casas, tiendas, rascacielos y los cuatro edificios con interacción |
| `paths` | Caminos de tierra. Cada punto es `[x, z]` |
| `lamps` | Farolas `[x, z]` |
| `fenceRuns` | Vallas, setos y cuerdas. `gate` abre un hueco |
| `props` | Árboles, sombrillas, cajas y demás, colocados a mano |
| `scatterZones` | Hierba, flores y rocas de relleno (semilla fija) |
| `animals` | Fauna y el radio por el que deambula |
| `PLAYER` / `ISLAND` | Escala, punto de aparición y tamaño de la isla |

`face(dx, dz)` calcula el giro para que la puerta (eje local +Z, con el modelo ya centrado en el suelo) mire hacia ese vector. `keep` es el radio libre de vegetación alrededor de un edificio.

Para encuadrar el mapa sin jugar: `?vista=mapa` (oblicua) o `?vista=cenital`.

## Cómo añadir un proyecto

1. Añade la ficha en `projects` dentro de `src/config/content.js`.
2. En `buildings` (`src/config/map.js`) pon `action: 'openProject'`, `projectId`, `label`, `tooltip` y `marker: true`.
3. Opcional: alarga un camino en `paths` hasta la puerta.

El estudio (`action: 'enterHouse'`) abre el interior, que sigue definido en `interiorFurniture`.

## Controles

- **WASD / flechas:** mover (W hacia el norte, la cámara se queda al sur del personaje)
- **E** o clic en el tooltip: interactuar
- **Esc:** cerrar ficha
- En táctil: stick inferior izquierdo

## Scripts

```bash
npm install
npm run dev
npm run build
```

Para listar (o borrar) modelos GLB que el código no referencia:

```bash
node scripts/find-unused-models.mjs
node scripts/find-unused-models.mjs --delete
```

## Stack

React 19, Three.js, @react-three/fiber, drei, Rapier, Vite. Modelos low-poly de [Kenney](https://kenney.nl) (CC0).

## Estructura

```text
src/
  App.jsx                 # Canvas, HUD, modal, transiciones
  config/content.js       # Bio, proyectos, muebles del estudio
  config/map.js           # Pueblo: edificios, caminos, props, animales
  config/assets.js        # Preload de GLBs usados
  scenes/VillageWorld.jsx # Isla jugable
  scenes/InteriorWorld.jsx
```
