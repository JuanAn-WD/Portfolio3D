# Portfolio 3D

Experiencia de portfolio explorables en un mini-planeta, hecha con **React Three Fiber**, **Three.js** y **Rapier**.

El personaje se queda en la cima del mundo; el globo rota debajo (estilo treadmill). Hay edificios con fichas de proyecto, un interior con físicas y un ciclo día/noche.

## Cómo añadir un proyecto

Edita `src/config/content.js`:

1. Añade una entrada en `projects` (título, descripción, tags, `links`).
2. Añade un edificio en `buildings` con `action: 'openProject'` y `projectId`.
3. Opcional: coloca un `GlobePath` en `PlanetWorld.jsx` hasta el nuevo edificio.

## Controles

- **WASD / flechas:** mover
- **E** o clic en el tooltip: interactuar
- **Esc:** cerrar ficha
- En táctil: stick inferior izquierdo

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Stack

React 19, Three.js, @react-three/fiber, drei, Rapier, Vite. Modelos low-poly de [Kenney](https://kenney.nl) (CC0).

## Estructura

```text
src/
  App.jsx                 # Canvas, HUD, modal, transiciones
  config/content.js       # Bio, proyectos, edificios, fauna
  config/forest.js        # Bosque con semilla
  config/assets.js        # Preload de GLBs usados
  scenes/PlanetWorld.jsx
  scenes/InteriorWorld.jsx
  components/
```
