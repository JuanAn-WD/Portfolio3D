# Portfolio 3D

Mi portfolio es un planeta pequeño que puedes recorrer. Está hecho con React Three Fiber y Three.js, y el interior del estudio usa Rapier para la física.

La idea viene del típico efecto "cinta de correr": el personaje no se mueve, lo que gira es el planeta. Arriba del todo está el pueblo, donde cada edificio tiene su ficha. También hay un estudio en el que puedes entrar, y un ciclo de día y noche.

Casi todo tiene colisión: edificios, árboles, vallas, farolas y animales. La hierba y las flores se pueden pisar, salvo en invierno, que las flores se convierten en piedras y frenan. Al mar tampoco se puede entrar.

## El mapa

Todo el pueblo está en `src/config/map.js`:

| Export | Qué hay |
| --- | --- |
| `buildings` | Casas, tiendas, rascacielos y los edificios de mis proyectos (estudio, Portfolio 3D, Shelvingit; Streak365 retirado por ahora) |
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

---

## Mi rol y uso de IA

Lo he diseñado y programado yo: la idea del planeta, el mapa, las escenas y la vista clásica. Los 15 commits son míos. Los modelos low-poly son de [Kenney](https://kenney.nl) (CC0).

Era mi primer proyecto con Three.js, así que usé la IA para aprender a desarrollar con Three.js y React Three Fiber. También la usé para depurar: con los errores que iban saliendo, me ayudaba a ir directo a donde estaba el fallo.

## Decisiones técnicas

- **Dos apps cargadas por separado** (`src/Root.jsx:16-17`, `lazy()`): la vista 3D y la clásica no se descargan juntas. Quien elige la clásica no paga el peso de Three.js.
- **El interior del estudio también se carga aparte** (`src/App.jsx:23`), solo cuando entras.
- **Instancias para lo que se repite** (`components/FlatInstances.jsx`, `Clouds.jsx:103`, `Fireflies.jsx:47`): un draw call por tipo de objeto en vez de uno por cada árbol o nube.
- **Liberar memoria de la GPU** al desmontar (`components/MapBuilding.jsx:197`, `texture.dispose()`).
- **Accesibilidad**: respeto `prefers-reduced-motion` (`helpers/usePrefersReducedMotion.js`), los loaders tienen `role="status"` y `aria-live` (`Root.jsx:50`) y hay una vista clásica sin 3D.
- **El mapa como datos** (`src/config/map.js`): añadir un edificio o un proyecto no requiere tocar los componentes.

## Stack

React · Vite · React Three Fiber · Three.js · Rapier · Tailwind CSS (vista clásica)

## Próximos pasos (deuda conocida)

- Tests de los helpers y de la configuración del mapa.
- Medir con Lighthouse y reducir el bundle principal y los assets más pesados de `dist`.
- Migración progresiva a TypeScript.

---

### English (short)

**My role & AI use.** Designed and built by me: concept, map, scenes and classic view (all 15 commits). The low-poly models are by [Kenney](https://kenney.nl) (CC0). It was my first Three.js project, so I used AI to learn Three.js/R3F and to debug errors faster by going straight to the failing spot.
**Key decisions.** Lazy-loaded 3D and classic apps; instancing; GPU disposal; reduced-motion and aria-live; data-driven map.
**Next steps.** Tests, Lighthouse and bundle size, TypeScript.

---

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
