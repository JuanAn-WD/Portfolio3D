# Portfolio 3D

Mi portfolio es un planeta pequeño que puedes recorrer. Está hecho con React Three Fiber y Three.js, y el interior del estudio usa Rapier para la física.

La idea viene del típico efecto "cinta de correr": el personaje no se mueve, lo que gira es el planeta. Arriba del todo está el pueblo, donde cada edificio tiene su ficha. También hay un estudio en el que puedes entrar, y un ciclo de día y noche.

Casi todo tiene colisión: edificios, árboles, vallas, farolas y animales. La hierba y las flores se pueden pisar, salvo en invierno, que las flores se convierten en piedras y frenan. Al mar tampoco se puede entrar.

## El mapa

Todo el pueblo está en `src/config/map.js`:

| Export | Qué hay |
| --- | --- |
| `buildings` | Casas, tiendas, rascacielos y los edificios de mis proyectos (estudio, Portfolio 3D, Shelvingit y Streak365) |
| `paths` | Caminos de tierra, cada punto es `[x, z]` |
| `lamps` | Farolas `[x, z]` |
| `fenceRuns` | Vallas, setos y cuerdas. `gate` deja un hueco y con `solid: false` solo choca un poste fino (`hit`) |
| `props` | Árboles, sombrillas, cajas... puestos a mano |
| `scatterZones` | Hierba, flores y rocas de relleno (con semilla fija, así salen siempre igual) |
| `animals` | Los animales y la zona por la que se mueven |
| `PLAYER` / `ISLAND` | Escala, punto de inicio y tamaño de la isla |

Un par de detalles: `face(dx, dz)` gira el edificio para que la puerta mire en esa dirección, y `keep` es el radio que se deja sin vegetación alrededor.

### Atajos para desarrollo

Con `npm run dev` puedes usar estos parámetros en la URL para colocar la cámara sin tener que jugar:

- `?vista=mapa`, `?vista=cenital` o `?vista=puerta`
- `?pies=x,z` para aparecer en un punto concreto
- `?zoom=` entre 0.58 (cerca) y 2.55 (lejos)

En producción se ignoran.

## Añadir un proyecto nuevo

1. Añade la ficha en `projects`, dentro de `src/config/content.js`.
2. En `buildings` (`src/config/map.js`), ponle `action: 'openProject'`, `projectId`, `label`, `tooltip` y `marker: true`.
3. Si quieres, alarga algún camino de `paths` hasta la puerta.

El estudio funciona distinto (`action: 'enterHouse'`) y su interior se define en `interiorFurniture`.

## Controles

- WASD o flechas para moverte (en realidad giras el planeta)
- Rueda del ratón o `+` / `−` para el zoom
- `E` o clic en el tooltip para interactuar
- `Esc` para cerrar una ficha
- En el móvil, joystick abajo a la izquierda y pellizco para el zoom

## Arrancarlo

```bash
npm install
npm run dev
npm run build
```

Tengo también un script que busca modelos GLB que ya no se usan (y los borra si le pasas `--delete`):

```bash
node scripts/find-unused-models.mjs
node scripts/find-unused-models.mjs --delete
```

## Con qué está hecho

React 19, Three.js, @react-three/fiber, drei, Rapier y Vite. Los modelos low-poly son de [Kenney](https://kenney.nl) (CC0).

## Estructura

```text
src/
  App.jsx                 # Canvas, HUD, modal y transiciones
  config/content.js       # Bio, proyectos y muebles del estudio
  config/map.js           # El pueblo: edificios, caminos, props, animales
  config/assets.js        # Precarga de los GLB
  scenes/VillageWorld.jsx # La isla
  scenes/InteriorWorld.jsx
```