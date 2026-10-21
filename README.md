# Portfolio 3D

Planeta esférico explorable, hecho con **React Three Fiber**, **Three.js** y **Rapier** (el interior).

El personaje se queda arriba y el planeta gira bajo sus pies, como el treadmill original. En la cima está el pueblo: edificios con ficha, estudio interior y ciclo día/noche. Edificios, árboles, vallas, farolas y animales tienen volumen: ni el personaje ni la fauna los atraviesan. El mar, por debajo de cierta latitud, tampoco se puede pisar.

## Cómo está organizado el mapa

Todo el layout vive en `src/config/map.js`:

| Export | Qué es |
| --- | --- |
| `buildings` | Casas, tiendas, rascacielos y los edificios con cartel (estudio, Portfolio 3D, Shelvingit y Streak365) |
| `paths` | Caminos de tierra. Cada punto es `[x, z]` |
| `lamps` | Farolas `[x, z]` |
| `fenceRuns` | Vallas, setos y cuerdas. `gate` abre un hueco |
| `props` | Árboles, sombrillas, cajas y demás, colocados a mano |
| `scatterZones` | Hierba, flores y rocas de relleno (semilla fija) |
| `animals` | Fauna y el radio por el que deambula |
| `PLAYER` / `ISLAND` | Escala, punto de aparición y tamaño de la isla |

`face(dx, dz)` calcula el giro para que la puerta (eje local +Z, con el modelo ya centrado en el suelo) mire hacia ese vector. `keep` es el radio libre de vegetación alrededor de un edificio.

Al pulsar «Entrar al planeta» la cámara empieza en el máximo alejamiento (zoom 2.55). Para encuadrar el mapa sin jugar: `?vista=mapa` (oblicua), `?vista=cenital` o `?vista=puerta` (a ras de suelo, mirando al norte). `?pies=x,z` pone los pies en ese punto del mapa y `?zoom=` cambia el encuadre (0.58 acerca, 2.55 aleja).

## Cómo añadir un proyecto

1. Añade la ficha en `projects` dentro de `src/config/content.js`.
2. En `buildings` (`src/config/map.js`) pon `action: 'openProject'`, `projectId`, `label`, `tooltip` y `marker: true`.
3. Opcional: alarga un camino en `paths` hasta la puerta.

El estudio (`action: 'enterHouse'`) abre el interior, que sigue definido en `interiorFurniture`.

## Controles

- **WASD / flechas:** girar el planeta (W trae lo que hay delante; la cámara se queda fija detrás del personaje)
- **Rueda del ratón:** acercar (arriba) y alejar (abajo) la cámara. También valen **+** y **−**
- **E** o clic en el tooltip: interactuar
- **Esc:** cerrar ficha
- En táctil: stick inferior izquierdo, y pellizco con dos dedos para el zoom

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
